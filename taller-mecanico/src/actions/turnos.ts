import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Turno,
  TurnoInput,
  TurnoResponse,
  AvailabilityCheck,
} from './types/types'

// Tipo para configuración de disponibilidad
type ServiceAvailabilityConfig = {
  maxPerDay?: number | null
  maxPerWeek?: number | null
  requiresDate: boolean
}

const COLLECTION_NAME = 'turnos'

// Configuración de disponibilidad por servicio
const SERVICE_AVAILABILITY: Record<string, ServiceAvailabilityConfig> = {
  // Servicios principales
  Diagnóstico: { maxPerDay: 2, requiresDate: true },
  'Caja automática': { maxPerDay: null, requiresDate: false },
  'Mecánica general': { maxPerDay: null, requiresDate: false },
  'Programación de módulos': { maxPerDay: null, requiresDate: false },
  'Revisación técnica': { maxPerDay: null, requiresDate: false },
  Otro: { maxPerDay: null, requiresDate: false },

  // Sub-servicios de caja automática
  'Service de mantenimiento': { maxPerWeek: 8, requiresDate: false },
  'Diagnóstico de caja': { maxPerWeek: 5, requiresDate: false },
  'Reparación de fugas': { maxPerWeek: 4, requiresDate: false },
  'Cambio de solenoides': { maxPerWeek: 3, requiresDate: false },
  'Overhaul completo': { maxPerWeek: 2, requiresDate: true },
  'Reparaciones mayores': { maxPerWeek: 3, requiresDate: true },
}

/**
 * Crear un nuevo turno
 */
export async function createTurno(
  turnoData: TurnoInput
): Promise<TurnoResponse> {
  try {
    // Validaciones básicas
    if (
      !turnoData.name ||
      !turnoData.phone ||
      !turnoData.vehicle ||
      !turnoData.service
    ) {
      return {
        success: false,
        message: 'Por favor, completa todos los campos obligatorios.',
        error: 'MISSING_REQUIRED_FIELDS',
      }
    }

    // Verificar disponibilidad para servicios que requieren fecha
    if (turnoData.date) {
      let serviceToCheck = turnoData.service

      // Para caja automática, usar el sub-servicio
      if (turnoData.service === 'Caja automática' && turnoData.subService) {
        serviceToCheck = turnoData.subService
      }

      // Solo verificar para servicios que requieren fecha
      if (
        ['Diagnóstico', 'Overhaul completo', 'Reparaciones mayores'].includes(
          serviceToCheck
        )
      ) {
        const availability = await checkAvailability(
          turnoData.date.toISOString().split('T')[0],
          serviceToCheck
        )

        if (!availability.available) {
          return {
            success: false,
            message: `No hay disponibilidad para ${serviceToCheck} en la fecha seleccionada. Disponibles: ${
              availability.totalSlots - availability.usedSlots
            }/${availability.totalSlots}`,
            error: 'NO_AVAILABILITY',
          }
        }
      }
    }

    // Preparar datos del turno
    const now = new Date()
    const turno: Omit<Turno, 'id'> = {
      ...turnoData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    // Convertir fechas a Timestamp para Firestore
    const firestoreData = {
      ...turno,
      date: turno.date ? Timestamp.fromDate(turno.date) : null,
      createdAt: Timestamp.fromDate(turno.createdAt),
      updatedAt: Timestamp.fromDate(turno.updatedAt),
    }

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData)

    const savedTurno: Turno = {
      ...turno,
      id: docRef.id,
    }

    return {
      success: true,
      message:
        'Turno creado exitosamente. Te contactaremos pronto para confirmar.',
      turno: savedTurno,
    }
  } catch (error) {
    console.error('Error creating turno:', error)
    return {
      success: false,
      message: 'Error al crear el turno. Por favor, intenta nuevamente.',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Verificar disponibilidad para un servicio en una fecha específica
 */
export async function checkAvailability(
  date: string, // YYYY-MM-DD format
  service: string
): Promise<AvailabilityCheck> {
  try {
    const serviceConfig =
      SERVICE_AVAILABILITY[service as keyof typeof SERVICE_AVAILABILITY]

    // Si no hay configuración para el servicio, siempre está disponible
    if (!serviceConfig) {
      return {
        date,
        service,
        available: true,
        totalSlots: 0,
        usedSlots: 0,
      }
    }

    // Si el servicio tiene restricción semanal, verificar disponibilidad semanal
    if (serviceConfig.maxPerWeek) {
      // Calcular inicio y fin de la semana laboral (lunes a viernes)
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = domingo
      const monday = new Date(dateObj)
      monday.setDate(dateObj.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)

      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4) // Lunes + 4 días = Viernes
      friday.setHours(23, 59, 59, 999)

      // Consultar turnos de la semana laboral para este servicio
      // Para sub-servicios de caja automática, buscar por subService
      if (
        [
          'Service de mantenimiento',
          'Diagnóstico de caja',
          'Reparación de fugas',
          'Cambio de solenoides',
          'Overhaul completo',
          'Reparaciones mayores',
        ].includes(service)
      ) {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('subService', '==', service),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )
        const querySnapshot = await getDocs(q)
        const usedSlots = querySnapshot.size
        const totalSlots = serviceConfig.maxPerWeek || 0

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      } else {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('service', '==', service),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )
        const querySnapshot = await getDocs(q)
        const usedSlots = querySnapshot.size
        const totalSlots = serviceConfig.maxPerWeek || 0

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      }
    }

    // Si el servicio no requiere fecha y no tiene restricciones semanales
    if (!serviceConfig.requiresDate) {
      return {
        date,
        service,
        available: true,
        totalSlots: 0,
        usedSlots: 0,
      }
    }

    // Servicios que requieren fecha específica (disponibilidad diaria)
    const startDate = new Date(date + 'T00:00:00')
    const endDate = new Date(date + 'T23:59:59')

    // Consultar turnos existentes para esa fecha y servicio
    // Para sub-servicios de caja automática, buscar por subService
    if (['Overhaul completo', 'Reparaciones mayores'].includes(service)) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('subService', '==', service),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        where('status', 'in', ['pending', 'confirmed'])
      )
      const querySnapshot = await getDocs(q)
      const usedSlots = querySnapshot.size
      const totalSlots = serviceConfig.maxPerDay || 0

      return {
        date,
        service,
        available: usedSlots < totalSlots,
        totalSlots,
        usedSlots,
      }
    } else {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('service', '==', service),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        where('status', 'in', ['pending', 'confirmed'])
      )
      const querySnapshot = await getDocs(q)
      const usedSlots = querySnapshot.size
      const totalSlots = serviceConfig.maxPerDay || 0

      return {
        date,
        service,
        available: usedSlots < totalSlots,
        totalSlots,
        usedSlots,
      }
    }
  } catch (error) {
    console.error('Error checking availability:', error)
    return {
      date,
      service,
      available: false,
      totalSlots: 0,
      usedSlots: 0,
    }
  }
}

