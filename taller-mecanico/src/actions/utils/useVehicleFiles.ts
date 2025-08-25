import { useState, useCallback, useRef, useEffect } from 'react'
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
  getFileType,
} from '@/lib/storageUtils'
import { StepFile, PendingStepFile } from '@/actions/types/types'

interface UseVehicleFilesOptions {
  plateNumber: string
  maxFilesPerStep?: number
  maxFileSize?: number // en MB
  allowMultipleVideos?: boolean
}

export interface UseVehicleFilesReturn {
  pendingFiles: Map<string, PendingStepFile[]>
  uploadFiles: (stepId: string, files: File[]) => Promise<StepFile[]>
  removePendingFile: (stepId: string, fileId: string) => void
  removeUploadedFile: (file: StepFile) => Promise<void>
  isUploading: (stepId: string) => boolean
  getUploadProgress: (stepId: string, fileId: string) => number
  clearPendingFiles: (stepId: string) => void
  cleanup: () => void
}

export function useVehicleFiles({
  plateNumber,
  maxFilesPerStep = 3,
  maxFileSize = 10,
  allowMultipleVideos = false,
}: UseVehicleFilesOptions): UseVehicleFilesReturn {
  const [pendingFiles, setPendingFiles] = useState<
    Map<string, PendingStepFile[]>
  >(new Map())
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = useCallback(() => {
    // Abortar uploads en progreso
    abortControllersRef.current.forEach(controller => {
      controller.abort()
    })
    abortControllersRef.current.clear()

    // Limpiar URLs temporales
    pendingFiles.forEach(stepFiles => {
      stepFiles.forEach(file => {
        if (file.tempUrl) {
          URL.revokeObjectURL(file.tempUrl)
        }
      })
    })
    setPendingFiles(new Map())
  }, [pendingFiles])

  const validateFiles = useCallback(
    (
      files: File[],
      currentFileCount: number,
      hasVideo: boolean
    ): { validFiles: File[]; errors: string[] } => {
      const validFiles: File[] = []
      const errors: string[] = []

      for (const file of files) {
        // Verificar límite de archivos
        if (currentFileCount + validFiles.length >= maxFilesPerStep) {
          errors.push(`Máximo ${maxFilesPerStep} archivos por trabajo`)
          break
        }

        // Validar tipo
        if (!validateFileType(file)) {
          errors.push(`${file.name}: Tipo de archivo no permitido`)
          continue
        }

        // Validar tamaño
        if (!validateFileSize(file, maxFileSize)) {
          errors.push(
            `${file.name}: Tamaño muy grande (máximo ${maxFileSize}MB)`
          )
          continue
        }

        // Validar video único
        const isVideo = getFileType(file) === 'video'
        if (
          isVideo &&
          !allowMultipleVideos &&
          (hasVideo || validFiles.some(f => getFileType(f) === 'video'))
        ) {
          errors.push(`Solo se permite un video por trabajo`)
          continue
        }

        validFiles.push(file)
      }

      return { validFiles, errors }
    },
    [maxFilesPerStep, maxFileSize, allowMultipleVideos]
  )

  const uploadFiles = useCallback(
    async (stepId: string, files: File[]): Promise<StepFile[]> => {
      if (!files.length) return []

      // Crear archivos pendientes
      const newPendingFiles: PendingStepFile[] = files.map(file => ({
        id: Date.now().toString() + Math.random(),
        file,
        type: getFileType(file),
        tempUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        uploading: true,
      }))

      // Agregar a pendientes
      setPendingFiles(prev => {
        const newMap = new Map(prev)
        const existingFiles = newMap.get(stepId) || []
        newMap.set(stepId, [...existingFiles, ...newPendingFiles])
        return newMap
      })

      const uploadedFiles: StepFile[] = []

      // Subir archivos uno por uno
      for (const pendingFile of newPendingFiles) {
        try {
          const abortController = new AbortController()
          abortControllersRef.current.set(pendingFile.id, abortController)

          const fileName = generateUniqueFileName(
            pendingFile.file.name,
            plateNumber,
            stepId
          )

          const uploadResult = await uploadFileToStorage(
            pendingFile.file,
            fileName,
            progress => {
              // Actualizar progreso
              setPendingFiles(prev => {
                const newMap = new Map(prev)
                const stepFiles = newMap.get(stepId) || []
                const updatedFiles = stepFiles.map(pf =>
                  pf.id === pendingFile.id
                    ? { ...pf, uploadProgress: progress }
                    : pf
                )
                newMap.set(stepId, updatedFiles)
                return newMap
              })
            }
          )

          // Archivo subido exitosamente - FIXED: destructure the upload result
          const uploadedFile: StepFile = {
            id: pendingFile.id,
            fileName: pendingFile.file.name,
            type: pendingFile.type,
            url: uploadResult.url, // Extract the URL string from the result
            thumbnailUrl: uploadResult.thumbnailUrl, // Include thumbnail if available
            storageRef: fileName,
            uploadedAt: new Date(),
            size: pendingFile.file.size,
            // Include dimensions from metadata if available
            dimensions: uploadResult.metadata.dimensions,
          }

          uploadedFiles.push(uploadedFile)

          // Remover de pendientes
          setPendingFiles(prev => {
            const newMap = new Map(prev)
            const stepFiles = newMap.get(stepId) || []
            const filteredFiles = stepFiles.filter(
              pf => pf.id !== pendingFile.id
            )
            if (filteredFiles.length === 0) {
              newMap.delete(stepId)
            } else {
              newMap.set(stepId, filteredFiles)
            }
            return newMap
          })

          // Limpiar URL temporal
          URL.revokeObjectURL(pendingFile.tempUrl)
          abortControllersRef.current.delete(pendingFile.id)
        } catch (error) {
          console.error('Error uploading file:', error)

          // Marcar como error
          setPendingFiles(prev => {
            const newMap = new Map(prev)
            const stepFiles = newMap.get(stepId) || []
            const updatedFiles = stepFiles.map(pf =>
              pf.id === pendingFile.id
                ? { ...pf, uploading: false, error: 'Error al subir archivo' }
                : pf
            )
            newMap.set(stepId, updatedFiles)
            return newMap
          })
        }
      }

      return uploadedFiles
    },
    [plateNumber]
  )

  const removePendingFile = useCallback((stepId: string, fileId: string) => {
    setPendingFiles(prev => {
      const newMap = new Map(prev)
      const stepFiles = newMap.get(stepId) || []

      // Encontrar archivo para limpiar URL temporal
      const fileToRemove = stepFiles.find(f => f.id === fileId)
      if (fileToRemove?.tempUrl) {
        URL.revokeObjectURL(fileToRemove.tempUrl)
      }

      // Abortar upload si está en progreso
      const abortController = abortControllersRef.current.get(fileId)
      if (abortController) {
        abortController.abort()
        abortControllersRef.current.delete(fileId)
      }

      const filteredFiles = stepFiles.filter(f => f.id !== fileId)
      if (filteredFiles.length === 0) {
        newMap.delete(stepId)
      } else {
        newMap.set(stepId, filteredFiles)
      }
      return newMap
    })
  }, [])

  const removeUploadedFile = useCallback(async (file: StepFile) => {
    try {
      await deleteFileFromStorage(file.url)
    } catch (error) {
      console.error('Error deleting file from storage:', error)
      throw error
    }
  }, [])

  const isUploading = useCallback(
    (stepId: string): boolean => {
      const stepFiles = pendingFiles.get(stepId) || []
      return stepFiles.some(file => file.uploading)
    },
    [pendingFiles]
  )

  const getUploadProgress = useCallback(
    (stepId: string, fileId: string): number => {
      const stepFiles = pendingFiles.get(stepId) || []
      const file = stepFiles.find(f => f.id === fileId)
      return file?.uploadProgress || 0
    },
    [pendingFiles]
  )

  const clearPendingFiles = useCallback(
    (stepId: string) => {
      const stepFiles = pendingFiles.get(stepId) || []

      // Limpiar URLs temporales
      stepFiles.forEach(file => {
        if (file.tempUrl) {
          URL.revokeObjectURL(file.tempUrl)
        }
      })

      // Abortar uploads
      stepFiles.forEach(file => {
        const abortController = abortControllersRef.current.get(file.id)
        if (abortController) {
          abortController.abort()
          abortControllersRef.current.delete(file.id)
        }
      })

      setPendingFiles(prev => {
        const newMap = new Map(prev)
        newMap.delete(stepId)
        return newMap
      })
    },
    [pendingFiles]
  )

  return {
    pendingFiles,
    uploadFiles,
    removePendingFile,
    removeUploadedFile,
    isUploading,
    getUploadProgress,
    clearPendingFiles,
    cleanup,
  }
}