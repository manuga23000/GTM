import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './firebase'

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

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
    const sanitizedPath = path
      .split('/')
      .map(segment => {
        if (segment.includes('.')) {
          const parts = segment.split('.')
          const name = sanitizeFileName(parts.slice(0, -1).join('.'))
          const extension = parts[parts.length - 1]
          return `${name}.${extension}`
        }
        return segment
      })
      .join('/')

    const storageRef = ref(storage, sanitizedPath)

    let thumbnailUrl: string | undefined
    let dimensions: { width: number; height: number } | undefined

    if (file.type.startsWith('image/')) {
      const { thumbnail, originalDimensions } = await generateThumbnail(file)
      dimensions = originalDimensions

      if (thumbnail) {
        const thumbnailPath = sanitizedPath.replace(/\.[^/.]+$/, '_thumb.jpg')
        const thumbnailRef = ref(storage, thumbnailPath)

        const thumbnailMetadata = {
          contentType: 'image/jpeg',
          customMetadata: {
            originalFile: sanitizedPath,
            type: 'thumbnail',
            uploadedAt: new Date().toISOString(),
          },
        }

        try {
          const thumbnailSnapshot = await uploadBytes(
            thumbnailRef,
            thumbnail,
            thumbnailMetadata
          )
          thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)
        } catch (thumbError) {
          console.warn(
            'Error uploading thumbnail, continuing without it:',
            thumbError
          )
        }
      }
    }

    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        sanitizedName: sanitizeFileName(file.name),
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        ...(dimensions && {
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
        }),
      },
    }

    if (onProgress) {
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

export async function deleteFileFromStorage(url: string): Promise<void> {
  try {
    const urlParts = url.split('/o/')
    if (urlParts.length < 2) return

    const pathPart = urlParts[1].split('?')[0]
    const filePath = decodeURIComponent(pathPart)

    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)

    if (!filePath.includes('_thumb.')) {
      try {
        const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg')
        const thumbnailRef = ref(storage, thumbnailPath)
        await deleteObject(thumbnailRef)
      } catch (error) {
        console.debug(
          'Thumbnail deletion failed (expected if no thumbnail exists):',
          error
        )
      }
    }
  } catch (error) {
    console.error('Error deleting file from storage:', error)
  }
}

export function generateUniqueFileName(
  originalName: string,
  vehiclePlate: string,
  stepId: string
): string {
  const timestamp = Date.now()
  const fileExtension = originalName.split('.').pop()?.toLowerCase()
  const cleanPlate = sanitizeFileName(vehiclePlate.replace(/\s+/g, ''))
  const sanitizedName = sanitizeFileName(originalName.split('.')[0])

  return `vehicles/${cleanPlate}/steps/${stepId}/${timestamp}_${sanitizedName}.${fileExtension}`
}

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

  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export function getFileType(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image'
}
