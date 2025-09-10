import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface StepFile {
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

export interface TrabajoRealizado {
  id: string
  titulo: string
  descripcion?: string
  fecha: string
  archivos: StepFile[]
}

interface FirestoreFile {
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

interface FirestoreStep {
  id?: string
  title?: string
  description?: string
  notes?: string
  date?: Date | FirestoreTimestamp | string
  status?: string
  files?: FirestoreFile[]
}

interface FirestoreTimestamp {
  toDate(): Date
}

export interface TimelineItem {
  id: number
  fecha: string
  hora: string
  estado: string
  descripcion: string
  completado: boolean
}

export interface ImagenItem {
  id: number
  url: string
  fecha: string
  descripcion: string
  tipo: 'antes' | 'proceso' | 'despues'
}

export interface SeguimientoData {
  patente: string
  modelo: string
  marca: string
  año: string
  cliente: string
  fechaIngreso: string
  estadoActual?: string
  telefono?: string
  tipoServicio?: string
  trabajosRealizados?: TrabajoRealizado[]
  proximoPaso?: string
  fechaEstimadaEntrega?: string
  timeline?: TimelineItem[]
  imagenes?: ImagenItem[]
  updatedAt?: string
  serviceNumber?: number
  fechaFinalizado?: string
  km?: number
}

/**
 * Obtiene los datos de seguimiento de un vehículo por patente
 * @param patente Patente del vehículo (debe coincidir con el ID del documento)
 * @returns Datos del vehículo o null si no existe
 */
export async function getSeguimientoByPatente(
  patente: string
): Promise<SeguimientoData | null> {
  try {
    const patenteNormalizada = patente.toUpperCase().trim()

    const docRef = doc(db, 'vehicles', patenteNormalizada)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()

    const isFirestoreTimestamp = (
      value: unknown
    ): value is FirestoreTimestamp => {
      return (
        typeof value === 'object' &&
        value !== null &&
        'toDate' in value &&
        typeof (value as Record<string, unknown>).toDate === 'function'
      )
    }

    const formatearFecha = (timestamp: unknown): string => {
      if (!timestamp) return new Date().toISOString()

      if (isFirestoreTimestamp(timestamp)) {
        return timestamp.toDate().toISOString()
      }

      if (typeof timestamp === 'string') {
        return new Date(timestamp).toISOString()
      }

      if (timestamp instanceof Date) {
        return timestamp.toISOString()
      }

      return new Date().toISOString()
    }

    const mapearTrabajosRealizados = (
      steps: FirestoreStep[]
    ): TrabajoRealizado[] => {
      if (!Array.isArray(steps) || steps.length === 0) {
        return []
      }

      return steps
        .filter(step => step && step.title)
        .map((step, index) => ({
          id: step.id || `step-${index}`,
          titulo: step.title || 'Trabajo sin título',
          descripcion: step.description || step.notes,
          fecha: formatearFecha(step.date),
          archivos: Array.isArray(step.files)
            ? step.files.map((file: FirestoreFile) => ({
                id: file.id || `file-${Math.random()}`,
                fileName: file.fileName || 'archivo',
                type: file.type === 'video' ? 'video' : 'image',
                url: file.url || '',
                thumbnailUrl: file.thumbnailUrl,
                storageRef: file.storageRef || '',
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
                  file.dimensions && typeof file.dimensions === 'object'
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
    }

    const seguimientoData: SeguimientoData = {
      patente: data.plateNumber || patenteNormalizada,
      modelo: data.model || 'No especificado',
      marca: data.brand || 'No especificada',
      año: data.year ? String(data.year) : 'No especificado',
      cliente: data.clientName || 'Cliente',
      fechaIngreso: formatearFecha(data.createdAt),
      estadoActual: data.status || 'received',
      telefono: data.clientPhone || '',
      tipoServicio: data.serviceType || 'Reparación general',
      trabajosRealizados: Array.isArray(data.steps)
        ? mapearTrabajosRealizados(data.steps as FirestoreStep[])
        : data.trabajosRealizados || [],
      proximoPaso: data.nextStep || data.proximoPaso || '',
      fechaEstimadaEntrega: data.estimatedCompletionDate
        ? formatearFecha(data.estimatedCompletionDate)
        : data.fechaEstimadaEntrega
        ? formatearFecha(data.fechaEstimadaEntrega)
        : '',

      updatedAt: (() => {
        const updateField = data.updatedAt || data.createdAt

        if (!updateField) {
          return new Date().toISOString()
        }

        if (isFirestoreTimestamp(updateField)) {
          return updateField.toDate().toISOString()
        }

        if (typeof updateField === 'string') {
          return new Date(updateField).toISOString()
        }

        if (updateField instanceof Date) {
          return updateField.toISOString()
        }

        return new Date().toISOString()
      })(),

      timeline: Array.isArray(data.steps)
        ? (data.steps as FirestoreStep[]).map(
            (step: FirestoreStep, idx: number) => ({
              id: idx + 1,
              fecha: step.date
                ? step.date instanceof Date
                  ? step.date.toISOString().split('T')[0]
                  : step.date &&
                    typeof step.date === 'object' &&
                    'toDate' in step.date
                  ? (step.date as FirestoreTimestamp)
                      .toDate()
                      .toISOString()
                      .split('T')[0]
                  : typeof step.date === 'string'
                  ? new Date(step.date).toISOString().split('T')[0]
                  : ''
                : '',
              hora: step.date
                ? step.date instanceof Date
                  ? step.date.toTimeString().slice(0, 5)
                  : step.date &&
                    typeof step.date === 'object' &&
                    'toDate' in step.date
                  ? (step.date as FirestoreTimestamp)
                      .toDate()
                      .toTimeString()
                      .slice(0, 5)
                  : typeof step.date === 'string'
                  ? new Date(step.date).toTimeString().slice(0, 5)
                  : ''
                : '',
              estado: step.status || 'pendiente',
              descripcion: step.title || step.description || '',
              completado: step.status === 'completed',
            })
          )
        : data.timeline || [],
      imagenes: data.imagenes || [],
      km: data.km,
    }

    return seguimientoData
  } catch (error) {
    console.error('Error obteniendo seguimiento de Firebase:', error)

    return null
  }
}

/**
 * NUEVO: Buscar todos los servicios históricos de una patente
 * @param patente Patente del vehículo
 * @returns Array de servicios históricos ordenados por más reciente primero
 */
export async function buscarHistorialCompleto(
  patente: string
): Promise<SeguimientoData[]> {
  try {
    const patenteNormalizada = patente.toUpperCase().trim()
    const patenteSinEspacios = patenteNormalizada.replace(/\s+/g, '')

    const queries = [
      query(
        collection(db, 'timeline'),
        where('plateNumber', '==', patenteNormalizada),
        orderBy('serviceNumber', 'desc')
      ),
      query(
        collection(db, 'timeline'),
        where('plateNumber', '==', patenteSinEspacios),
        orderBy('serviceNumber', 'desc')
      ),
    ]

    const queryResults = await Promise.all(queries.map(q => getDocs(q)))
    const historial: SeguimientoData[] = []

    const allDocs: QueryDocumentSnapshot<DocumentData>[] = []
    for (const querySnapshot of queryResults) {
      querySnapshot.forEach(doc => {
        if (!allDocs.some(existingDoc => existingDoc.id === doc.id)) {
          allDocs.push(doc)
        }
      })
    }

    allDocs.forEach(doc => {
      const data = doc.data()

      const isFirestoreTimestamp = (
        value: unknown
      ): value is FirestoreTimestamp => {
        return (
          typeof value === 'object' &&
          value !== null &&
          'toDate' in value &&
          typeof (value as Record<string, unknown>).toDate === 'function'
        )
      }

      const formatearFecha = (timestamp: unknown): string => {
        if (!timestamp) return new Date().toISOString()

        if (isFirestoreTimestamp(timestamp)) {
          return timestamp.toDate().toISOString()
        }

        if (typeof timestamp === 'string') {
          return new Date(timestamp).toISOString()
        }

        if (timestamp instanceof Date) {
          return timestamp.toISOString()
        }

        return new Date().toISOString()
      }

      const mapearTrabajosRealizados = (
        steps: FirestoreStep[]
      ): TrabajoRealizado[] => {
        if (!Array.isArray(steps) || steps.length === 0) {
          return []
        }

        return steps
          .filter(step => step && step.title)
          .map((step, index) => ({
            id: step.id || `step-${index}`,
            titulo: step.title || 'Trabajo sin título',
            descripcion: step.description || step.notes,
            fecha: formatearFecha(step.date),
            archivos: Array.isArray(step.files)
              ? step.files.map((file: FirestoreFile) => ({
                  id: file.id || `file-${Math.random()}`,
                  fileName: file.fileName || 'archivo',
                  type: file.type === 'video' ? 'video' : 'image',
                  url: file.url || '',
                  thumbnailUrl: file.thumbnailUrl,
                  storageRef: file.storageRef || '',
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
                    file.dimensions && typeof file.dimensions === 'object'
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
      }

      const servicioHistorico: SeguimientoData = {
        patente: data.plateNumber || patenteNormalizada,
        modelo: data.model || 'No especificado',
        marca: data.brand || 'No especificada',
        año: data.year?.toString() || 'No especificado',
        cliente: data.clientName || 'Cliente',
        fechaIngreso: formatearFecha(data.entryDate || data.createdAt),
        estadoActual: 'Finalizado',
        telefono: data.clientPhone,
        tipoServicio: data.serviceType || 'Servicio general',
        trabajosRealizados: Array.isArray(data.steps)
          ? mapearTrabajosRealizados(data.steps as FirestoreStep[])
          : [],
        proximoPaso: 'Servicio finalizado',
        fechaEstimadaEntrega: formatearFecha(data.finalizedAt),
        updatedAt: formatearFecha(data.finalizedAt),
        serviceNumber: data.serviceNumber || 1,
        fechaFinalizado: formatearFecha(data.finalizedAt),
        km: data.km,
      }

      historial.push(servicioHistorico)
    })

    return historial
  } catch (error) {
    console.error('❌ Error buscando historial completo:', error)
    return []
  }
}

export async function buscarVehiculosPorPatente(
  _patenteParc: string
): Promise<SeguimientoData[]> {
  try {
    return []
  } catch (error) {
    console.error('Error en búsqueda parcial:', error)
    return []
  }
}

export async function actualizarEstadoVehiculo(
  patente: string,
  _nuevoEstado: string,
  _notas?: string
): Promise<boolean> {
  try {
    const patenteNormalizada = patente.toUpperCase().trim()
    const _docRef = doc(db, 'vehicles', patenteNormalizada)

    return true
  } catch (error) {
    console.error('Error actualizando estado:', error)
    return false
  }
}
