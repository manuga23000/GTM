import { VehicleInput } from '../types/types'

// Interfaces for Firebase data structures
interface FirestoreTimestamp {
  toDate(): Date
}

interface RawFirestoreFile {
  id?: string
  fileName?: string
  type?: 'image' | 'video' | string
  url?: string
  thumbnailUrl?: string
  storageRef?: string
  uploadedAt?: Date | FirestoreTimestamp | string
  size?: number
  dimensions?: {
    width?: number
    height?: number
  }
}

interface RawFirestoreStep {
  id?: string
  title?: string
  description?: string
  notes?: string
  date?: Date | FirestoreTimestamp | string
  status?: string
  files?: RawFirestoreFile[]
}

interface CleanStepFile {
  id: string
  fileName: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  storageRef: string
  uploadedAt: Date
  size: number
  dimensions?: {
    width: number
    height: number
  }
}

interface CleanStep {
  id: string
  title: string
  status: 'completed' | 'pending' | 'in-progress'
  date: Date
  notes?: string
  files?: CleanStepFile[]
}

interface RawFirestoreVehicle {
  plateNumber?: string
  brand?: string
  model?: string
  year?: number
  clientName?: string
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  km?: number
  createdAt?: Date | FirestoreTimestamp | string
  estimatedCompletionDate?: Date | FirestoreTimestamp | string | null
  notes?: string
  nextStep?: string
  steps?: RawFirestoreStep[] | Record<string, RawFirestoreStep>
}

type ValidationObject = Record<string, unknown> | unknown[] | unknown

// Type guard for valid step status
function isValidStepStatus(
  status: unknown
): status is 'completed' | 'pending' | 'in-progress' {
  return (
    typeof status === 'string' &&
    ['completed', 'pending', 'in-progress'].includes(status as string)
  )
}

/**
 * NUEVO: Validar datos antes de enviar a Firestore
 * Detecta valores undefined anidados
 */
