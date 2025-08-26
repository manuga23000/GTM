import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './firebase'

// DEBUG: Log de configuración inicial
console.log('🔧 Storage Utils cargado')
console.log('📦 Storage object:', storage)
console.log('🏪 Storage bucket:', storage.app.options.storageBucket)

/**
 * MEJORADO: Generar nombre de archivo seguro para URL
 */
function sanitizeFileName(fileName: string): string {
  const sanitized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplazar caracteres especiales
    .replace(/_{2,}/g, '_') // Evitar múltiples underscores
    .toLowerCase()

  console.log(`🧹 Sanitizando nombre: "${fileName}" → "${sanitized}"`)
  return sanitized
}

/**
 * Generar nombre único de archivo
 */
export function generateUniqueFileName(
  originalName: string,
  plateNumber: string,
  stepId: string
): string {
  const timestamp = Date.now()
  const sanitizedName = sanitizeFileName(originalName)
  const fileName = `vehicles/${plateNumber}/steps/${stepId}/${timestamp}_${sanitizedName}`

  console.log(`📝 Generando nombre único:`)
  console.log(`  - Original: ${originalName}`)
  console.log(`  - Patente: ${plateNumber}`)
  console.log(`  - Step ID: ${stepId}`)
  console.log(`  - Final: ${fileName}`)

  return fileName
}

/**
 * Validar tipo de archivo
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/quicktime',
  ]

  const isValid = allowedTypes.includes(file.type)
  console.log(
    `✅/❌ Validando tipo: ${file.type} → ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`
  )

  return isValid
}

/**
 * Validar tamaño de archivo
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const fileSizeMB = file.size / (1024 * 1024)
  const isValid = fileSizeMB <= maxSizeMB

  console.log(
    `📏 Validando tamaño: ${fileSizeMB.toFixed(2)}MB → ${
      isValid ? 'VÁLIDO' : 'INVÁLIDO'
    } (límite: ${maxSizeMB}MB)`
  )

  return isValid
}

/**
 * Obtener tipo de archivo
 */
export function getFileType(file: File): 'image' | 'video' {
  const type = file.type.startsWith('image/') ? 'image' : 'video'
  console.log(`🎭 Tipo de archivo: ${file.type} → ${type}`)
  return type
}

/**
 * NUEVO: Función para verificar si el error es de CORS
 */
function isCorsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorObj = error as Record<string, unknown>
  const message = typeof errorObj.message === 'string' ? errorObj.message : ''
  const code = typeof errorObj.code === 'string' ? errorObj.code : ''

  const isCors =
    message.includes('CORS') ||
    message.includes('Access to XMLHttpRequest') ||
    code === 'storage/cors-origin-not-allowed' ||
    message.includes('cross-origin')

  console.log(`🚫 ¿Es error CORS?: ${isCors}`)
  if (isCors) {
    console.log('❌ ERROR CORS DETECTADO:', error)
  }

  return isCors
}

/**
 * Generar thumbnail de imagen
 */
async function generateThumbnail(file: File): Promise<{
  thumbnail: Blob | null
  originalDimensions: { width: number; height: number }
}> {
  console.log(`🖼️ Generando thumbnail para: ${file.name}`)

  return new Promise(resolve => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      const originalDimensions = { width: img.width, height: img.height }
      console.log(
        `📐 Dimensiones originales: ${originalDimensions.width}x${originalDimensions.height}`
      )

      // Calcular dimensiones del thumbnail (máximo 150px)
      const maxSize = 150
      let { width, height } = originalDimensions

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      console.log(
        `🔍 Dimensiones thumbnail: ${Math.round(width)}x${Math.round(height)}`
      )

      // Generar thumbnail
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          console.log(
            `✅ Thumbnail generado: ${
              blob ? `${(blob.size / 1024).toFixed(2)}KB` : 'ERROR'
            }`
          )
          resolve({
            thumbnail: blob,
            originalDimensions,
          })
        },
        'image/jpeg',
        0.7
      )
    }

    img.onerror = () => {
      console.error('❌ Error generando thumbnail')
      resolve({
        thumbnail: null,
        originalDimensions: { width: 0, height: 0 },
      })
    }

    const tempUrl = URL.createObjectURL(file)
    console.log(`🔗 URL temporal creada: ${tempUrl}`)
    img.src = tempUrl
  })
}

/**
 * MEJORADO: Retry con exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  console.log(
    `🔄 Iniciando operación con retry (máximo ${maxRetries} intentos)`
  )

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🚀 Intento ${i + 1}/${maxRetries}`)
      const result = await operation()
      console.log(`✅ Operación exitosa en intento ${i + 1}`)
      return result
    } catch (error) {
      console.error(`❌ Error en intento ${i + 1}:`, error)

      if (i === maxRetries - 1 || !isCorsError(error)) {
        console.log(`🛑 Sin más reintentos o no es error CORS`)
        throw error
      }

      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
      console.log(
        `⏳ Esperando ${Math.round(delay)}ms antes del próximo intento...`
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Max retries reached')
}

/**
 * MEJORADO: Subir archivo con debug extensivo
 */