/**
 * Obtener todos los turnos (para admin)
 */
export async function getAllTurnos(): Promise<Turno[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const turnos: Turno[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      const turno: Turno = {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        vehicle: data.vehicle,
        service: data.service,
        subService: data.subService,
        date: data.date ? data.date.toDate() : null,
        time: data.time,
        message: data.message,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
      turnos.push(turno)
    })

    return turnos
  } catch (error) {
    console.error('Error getting turnos:', error)
    return []
  }
}

/**
 * Actualizar el estado de un turno
 */
export async function updateTurnoStatus(
  turnoId: string,
  status: Turno['status']
): Promise<TurnoResponse> {
  try {
    const turnoRef = doc(db, COLLECTION_NAME, turnoId)
    await updateDoc(turnoRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    })

    return {
      success: true,
      message: `Turno ${status} exitosamente.`,
    }
  } catch (error) {
    console.error('Error updating turno status:', error)
    return {
      success: false,
      message: 'Error al actualizar el turno.',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Eliminar un turno
 */
export async function deleteTurno(turnoId: string): Promise<TurnoResponse> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, turnoId))

    return {
      success: true,
      message: 'Turno eliminado exitosamente.',
    }
  } catch (error) {
    console.error('Error deleting turno:', error)
    return {
      success: false,
      message: 'Error al eliminar el turno.',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Obtener turnos por rango de fechas
 */
export async function getTurnosByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Turno[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc')
    )

    const querySnapshot = await getDocs(q)
    const turnos: Turno[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      const turno: Turno = {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        vehicle: data.vehicle,
        service: data.service,
        date: data.date ? data.date.toDate() : null,
        time: data.time,
        message: data.message,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
      turnos.push(turno)
    })

    return turnos
  } catch (error) {
    console.error('Error getting turnos by date range:', error)
    return []
  }
}

/**
 * Obtener disponibilidad para múltiples fechas
 */
export async function getAvailabilityForWeek(
  startDate: Date,
  service: string
): Promise<AvailabilityCheck[]> {
  const availability: AvailabilityCheck[] = []

  for (let i = 0; i < 5; i++) {
    // Solo días laborables (lunes a viernes)
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Solo agregar si es día laborable (1-5, lunes a viernes)
    if (date.getDay() >= 1 && date.getDay() <= 5) {
      const dateString = date.toISOString().split('T')[0]
      const dayAvailability = await checkAvailability(dateString, service)
      availability.push(dayAvailability)
    }
  }

  return availability
}
