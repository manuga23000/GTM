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
import { sendTurnoConfirmationToClient } from '@/lib/emailjs'
import { getServiceConfig } from './serviceconfig'

const COLLECTION_NAME = 'turnos'

async function getServiceAvailabilityConfig(serviceName: string): Promise<{
  maxPerDay?: number | null
  maxPerWeek?: number | null
  requiresDate: boolean
  allowedDays?: number[]
} | null> {
  const servicesWithDynamicConfig = [
    'Diagnóstico',
    'Revisación técnica',
    'Otro',
    'Service de mantenimiento',
    'Diagnóstico de caja',
    'Reparación de fugas',
    'Cambio de solenoides',
    'Overhaul completo',
    'Reparaciones mayores',
    'Correa de distribución',
    'Frenos',
    'Embrague',
    'Suspensión',
    'Motor',
    'Bujías / Inyectores',
    'Batería',
    'Ruidos o vibraciones',
    'Mantenimiento general',
    'Dirección',
    'Otro / No estoy seguro',
  ]

  if (servicesWithDynamicConfig.includes(serviceName)) {
    try {
      const dynamicConfig = await getServiceConfig(serviceName)
      if (dynamicConfig && dynamicConfig.isActive) {
        return {
          maxPerDay: dynamicConfig.maxPerDay,
          maxPerWeek: dynamicConfig.maxPerWeek,
          requiresDate: dynamicConfig.requiresDate,
          allowedDays: dynamicConfig.allowedDays,
        }
      }
    } catch (error) {
      console.error(
        `❌ Error obteniendo configuración dinámica para ${serviceName}:`,
        error
      )
    }
  }

  const staticConfigs: Record<
    string,
    {
      maxPerDay?: number | null
      maxPerWeek?: number | null
      requiresDate: boolean
      allowedDays?: number[]
    }
  > = {
    'Caja automática': { maxPerDay: null, requiresDate: false },
    'Mecánica general': { maxPerDay: null, requiresDate: false },
    'Programación de módulos': { maxPerDay: null, requiresDate: false },
  }

  const staticConfig = staticConfigs[serviceName]
  if (staticConfig) {
    return staticConfig
  }

  return null
}

