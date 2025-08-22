import { VehicleInput } from '../types/types'

// Interfaces específicas para datos de Firebase
interface FirebaseTimestamp {
  toDate(): Date
}

interface FirebaseDimensions {
  width: number
  height: number
}

interface FirebaseFile {
  id?: string
  fileName?: string
  type?: string
  url?: string
  thumbnailUrl?: string
  storageRef?: string
  uploadedAt?: FirebaseTimestamp | Date | string
  size?: number
  dimensions?: FirebaseDimensions
}

interface FirebaseStep {
  id?: string
  title?: string
  description?: string
  status?: string
  date?: FirebaseTimestamp | Date | string
  notes?: string
  files?: FirebaseFile[]
}

interface FirebaseVehicleData {
  plateNumber?: string
  brand?: string
  model?: string
  year?: number
  clientName?: string
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  totalCost?: number
  createdAt?: FirebaseTimestamp | Date
  estimatedCompletionDate?: FirebaseTimestamp | Date | null
  notes?: string
  nextStep?: string
  steps?: FirebaseStep[]
  [key: string]: unknown // Para permitir otros campos
}

/**
 * NUEVO: Validar datos antes de enviar a Firestore
 * Detecta valores undefined anidados
 */
export function validateFirestoreData(obj: unknown, path = ''): string[] {
  const errors: string[] = []

  if (obj === undefined) {
    errors.push(`Valor undefined en: ${path}`)
    return errors
  }

  if (obj === null || typeof obj !== 'object') {
    return errors
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      errors.push(...validateFirestoreData(item, `${path}[${index}]`))
    })
  } else {
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      if (value === undefined) {
        errors.push(`Valor undefined en: ${currentPath}`)
      } else {
        errors.push(...validateFirestoreData(value, currentPath))
      }
    })
  }

  return errors
}

/**
 * NUEVO: Limpiar datos de archivo para Firestore
 * Elimina campos undefined y valida tipos
 */
export function cleanStepFileForFirestore(file: FirebaseFile): Record<string, unknown> {
  const cleanFile: Record<string, unknown> = {
    id: file.id || '',
    fileName: file.fileName || 'archivo',
    type: file.type === 'video' ? 'video' : 'image',
    url: file.url || '',
    storageRef: file.storageRef || '',
    uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(),
    size: typeof file.size === 'number' ? file.size : 0,
  }

  // Solo agregar thumbnailUrl si existe y no es undefined
  if (file.thumbnailUrl && typeof file.thumbnailUrl === 'string') {
    cleanFile.thumbnailUrl = file.thumbnailUrl
  }

  // Solo agregar dimensions si es válido
  if (
    file.dimensions &&
    typeof file.dimensions === 'object' &&
    file.dimensions !== null &&
    typeof file.dimensions.width === 'number' &&
    typeof file.dimensions.height === 'number' &&
    file.dimensions.width > 0 &&
    file.dimensions.height > 0
  ) {
    cleanFile.dimensions = {
      width: file.dimensions.width,
      height: file.dimensions.height,
    }
  }

  return cleanFile
}

/**
 * NUEVO: Limpiar step completo para Firestore
 */
export function cleanStepForFirestore(step: FirebaseStep): Record<string, unknown> {
  const cleanStep: Record<string, unknown> = {
    id: step.id || '',
    title: step.title || '',
    description: step.description || '',
    status: step.status || 'completed',
    date: step.date instanceof Date ? step.date : new Date(),
    notes: step.notes || '',
  }

  // Limpiar archivos si existen
  if (Array.isArray(step.files) && step.files.length > 0) {
    cleanStep.files = step.files.map(cleanStepFileForFirestore)
  }

  return cleanStep
}

/**
 * Filtrar valores undefined para Firebase (MEJORADO - recursivo)
 */
