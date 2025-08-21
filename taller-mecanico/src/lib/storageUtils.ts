import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './firebase'

/**
 * Generar thumbnail de imagen
 * @param file Archivo de imagen
 * @returns Thumbnail como Blob y dimensiones originales
 */
async function generateThumbnail(file: File): Promise<{
  thumbnail: Blob | null
  originalDimensions: { width: number; height: number }
}> {
  return new Promise(resolve => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      const originalDimensions = { width: img.width, height: img.height }

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

      // Generar thumbnail
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
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
      resolve({
        thumbnail: null,
        originalDimensions: { width: 0, height: 0 },
      })
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Subir archivo a Firebase Storage con metadata
 * @param file Archivo a subir
 * @param path Ruta donde guardar el archivo
 * @param onProgress Callback opcional para mostrar progreso
 * @returns Objeto con URL, metadata y thumbnail
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
  try {
    const storageRef = ref(storage, path)

    // Generar thumbnail si es imagen
    let thumbnailUrl: string | undefined
    let dimensions: { width: number; height: number } | undefined

    if (file.type.startsWith('image/')) {
      const { thumbnail, originalDimensions } = await generateThumbnail(file)
      dimensions = originalDimensions

      if (thumbnail) {
        // Subir thumbnail
        const thumbnailPath = path.replace(/\.[^/.]+$/, '_thumb.jpg')
        const thumbnailRef = ref(storage, thumbnailPath)
        const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnail)
        thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)
      }
    }

    // Metadata del archivo
    const metadata = {
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        ...(dimensions && {
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
        }),
      },
      contentType: file.type,
    }

    if (onProgress) {
      // Usar uploadBytesResumable para obtener progreso
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress(progress)
          },
          error => {
            console.error('Error uploading file:', error)
            reject(error)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
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
              reject(error)
            }
          }
        )
      })
    } else {
      // Upload simple sin progreso
      const snapshot = await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(snapshot.ref)
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
  } catch (error) {
    console.error('Error uploading file to storage:', error)
    throw error
  }
}

/**
 * Eliminar archivo de Storage (incluyendo thumbnail si existe)
 * @param url URL del archivo a eliminar
 */
export async function deleteFileFromStorage(url: string): Promise<void> {
  try {
    // Extraer la ruta del archivo de la URL
    const urlParts = url.split('/o/')
    if (urlParts.length < 2) return

    const pathPart = urlParts[1].split('?')[0]
    const filePath = decodeURIComponent(pathPart)

    // Eliminar archivo principal
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)

    // Eliminar thumbnail si existe
    if (!filePath.includes('_thumb.')) {
      try {
        const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg')
        const thumbnailRef = ref(storage, thumbnailPath)
        await deleteObject(thumbnailRef)
      } catch (error) {
        // Thumbnail no existe, continuar
      }
    }
  } catch (error) {
    console.error('Error deleting file from storage:', error)
    // No lanzamos error para evitar que falle el proceso si el archivo ya no existe
  }
}

/**
 * Generar nombre único para archivo
 * @param originalName Nombre original del archivo
 * @param vehiclePlate Patente del vehículo
 * @param stepId ID del paso
 * @returns Nombre único para el archivo
 */
export function generateUniqueFileName(
  originalName: string,
  vehiclePlate: string,
  stepId: string
): string {
  const timestamp = Date.now()
  const fileExtension = originalName.split('.').pop()
  const cleanPlate = vehiclePlate.replace(/\s+/g, '').toUpperCase()

  return `vehicles/${cleanPlate}/steps/${stepId}/${timestamp}.${fileExtension}`
}

/**
 * Validar tipo de archivo
 * @param file Archivo a validar
 * @returns true si es válido
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Videos
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/quicktime',
  ]

  return allowedTypes.includes(file.type)
}

/**
 * Validar tamaño de archivo
 * @param file Archivo a validar
 * @param maxSizeMB Tamaño máximo en MB
 * @returns true si es válido
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Obtener tipo de archivo (image/video)
 * @param file Archivo
 * @returns 'image' | 'video'
 */
export function getFileType(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image'
}