export function validateFirestoreData(
  obj: ValidationObject,
  path = ''
): string[] {
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
export function cleanStepFileForFirestore(
  file: RawFirestoreFile
): CleanStepFile {
  const cleanFile: CleanStepFile = {
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
export function cleanStepForFirestore(step: RawFirestoreStep): CleanStep {
  const cleanStep: CleanStep = {
    id: step.id || '',
    title: step.title || '',
    status: isValidStepStatus(step.status) ? step.status : 'pending',
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
 * Filtrar valores undefined para Firebase (CORREGIDO - conserva updatedAt)
 */
export function filterUndefinedValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // EXCEPCIÓN para fechas: conservar si son string (ISO) o Date
    if (
      (key === 'createdAt' ||
        key === 'estimatedCompletionDate' ||
        key === 'updatedAt') && // ← AGREGADO updatedAt
      (typeof value === 'string' || value instanceof Date)
    ) {
      filtered[key] = value
      continue
    }
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
 * Normalizar datos de vehículo desde Firebase
 * ACTUALIZADO: Maneja archivos de Storage en los steps
 */
export function normalizeVehicleData(data: RawFirestoreVehicle): VehicleInput {
  return {
    plateNumber: data.plateNumber || '',
    brand: data.brand,
    model: data.model,
    year:
      typeof data.year === 'number'
        ? data.year
        : data.createdAt
        ? new Date(
            data.createdAt instanceof Date
              ? data.createdAt
              : data.createdAt &&
                typeof data.createdAt === 'object' &&
                'toDate' in data.createdAt
              ? (data.createdAt as FirestoreTimestamp).toDate()
              : new Date()
          ).getFullYear()
        : new Date().getFullYear(),
    clientName: data.clientName || '',
    clientPhone: data.clientPhone,
    serviceType: data.serviceType,
    chassisNumber: data.chassisNumber,
    km: data.km || 0,
    createdAt:
      data.createdAt instanceof Date
        ? data.createdAt
        : data.createdAt &&
          typeof data.createdAt === 'object' &&
          'toDate' in data.createdAt
        ? (data.createdAt as FirestoreTimestamp).toDate()
        : new Date(),
    estimatedCompletionDate: data.estimatedCompletionDate
      ? data.estimatedCompletionDate instanceof Date
        ? data.estimatedCompletionDate
        : data.estimatedCompletionDate &&
          typeof data.estimatedCompletionDate === 'object' &&
          'toDate' in data.estimatedCompletionDate
        ? (data.estimatedCompletionDate as FirestoreTimestamp).toDate()
        : null
      : null,
    notes: data.notes || '',
    nextStep: data.nextStep || '',
    steps: Array.isArray(data.steps)
      ? data.steps.map((step: RawFirestoreStep) => ({
          id: typeof step.id === 'string' ? step.id : '',
          title: typeof step.title === 'string' ? step.title : '',
          description:
            typeof step.description === 'string' ? step.description : '',
          status: isValidStepStatus(step.status) ? step.status : 'pending',
          date:
            step.date instanceof Date
              ? step.date
              : step.date &&
                typeof step.date === 'object' &&
                'toDate' in step.date
              ? (step.date as FirestoreTimestamp).toDate()
              : step.date
              ? new Date(step.date as string)
              : new Date(), // SEGURO: Siempre devuelve una fecha válida
          notes: typeof step.notes === 'string' ? step.notes : '',
          // ACTUALIZADO: Normalizar archivos del step con thumbnails y dimensiones
          files: Array.isArray(step.files)
            ? step.files.map((file: RawFirestoreFile) => ({
                id: typeof file.id === 'string' ? file.id : '',
                fileName:
                  typeof file.fileName === 'string' ? file.fileName : 'archivo',
                type: ['image', 'video'].includes(file.type || '')
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
                    : file.uploadedAt &&
                      typeof file.uploadedAt === 'object' &&
                      'toDate' in file.uploadedAt
                    ? (file.uploadedAt as FirestoreTimestamp).toDate()
                    : file.uploadedAt
                    ? new Date(file.uploadedAt as string)
                    : new Date(),
                size: typeof file.size === 'number' ? file.size : 0,
                dimensions:
                  file.dimensions && typeof file.dimensions === 'object' // NUEVO
                    ? {
                        width:
                          typeof file.dimensions.width === 'number'
                            ? file.dimensions.width
                            : 0,
                        height:
                          typeof file.dimensions.height === 'number'
                            ? file.dimensions.height
                            : 0,
                      }
                    : undefined,
              }))
            : [],
        }))
      : typeof data.steps === 'object' && data.steps !== null
      ? Object.values(data.steps).map((step: RawFirestoreStep) => ({
          id: typeof step.id === 'string' ? step.id : '',
          title: typeof step.title === 'string' ? step.title : '',
          description:
            typeof step.description === 'string' ? step.description : '',
          status: isValidStepStatus(step.status) ? step.status : 'pending',
          date:
            step.date instanceof Date
              ? step.date
              : step.date &&
                typeof step.date === 'object' &&
                'toDate' in step.date
              ? (step.date as FirestoreTimestamp).toDate()
              : step.date
              ? new Date(step.date as string)
              : new Date(), // SEGURO: Siempre devuelve una fecha válida
          notes: typeof step.notes === 'string' ? step.notes : '',
          // ACTUALIZADO: Normalizar archivos del step (legacy) con thumbnails
          files: Array.isArray(step.files)
            ? step.files.map((file: RawFirestoreFile) => ({
                id: typeof file.id === 'string' ? file.id : '',
                fileName:
                  typeof file.fileName === 'string' ? file.fileName : 'archivo',
                type: ['image', 'video'].includes(file.type || '')
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
                    : file.uploadedAt &&
                      typeof file.uploadedAt === 'object' &&
                      'toDate' in file.uploadedAt
                    ? (file.uploadedAt as FirestoreTimestamp).toDate()
                    : file.uploadedAt
                    ? new Date(file.uploadedAt as string)
                    : new Date(),
                size: typeof file.size === 'number' ? file.size : 0,
                dimensions:
                  file.dimensions && typeof file.dimensions === 'object' // NUEVO
                    ? {
                        width:
                          typeof file.dimensions.width === 'number'
                            ? file.dimensions.width
                            : 0,
                        height:
                          typeof file.dimensions.height === 'number'
                            ? file.dimensions.height
                            : 0,
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
  if (typeof date === 'object' && date !== null && 'toDate' in date) {
    return (date as FirestoreTimestamp).toDate()
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
export function isValidStepFile(file: unknown): file is CleanStepFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    typeof (file as CleanStepFile).id === 'string' &&
    typeof (file as CleanStepFile).fileName === 'string' &&
    ['image', 'video'].includes((file as CleanStepFile).type) &&
    typeof (file as CleanStepFile).url === 'string' &&
    typeof (file as CleanStepFile).storageRef === 'string' &&
    ((file as CleanStepFile).uploadedAt instanceof Date ||
      typeof (file as CleanStepFile).uploadedAt === 'string') &&
    typeof (file as CleanStepFile).size === 'number'
  )
}

export interface AdminResponse {
  success: boolean
  message: string
  error?: string
}