export async function createTurno(
  turnoData: TurnoInput
): Promise<TurnoResponse> {
  try {
    if (
      !turnoData.name ||
      !turnoData.phone ||
      !turnoData.email ||
      !turnoData.vehicle ||
      !turnoData.service
    ) {
      return {
        success: false,
        message:
          'Por favor, completa todos los campos obligatorios (nombre, teléfono, email, vehículo y servicio).',
        error: 'MISSING_REQUIRED_FIELDS',
      }
    }

    if (turnoData.date) {
      let serviceToCheck = turnoData.service

      if (
        (turnoData.service === 'Caja automática' ||
          turnoData.service === 'Mecánica general') &&
        turnoData.subService
      ) {
        serviceToCheck = turnoData.subService
      }

      const availability = await checkAvailability(
        turnoData.date.toISOString().split('T')[0],
        serviceToCheck
      )

      if (!availability.available) {
        return {
          success: false,
          message: `No hay disponibilidad para ${serviceToCheck} en la fecha seleccionada.`,
          error: 'NO_AVAILABILITY',
        }
      }
    }

    const cancelToken = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substr(2, 16)

    const now = new Date()
    const turno: Omit<Turno, 'id'> = {
      ...turnoData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      cancelToken,
    }

    const firestoreData = {
      ...turno,
      date: turno.date ? Timestamp.fromDate(turno.date) : null,
      createdAt: Timestamp.fromDate(turno.createdAt),
      updatedAt: Timestamp.fromDate(turno.updatedAt),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData)

    const savedTurno: Turno = {
      ...turno,
      id: docRef.id,
    }

    try {
      await sendTurnoConfirmationToClient({ ...turnoData, cancelToken })
    } catch (emailError) {
      console.error('❌ Error enviando email de confirmación:', emailError)
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

export async function checkAvailability(
  date: string,
  service: string
): Promise<AvailabilityCheck> {
  try {
    const serviceConfig = await getServiceAvailabilityConfig(service)

    if (!serviceConfig) {
      return {
        date,
        service,
        available: true,
        totalSlots: 0,
        usedSlots: 0,
      }
    }

    if (serviceConfig.allowedDays) {
      const [year, month, day] = date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = dateObj.getDay()
      const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek

      if (!serviceConfig.allowedDays.includes(dayNumber)) {
        return {
          date,
          service,
          available: false,
          totalSlots: 0,
          usedSlots: 0,
        }
      }
    }

    let dailyAvailable = true
    let weeklyAvailable = true
    let dailyUsed = 0
    let dailyTotal = 0
    let weeklyUsed = 0
    let weeklyTotal = 0

    const startDate = new Date(date + 'T00:00:00')
    const endDate = new Date(date + 'T23:59:59')

    if (serviceConfig.maxPerDay) {
      dailyTotal = serviceConfig.maxPerDay

      const cajaAutomaticaSubServices = [
        'Service de mantenimiento',
        'Diagnóstico de caja',
        'Reparación de fugas',
        'Cambio de solenoides',
        'Overhaul completo',
        'Reparaciones mayores',
      ]

      const mecanicaGeneralSubServices = [
        'Correa de distribución',
        'Frenos',
        'Embrague',
        'Suspensión',
        'Motor',
        'Bujías / Inyectores',
        'Batería',
        'Ruidos o vibraciones',
        'Mantenimiento general',
        'Dirección',
        'Otro / No estoy seguro',
      ]

      let dailyQuery

      if (cajaAutomaticaSubServices.includes(service)) {
        dailyQuery = query(
          collection(db, 'turnos'),
          where('subService', '==', service),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      } else if (mecanicaGeneralSubServices.includes(service)) {
        dailyQuery = query(
          collection(db, 'turnos'),
          where('subService', '==', service),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      } else {
        dailyQuery = query(
          collection(db, 'turnos'),
          where('service', '==', service),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      }

      const dailySnapshot = await getDocs(dailyQuery)
      dailyUsed = dailySnapshot.size
      dailyAvailable = dailyUsed < dailyTotal
    }

    if (serviceConfig.maxPerWeek) {
      weeklyTotal = serviceConfig.maxPerWeek

      const [yearWeek, monthWeek, dayWeek] = date.split('-').map(Number)
      const dateObjWeek = new Date(yearWeek, monthWeek - 1, dayWeek)
      const dayOfWeek = dateObjWeek.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(dateObjWeek)
      monday.setDate(dateObjWeek.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)

      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4)
      friday.setHours(23, 59, 59, 999)

      let weeklyQuery

      const cajaAutomaticaSubServices = [
        'Service de mantenimiento',
        'Diagnóstico de caja',
        'Reparación de fugas',
        'Cambio de solenoides',
        'Overhaul completo',
        'Reparaciones mayores',
      ]

      const mecanicaGeneralSubServices = [
        'Correa de distribución',
        'Frenos',
        'Embrague',
        'Suspensión',
        'Motor',
        'Bujías / Inyectores',
        'Batería',
        'Ruidos o vibraciones',
        'Mantenimiento general',
        'Dirección',
        'Otro / No estoy seguro',
      ]

      if (cajaAutomaticaSubServices.includes(service)) {
        weeklyQuery = query(
          collection(db, 'turnos'),
          where('subService', '==', service),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      } else if (mecanicaGeneralSubServices.includes(service)) {
        weeklyQuery = query(
          collection(db, 'turnos'),
          where('subService', '==', service),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      } else {
        weeklyQuery = query(
          collection(db, 'turnos'),
          where('service', '==', service),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )
      }

      const weeklySnapshot = await getDocs(weeklyQuery)
      weeklyUsed = weeklySnapshot.size
      weeklyAvailable = weeklyUsed < weeklyTotal
    }

    const finalAvailable = dailyAvailable && weeklyAvailable

    let totalSlots = 0
    let usedSlots = 0

    if (serviceConfig.maxPerDay && serviceConfig.maxPerWeek) {
      const dailyRemaining = dailyTotal - dailyUsed
      const weeklyRemaining = weeklyTotal - weeklyUsed

      if (dailyRemaining < weeklyRemaining) {
        totalSlots = dailyTotal
        usedSlots = dailyUsed
      } else {
        totalSlots = weeklyTotal
        usedSlots = weeklyUsed
      }
    } else if (serviceConfig.maxPerDay) {
      totalSlots = dailyTotal
      usedSlots = dailyUsed
    } else if (serviceConfig.maxPerWeek) {
      totalSlots = weeklyTotal
      usedSlots = weeklyUsed
    }

    return {
      date,
      service,
      available: finalAvailable,
      totalSlots,
      usedSlots,
    }
  } catch (error) {
    console.error(
      `❌ Error checking availability for ${date}-${service}:`,
      error
    )
    return {
      date,
      service,
      available: false,
      totalSlots: 0,
      usedSlots: 0,
    }
  }
}

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
      turnos.push({
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
        cancelToken: data.cancelToken || '',
      })
    })

    return turnos
  } catch (error) {
    console.error('Error getting turnos:', error)
    throw error
  }
}

export async function updateTurnoStatus(
  turnoId: string,
  status: 'pending' | 'cancelled' | 'completed' | 'reprogrammed'
): Promise<TurnoResponse> {
  try {
    const turnoRef = doc(db, COLLECTION_NAME, turnoId)
    await updateDoc(turnoRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    })

    return {
      success: true,
      message: `Turno ${
        status === 'cancelled'
          ? 'cancelado'
          : status === 'completed'
          ? 'completado'
          : status === 'reprogrammed'
          ? 'reprogramado'
          : 'pendiente'
      } exitosamente.`,
    }
  } catch (error) {
    console.error('Error updating turno status:', error)
    return {
      success: false,
      message: 'Error al actualizar el estado del turno.',
      error: 'UPDATE_ERROR',
    }
  }
}

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
      error: 'DELETE_ERROR',
    }
  }
}

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
        subService: data.subService,
        date: data.date ? data.date.toDate() : null,
        time: data.time,
        message: data.message,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        cancelToken: data.cancelToken || '',
      }
      turnos.push(turno)
    })

    return turnos
  } catch (error) {
    console.error('Error getting turnos by date range:', error)
    return []
  }
}

export async function getAvailabilityForWeek(
  startDate: Date,
  service: string
): Promise<AvailabilityCheck[]> {
  const availability: AvailabilityCheck[] = []

  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    if (date.getDay() >= 1 && date.getDay() <= 5) {
      const dateString = date.toISOString().split('T')[0]
      const dayAvailability = await checkAvailability(dateString, service)
      availability.push(dayAvailability)
    }
  }

  return availability
}