export async function uploadFileToStorage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{
  url: string
  thumbnailUrl?: string
  metadata: {
    name: string
    size: number
    type: string
    lastModified: number
    dimensions?: { width: number; height: number }
  }
}> {
  console.log(`\n🚀 === INICIANDO UPLOAD ===`)
  console.log(`📁 Archivo: ${file.name}`)
  console.log(`📏 Tamaño: ${(file.size / 1024).toFixed(2)}KB`)
  console.log(`🎭 Tipo: ${file.type}`)
  console.log(`📍 Path destino: ${path}`)
  console.log(`🏪 Bucket configurado: ${storage.app.options.storageBucket}`)

  try {
    // Validaciones iniciales
    console.log(`\n🔍 === VALIDACIONES ===`)
    if (!validateFileType(file)) {
      throw new Error(`Tipo de archivo no permitido: ${file.type}`)
    }
    if (!validateFileSize(file, 10)) {
      throw new Error(
        `Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      )
    }

    // Sanitizar el path
    console.log(`\n🧹 === SANITIZANDO PATH ===`)
    const sanitizedPath = path
      .split('/')
      .map(segment => {
        if (segment.includes('.')) {
          const parts = segment.split('.')
          const name = sanitizeFileName(parts.slice(0, -1).join('.'))
          const extension = parts[parts.length - 1].toLowerCase()
          return `${name}.${extension}`
        }
        return sanitizeFileName(segment)
      })
      .join('/')

    console.log(`📍 Path sanitizado: ${sanitizedPath}`)

    // Crear referencia Storage
    console.log(`\n📦 === CREANDO REFERENCIA STORAGE ===`)
    const storageRef = ref(storage, sanitizedPath)
    console.log(`🔗 Referencia creada para: ${sanitizedPath}`)
    console.log(`🏪 Bucket de la referencia: ${storageRef.bucket}`)

    // Generar thumbnail si es imagen
    let thumbnailUrl: string | undefined
    let dimensions: { width: number; height: number } | undefined

    if (file.type.startsWith('image/')) {
      console.log(`\n🖼️ === GENERANDO THUMBNAIL ===`)
      const { thumbnail, originalDimensions } = await generateThumbnail(file)
      dimensions = originalDimensions

      if (thumbnail) {
        const thumbnailPath = sanitizedPath.replace(/(\.[^.]+)$/, '_thumb$1')
        console.log(`📍 Path thumbnail: ${thumbnailPath}`)

        const thumbnailRef = ref(storage, thumbnailPath)
        console.log(`🔗 Referencia thumbnail creada`)

        try {
          console.log(`📤 Subiendo thumbnail...`)
          const thumbnailSnapshot = await retryWithBackoff(() =>
            uploadBytes(thumbnailRef, thumbnail)
          )
          console.log(`✅ Thumbnail subido`)

          console.log(`🔗 Obteniendo URL del thumbnail...`)
          thumbnailUrl = await retryWithBackoff(() =>
            getDownloadURL(thumbnailSnapshot.ref)
          )
          console.log(`✅ URL thumbnail obtenida: ${thumbnailUrl}`)
        } catch (error) {
          console.warn('⚠️ Error creando thumbnail, continuando sin él:', error)
        }
      }
    }

    // Metadata del archivo
    console.log(`\n📋 === PREPARANDO METADATA ===`)
    const metadata = {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        originalName: file.name,
        uploadDate: new Date().toISOString(),
        fileSize: file.size.toString(),
        ...(dimensions && {
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
        }),
      },
    }
    console.log(`📋 Metadata preparado:`, metadata)

    // Upload principal
    console.log(`\n📤 === SUBIENDO ARCHIVO PRINCIPAL ===`)

    if (onProgress) {
      console.log(`📊 Upload con seguimiento de progreso`)
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata)

        console.log(`🚀 Task de upload creado`)

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log(
              `📊 Progreso: ${Math.round(progress)}% (${
                snapshot.bytesTransferred
              }/${snapshot.totalBytes} bytes)`
            )
            onProgress(Math.round(progress))

            if (progress === 100) {
              console.log(`✅ Upload completado, obteniendo URL...`)
            }
          },
          async (error: unknown) => {
            const errorObj = error as Record<string, unknown>
            const message =
              typeof errorObj.message === 'string'
                ? errorObj.message
                : 'unknown error'
            const code =
              typeof errorObj.code === 'string' ? errorObj.code : 'unknown'
            const name =
              typeof errorObj.name === 'string' ? errorObj.name : 'unknown'
            const stack =
              typeof errorObj.stack === 'string' ? errorObj.stack : 'no stack'

            console.error('❌ Error durante upload:', error)
            console.error('🔍 Detalles del error:', {
              code,
              message,
              name,
              stack,
            })

            if (isCorsError(error)) {
              console.log(
                '🔄 Error CORS detectado, reintentando con método simple...'
              )
              try {
                const result = await retryWithBackoff(async () => {
                  console.log(`🔄 Reintento: upload simple`)
                  const snapshot = await uploadBytes(storageRef, file, metadata)
                  console.log(`🔄 Reintento: obteniendo URL`)
                  const downloadURL = await getDownloadURL(snapshot.ref)
                  return downloadURL
                })

                console.log(`✅ Reintento exitoso: ${result}`)
                resolve({
                  url: result,
                  thumbnailUrl,
                  metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    dimensions,
                  },
                })
              } catch (retryError) {
                console.error('❌ Reintento falló:', retryError)
                reject(retryError)
              }
            } else {
              reject(error)
            }
          },
          async () => {
            try {
              console.log(`🔗 Obteniendo URL de descarga...`)
              const downloadURL = await retryWithBackoff(() =>
                getDownloadURL(uploadTask.snapshot.ref)
              )

              console.log(`✅ Upload completamente exitoso: ${downloadURL}`)

              resolve({
                url: downloadURL,
                thumbnailUrl,
                metadata: {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified,
                  dimensions,
                },
              })
            } catch (error) {
              console.error('❌ Error obteniendo URL final:', error)
              reject(error)
            }
          }
        )
      })
    } else {
      // Upload simple
      console.log(`📤 Upload simple (sin progreso)`)
      const snapshot = await retryWithBackoff(() => {
        console.log(`📤 Ejecutando uploadBytes...`)
        return uploadBytes(storageRef, file, metadata)
      })

      console.log(`✅ Archivo subido, obteniendo URL...`)
      const downloadURL = await retryWithBackoff(() => {
        console.log(`🔗 Ejecutando getDownloadURL...`)
        return getDownloadURL(snapshot.ref)
      })

      console.log(`✅ Upload simple exitoso: ${downloadURL}`)

      return {
        url: downloadURL,
        thumbnailUrl,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          dimensions,
        },
      }
    }
  } catch (error: unknown) {
    console.error('\n❌ === ERROR FINAL ===')
    console.error('🔥 Error uploading file to storage:', error)

    const errorObj = error as Record<string, unknown>
    const message =
      typeof errorObj.message === 'string' ? errorObj.message : 'unknown error'
    const code = typeof errorObj.code === 'string' ? errorObj.code : 'unknown'
    const name = typeof errorObj.name === 'string' ? errorObj.name : 'unknown'
    const stack =
      typeof errorObj.stack === 'string' ? errorObj.stack : 'no stack'

    console.error('🔍 Detalles completos del error:', {
      code,
      message,
      name,
      stack,
    })

    if (isCorsError(error)) {
      console.error('🚫 ERROR CORS - Información adicional:')
      console.error(`   - Origin actual: ${window.location.origin}`)
      console.error(
        `   - Bucket configurado: ${storage.app.options.storageBucket}`
      )
      console.error('   - ¿Aplicaste CORS al bucket correcto?')

      const errorObj = error as Record<string, unknown>
      const message =
        typeof errorObj.message === 'string'
          ? errorObj.message
          : 'unknown error'

      throw new Error(
        `Error CORS: Verifica la configuración CORS del bucket. Bucket actual: ${storage.app.options.storageBucket}. Error: ${message}`
      )
    }

    throw error
  }
}

/**
 * MEJORADO: Eliminar archivos con debug
 */
export async function deleteFileFromStorage(url: string): Promise<void> {
  console.log(`\n🗑️ === ELIMINANDO ARCHIVO ===`)
  console.log(`🔗 URL a eliminar: ${url}`)

  try {
    // Extraer path de la URL
    const urlParts = url.split('/o/')
    if (urlParts.length < 2) {
      console.warn('⚠️ URL inválida para eliminar:', url)
      return
    }

    const pathPart = urlParts[1].split('?')[0]
    const filePath = decodeURIComponent(pathPart)
    console.log(`📍 Path extraído: ${filePath}`)

    // Eliminar archivo principal
    const storageRef = ref(storage, filePath)
    console.log(`🗑️ Eliminando archivo principal...`)
    await retryWithBackoff(() => deleteObject(storageRef))
    console.log(`✅ Archivo principal eliminado`)

    // Intentar eliminar thumbnail si existe
    if (!filePath.includes('_thumb.')) {
      try {
        const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1')
        console.log(`🗑️ Intentando eliminar thumbnail: ${thumbnailPath}`)

        const thumbnailRef = ref(storage, thumbnailPath)
        await retryWithBackoff(() => deleteObject(thumbnailRef))
        console.log(`✅ Thumbnail eliminado`)
      } catch (error) {
        console.log('ℹ️ No se encontró thumbnail (normal)')
      }
    }

    console.log(`✅ Eliminación completa`)
  } catch (error: unknown) {
    const errorObj = error as Record<string, unknown>
    const code = typeof errorObj.code === 'string' ? errorObj.code : ''

    if (code === 'storage/object-not-found') {
      console.log('ℹ️ Archivo no encontrado (posiblemente ya eliminado)')
      return
    }

    console.error('❌ Error eliminando archivo:', error)
    throw error
  }
}
