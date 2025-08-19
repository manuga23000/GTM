// src/actions/seguimiento.ts
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Tipo para datos de seguimiento que coincide con la estructura de Firebase
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
  trabajosRealizados?: string[]
  proximoPaso?: string
  fechaEstimadaEntrega?: string
  timeline?: TimelineItem[]
  imagenes?: ImagenItem[]
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
    // Normalizar la patente para búsqueda
    const patenteNormalizada = patente.toUpperCase().trim()

    // Buscar por ID del documento (que debería ser la patente)
    const docRef = doc(db, 'vehicles', patenteNormalizada)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()

    interface FirestoreTimestamp {
      toDate(): Date
    }

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

      // Si es un Timestamp de Firestore
      if (isFirestoreTimestamp(timestamp)) {
        return timestamp.toDate().toISOString()
      }

      // Si es un string de fecha
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toISOString()
      }

      // Si es un objeto Date
      if (timestamp instanceof Date) {
        return timestamp.toISOString()
      }

      // Fallback
      return new Date().toISOString()
    }

    // Mapear los datos de Firebase a nuestro formato
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
      trabajosRealizados: data.trabajosRealizados || [],
      proximoPaso: data.proximoPaso || '',
      fechaEstimadaEntrega: data.fechaEstimadaEntrega
        ? formatearFecha(data.fechaEstimadaEntrega)
        : '',
      timeline: data.timeline || [],
      imagenes: data.imagenes || [],
    }

    return seguimientoData
  } catch (error) {
    console.error('Error obteniendo seguimiento de Firebase:', error)

    // Si hay un error de conexión o autenticación, devolver null
    // para que el sistema use datos mock en desarrollo
    return null
  }
}

/**
 * Función auxiliar para buscar vehículos por patente parcial
 * (útil para implementar búsqueda con autocompletado en el futuro)
 */
export async function buscarVehiculosPorPatente(
  patenteParc: string
): Promise<SeguimientoData[]> {
  try {
    // Esta función se puede implementar usando queries de Firestore
    // Por ahora devuelve un array vacío
    return []
  } catch (error) {
    console.error('Error en búsqueda parcial:', error)
    return []
  }
}

/**
 * Función para actualizar el estado de un vehículo
 */
export async function actualizarEstadoVehiculo(
  patente: string,
  nuevoEstado: string,
  notas?: string
): Promise<boolean> {
  try {
    const patenteNormalizada = patente.toUpperCase().trim()
    const docRef = doc(db, 'vehicles', patenteNormalizada)

    // Esta función se implementaría cuando necesites actualizar estados

    // Aquí iría la lógica de actualización con updateDoc
    // await updateDoc(docRef, {
    //   status: nuevoEstado,
    //   lastUpdated: new Date(),
    //   ...(notas && { notes: notas })
    // })

    return true
  } catch (error) {
    console.error('Error actualizando estado:', error)
    return false
  }
}