export function filterUndefinedValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue // Saltar valores undefined y null
    }

    if (Array.isArray(value)) {
      // Filtrar arrays recursivamente
      const filteredArray = value
        .filter(item => item !== undefined && item !== null)
        .map(item => {
          if (typeof item === 'object' && item !== null) {
            return filterUndefinedValues(item as Record<string, unknown>)
          }
          return item
        })

      if (filteredArray.length > 0) {
        filtered[key] = filteredArray
      }
    } else if (typeof value === 'object' && value !== null) {
      // Filtrar objetos recursivamente
      const filteredObject = filterUndefinedValues(
        value as Record<string, unknown>
      )
      if (Object.keys(filteredObject).length > 0) {
        filtered[key] = filteredObject
      }
    } else {
      // Valores primitivos válidos
      filtered[key] = value
    }
  }

  return filtered
}

/**
 * Helper para verificar si un valor es un Timestamp de Firebase
 */
const isFirestoreTimestamp = (value: unknown): value is FirebaseTimestamp => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as FirebaseTimestamp).toDate === 'function'
  )
}

/**
 * Normalizar datos de vehículo desde Firebase
 * ACTUALIZADO: Maneja archivos de Storage en los steps
 */
export function normalizeVehicleData(data: FirebaseVehicleData): VehicleInput {
  return {
    plateNumber: data.plateNumber || '',
    brand: data.brand || undefined,
    model: data.model || undefined,
    year:
      typeof data.year === 'number'
        ? data.year
        : data.createdAt
        ? new Date(
            data.createdAt instanceof Date
              ? data.createdAt
              : isFirestoreTimestamp(data.createdAt)
              ? data.createdAt.toDate()
              : new Date()
          ).getFullYear()
        : new Date().getFullYear(),
    clientName: data.clientName || '',
    clientPhone: data.clientPhone || undefined,
    serviceType: data.serviceType || undefined,
    chassisNumber: data.chassisNumber || undefined,
    totalCost: typeof data.totalCost === 'number' ? data.totalCost : 0,
    createdAt:
      data.createdAt instanceof Date
        ? data.createdAt
        : isFirestoreTimestamp(data.createdAt)
        ? data.createdAt.toDate()
        : new Date(),
    estimatedCompletionDate: data.estimatedCompletionDate
      ? data.estimatedCompletionDate instanceof Date
        ? data.estimatedCompletionDate
        : isFirestoreTimestamp(data.estimatedCompletionDate)
        ? data.estimatedCompletionDate.toDate()
        : null
      : null,
    notes: data.notes || '',
    nextStep: data.nextStep || '',
    steps: Array.isArray(data.steps)
      ? data.steps.map((step: FirebaseStep) => ({
          id: typeof step.id === 'string' ? step.id : '',
          title: typeof step.title === 'string' ? step.title : '',
          description:
            typeof step.description === 'string' ? step.description : '',
          status: ['completed', 'pending', 'in-progress'].includes(step.status as string)
            ? (step.status as 'completed' | 'pending' | 'in-progress')
            : 'pending',
          date:
            step.date instanceof Date
              ? step.date
              : isFirestoreTimestamp(step.date)
              ? step.date.toDate()
              : step.date
              ? new Date(step.date as string)
              : new Date(), // SEGURO: Siempre devuelve una fecha válida
          notes: typeof step.notes === 'string' ? step.notes : '',
          // ACTUALIZADO: Normalizar archivos del step con thumbnails y dimensiones
          files: Array.isArray(step.files)
            ? step.files.map((file: FirebaseFile) => ({
                id: typeof file.id === 'string' ? file.id : '',
                fileName:
                  typeof file.fileName === 'string' ? file.fileName : 'archivo',
                type: ['image', 'video'].includes(file.type as string)
                  ? (file.type as 'image' | 'video')
                  : 'image',
                url: typeof file.url === 'string' ? file.url : '',
                thumbnailUrl:
                  typeof file.thumbnailUrl === 'string'
                    ? file.thumbnailUrl
                    : undefined, // NUEVO
                storageRef:
                  typeof file.storageRef === 'string' ? file.storageRef : '',
                uploadedAt:
                  file.uploadedAt instanceof Date
                    ? file.uploadedAt
                    : isFirestoreTimestamp(file.uploadedAt)
                    ? file.uploadedAt.toDate()
                    : file.uploadedAt
                    ? new Date(file.uploadedAt as string)
                    : new Date(),
                size: typeof file.size === 'number' ? file.size : 0,
                dimensions:
                  file.dimensions && 
                  typeof file.dimensions === 'object' &&
                  file.dimensions !== null &&
                  typeof file.dimensions.width === 'number' &&
                  typeof file.dimensions.height === 'number'
                    ? {
                        width: file.dimensions.width,
                        height: file.dimensions.height,
                      }
                    : undefined,
              }))
            : [],
        }))
      : typeof data.steps === 'object' && data.steps !== null
      ? Object.values(data.steps as Record<string, FirebaseStep>).map((step: FirebaseStep) => ({
          id: typeof step.id === 'string' ? step.id : '',
          title: typeof step.title === 'string' ? step.title : '',
          description:
            typeof step.description === 'string' ? step.description : '',
          status: ['completed', 'pending', 'in-progress'].includes(step.status as string)
            ? (step.status as 'completed' | 'pending' | 'in-progress')
            : 'pending',
          date:
            step.date instanceof Date
              ? step.date
              : isFirestoreTimestamp(step.date)
              ? step.date.toDate()
              : step.date
              ? new Date(step.date as string)
              : new Date(), // SEGURO: Siempre devuelve una fecha válida
          notes: typeof step.notes === 'string' ? step.notes : '',
          // ACTUALIZADO: Normalizar archivos del step (legacy) con thumbnails
          files: Array.isArray(step.files)
            ? step.files.map((file: FirebaseFile) => ({
                id: typeof file.id === 'string' ? file.id : '',
                fileName:
                  typeof file.fileName === 'string' ? file.fileName : 'archivo',
                type: ['image', 'video'].includes(file.type as string)
                  ? (file.type as 'image' | 'video')
                  : 'image',
                url: typeof file.url === 'string' ? file.url : '',
                thumbnailUrl:
                  typeof file.thumbnailUrl === 'string'
                    ? file.thumbnailUrl
                    : undefined, // NUEVO
                storageRef:
                  typeof file.storageRef === 'string' ? file.storageRef : '',
                uploadedAt:
                  file.uploadedAt instanceof Date
                    ? file.uploadedAt
                    : isFirestoreTimestamp(file.uploadedAt)
                    ? file.uploadedAt.toDate()
                    : file.uploadedAt
                    ? new Date(file.uploadedAt as string)
                    : new Date(),
                size: typeof file.size === 'number' ? file.size : 0,
                dimensions:
                  file.dimensions && 
                  typeof file.dimensions === 'object' &&
                  file.dimensions !== null &&
                  typeof file.dimensions.width === 'number' &&
                  typeof file.dimensions.height === 'number'
                    ? {
                        width: file.dimensions.width,
                        height: file.dimensions.height,
                      }
                    : undefined,
              }))
            : [],
        }))
      : [],
  }
}

/**
 * Formatear fecha para Firestore
 */
export function formatDateForFirestore(date: unknown): Date | null {
  if (!date) return null

  if (date instanceof Date) return date

  if (typeof date === 'string') {
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  // Si es Timestamp de Firestore
  if (isFirestoreTimestamp(date)) {
    return date.toDate()
  }

  return null
}

/**
 * NUEVO: Limpiar URLs temporales de archivos
 * Útil para evitar memory leaks
 */
export function cleanupTempUrls(files: { tempUrl?: string }[]): void {
  files.forEach(file => {
    if (file.tempUrl && file.tempUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.tempUrl)
    }
  })
}

/**
 * NUEVO: Convertir bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * NUEVO: Validar estructura de archivo del step
 */
export function isValidStepFile(file: unknown): boolean {
  if (!file || typeof file !== 'object') return false
  
  const f = file as Record<string, unknown>
  return (
    typeof f.id === 'string' &&
    typeof f.fileName === 'string' &&
    ['image', 'video'].includes(f.type as string) &&
    typeof f.url === 'string' &&
    typeof f.storageRef === 'string' &&
    (f.uploadedAt instanceof Date || typeof f.uploadedAt === 'string') &&
    typeof f.size === 'number'
  )
}

export interface AdminResponse {
  success: boolean
  message: string
  error?: string
}