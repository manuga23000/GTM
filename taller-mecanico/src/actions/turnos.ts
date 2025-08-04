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

// Tipo para configuración de disponibilidad
type ServiceAvailabilityConfig = {
  maxPerDay?: number | null
  maxPerWeek?: number | null
  requiresDate: boolean
  allowedDays?: number[] // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
}

const COLLECTION_NAME = 'turnos'

// Configuración de disponibilidad por servicio
const SERVICE_AVAILABILITY: Record<string, ServiceAvailabilityConfig> = {
  // Servicios principales
  Diagnóstico: { maxPerDay: 2, requiresDate: true },
  'Caja automática': { maxPerDay: null, requiresDate: false },
  'Mecánica general': { maxPerDay: null, requiresDate: false },
  'Programación de módulos': { maxPerDay: null, requiresDate: false },
  'Revisación técnica': {
    maxPerDay: 1,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Otro: { maxPerDay: 1, requiresDate: true, allowedDays: [1, 2, 3, 4, 5] },

  // Sub-servicios de caja automática
  'Service de mantenimiento': { maxPerDay: 2, requiresDate: false }, // Hasta 2 por día, todos los días
  'Diagnóstico de caja': {
    maxPerWeek: 5, // Límite global compartido con otros servicios
    requiresDate: false,
    allowedDays: [1, 2, 3],
  }, // Solo lunes a miércoles
  'Reparación de fugas': {
    maxPerWeek: 5, // Límite global compartido con otros servicios
    requiresDate: false,
    allowedDays: [1, 2, 3],
  }, // Solo lunes a miércoles
  'Cambio de solenoides': {
    maxPerWeek: 5, // Límite global compartido con otros servicios
    requiresDate: false,
    allowedDays: [1, 2, 3],
  }, // Solo lunes a miércoles
  'Overhaul completo': {
    maxPerWeek: 5, // Límite global compartido con otros servicios
    requiresDate: true,
    allowedDays: [1, 2, 3],
  }, // Solo lunes a miércoles
  'Reparaciones mayores': {
    maxPerWeek: 5, // Límite global compartido con otros servicios
    requiresDate: true,
    allowedDays: [1, 2, 3],
  }, // Solo lunes a miércoles

  // Sub-servicios de mecánica general
  'Cambio de aceite y filtros': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Cambio de correas': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Reparación de frenos': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Cambio de embrague': {
    maxPerDay: 3,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Suspensión y amortiguadores': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Reparación de motor': {
    maxPerDay: 3,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Cambio de bujías / inyectores': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Cambio de batería': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Diagnóstico de ruidos o vibraciones': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Mantenimiento general': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Reparación de sistema de escape': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Reparación de dirección': {
    maxPerDay: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
}

/**
 * Crear un nuevo turno
 */
export async function createTurno(
  turnoData: TurnoInput
): Promise<TurnoResponse> {
  try {
    // Validaciones básicas - Todos los campos obligatorios
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

    // Validaciones básicas - Solo servicio obligatorio para testing
    if (!turnoData.service) {
      return {
        success: false,
        message: 'Por favor, selecciona un servicio.',
        error: 'MISSING_REQUIRED_FIELDS',
      }
    }

    // Verificar disponibilidad para servicios que requieren fecha
    if (turnoData.date) {
      let serviceToCheck = turnoData.service

      // Para caja automática o mecánica general, usar el sub-servicio
      if (
        (turnoData.service === 'Caja automática' ||
          turnoData.service === 'Mecánica general') &&
        turnoData.subService
      ) {
        serviceToCheck = turnoData.subService
      }

      // Verificar disponibilidad para todos los servicios que tienen configuración
      if (
        SERVICE_AVAILABILITY[
          serviceToCheck as keyof typeof SERVICE_AVAILABILITY
        ]
      ) {
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

    // Enviar email de confirmación solo al cliente (Bcc configurado en EmailJS)
    try {
      await sendTurnoConfirmationToClient(turnoData)
      console.log('✅ Email de confirmación enviado correctamente')
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

/**
 * Verificar disponibilidad para un servicio en una fecha específica
 */
export async function checkAvailability(
  date: string, // YYYY-MM-DD format
  service: string
): Promise<AvailabilityCheck> {
  try {
    console.log(`🔍 CHECKING AVAILABILITY: ${date} para ${service}`)

    const serviceConfig =
      SERVICE_AVAILABILITY[service as keyof typeof SERVICE_AVAILABILITY]

    // Si no hay configuración para el servicio, siempre está disponible
    if (!serviceConfig) {
      console.log(`❌ No config for service: ${service}`)
      return {
        date,
        service,
        available: true,
        totalSlots: 0,
        usedSlots: 0,
      }
    }

    console.log(`⚙️ Service config:`, serviceConfig)

    // Verificar si el día está permitido para este servicio
    if (serviceConfig.allowedDays) {
      // ✅ FIX: Crear fecha correctamente para evitar problemas de timezone
      const [year, month, day] = date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = dateObj.getDay() // 0 = domingo, 1 = lunes, etc.
      // Convertir a 1-7 donde 1 = lunes, 2 = martes, 3 = miércoles, etc.
      const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek

      console.log(
        `📅 Fecha: ${date}, dayOfWeek: ${dayOfWeek}, dayNumber: ${dayNumber}`
      )
      console.log(`✅ Días permitidos:`, serviceConfig.allowedDays)

      if (!serviceConfig.allowedDays.includes(dayNumber)) {
        console.log(`❌ Día ${dayNumber} no permitido para ${service}`)
        return {
          date,
          service,
          available: false,
          totalSlots: 0,
          usedSlots: 0,
        }
      }
      console.log(`✅ Día ${dayNumber} SÍ permitido para ${service}`)
    }

    // Si el servicio tiene restricción diaria, verificar disponibilidad diaria
    if (serviceConfig.maxPerDay) {
      const startDate = new Date(date + 'T00:00:00')
      const endDate = new Date(date + 'T23:59:59')

      // Para sub-servicios de caja automática o mecánica general, buscar por subService
      const cajaAutomaticaSubServices = [
        'Service de mantenimiento',
        'Diagnóstico de caja',
        'Reparación de fugas',
        'Cambio de solenoides',
        'Overhaul completo',
        'Reparaciones mayores',
      ]

      const mecanicaGeneralSubServices = [
        'Cambio de aceite y filtros',
        'Cambio de correas',
        'Reparación de frenos',
        'Cambio de embrague',
        'Suspensión y amortiguadores',
        'Reparación de motor',
        'Cambio de bujías / inyectores',
        'Cambio de batería',
        'Diagnóstico de ruidos o vibraciones',
        'Mantenimiento general',
        'Reparación de sistema de escape',
        'Reparación de dirección',
      ]

      if (cajaAutomaticaSubServices.includes(service)) {
        // Para sub-servicios de caja automática, verificar límite individual
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

        console.log(
          `📊 Límite diario para ${service}: ${usedSlots}/${totalSlots}`
        )

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      } else if (mecanicaGeneralSubServices.includes(service)) {
        // Para sub-servicios de mecánica general, verificar límite global diario de 3
        const q = query(
          collection(db, COLLECTION_NAME),
          where('subService', 'in', mecanicaGeneralSubServices),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          where('status', 'in', ['pending', 'confirmed'])
        )
        const querySnapshot = await getDocs(q)
        const usedSlots = querySnapshot.size
        const totalSlots = 3 // Límite global diario para mecánica general

        console.log(
          `📊 Límite diario global para Mecánica general: ${usedSlots}/${totalSlots}`
        )

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

        console.log(
          `📊 Límite diario para ${service}: ${usedSlots}/${totalSlots}`
        )

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      }
    }

    // Si el servicio tiene restricción semanal, verificar disponibilidad semanal
    if (serviceConfig.maxPerWeek) {
      console.log(`📊 Verificando límite semanal: ${serviceConfig.maxPerWeek}`)

      // ✅ FIX: Crear fecha correctamente para cálculo de semana
      const [yearWeek, monthWeek, dayWeek] = date.split('-').map(Number)
      const dateObjWeek = new Date(yearWeek, monthWeek - 1, dayWeek)
      const dayOfWeek = dateObjWeek.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = domingo
      const monday = new Date(dateObjWeek)
      monday.setDate(dateObjWeek.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)

      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4) // Lunes + 4 días = Viernes
      friday.setHours(23, 59, 59, 999)

      console.log(
        `📅 Semana laboral: ${monday.toISOString()} a ${friday.toISOString()}`
      )

      // Para sub-servicios de caja automática, verificar límite global semanal compartido
      if (
        [
          'Diagnóstico de caja',
          'Reparación de fugas',
          'Cambio de solenoides',
          'Overhaul completo',
          'Reparaciones mayores',
          'Otro',
        ].includes(service)
      ) {
        console.log(`🔧 Verificando límite global semanal para: ${service}`)

        const q = query(
          collection(db, COLLECTION_NAME),
          where('subService', 'in', [
            'Diagnóstico de caja',
            'Reparación de fugas',
            'Cambio de solenoides',
            'Overhaul completo',
            'Reparaciones mayores',
            'Otro',
          ]),
          where('date', '>=', Timestamp.fromDate(monday)),
          where('date', '<=', Timestamp.fromDate(friday)),
          where('status', 'in', ['pending', 'confirmed'])
        )

        console.log(`🔍 Ejecutando query para semana...`)
        const querySnapshot = await getDocs(q)
        const usedSlots = querySnapshot.size
        const totalSlots = 5 // Límite global semanal compartido

        console.log(`📊 Resultados de la semana:`)
        console.log(`   - Slots usados: ${usedSlots}`)
        console.log(`   - Slots totales: ${totalSlots}`)
        console.log(`   - Disponible: ${usedSlots < totalSlots}`)

        // Debug: mostrar los turnos encontrados
        console.log(`📋 Turnos encontrados en la semana:`)
        querySnapshot.forEach(doc => {
          const data = doc.data()
          const turnoDate =
            data.date?.toDate?.()?.toISOString?.()?.split('T')[0] || 'Sin fecha'
          console.log(
            `   - ${data.subService} - ${turnoDate} - Status: ${data.status}`
          )
        })

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      } else {
        // Para otros servicios con límite semanal
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

        console.log(
          `📊 Límite semanal para ${service}: ${usedSlots}/${totalSlots}`
        )

        return {
          date,
          service,
          available: usedSlots < totalSlots,
          totalSlots,
          usedSlots,
        }
      }
    }

    // Si el servicio no requiere fecha y no tiene restricciones
    if (!serviceConfig.requiresDate) {
      console.log(
        `✅ Servicio ${service} no requiere fecha - siempre disponible`
      )
      return {
        date,
        service,
        available: true,
        totalSlots: 0,
        usedSlots: 0,
      }
    }

    // Para sub-servicios que requieren fecha, buscar por subService
    const servicesRequiringDate = [
      'Overhaul completo',
      'Reparaciones mayores',
      'Cambio de embrague',
      'Reparación de motor',
    ]

    if (servicesRequiringDate.includes(service)) {
      const startDate = new Date(date + 'T00:00:00')
      const endDate = new Date(date + 'T23:59:59')

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

      console.log(
        `📊 Disponibilidad diaria para ${service}: ${usedSlots}/${totalSlots}`
      )

      return {
        date,
        service,
        available: usedSlots < totalSlots,
        totalSlots,
        usedSlots,
      }
    } else {
      // Servicios que requieren fecha específica (disponibilidad diaria)
      const startDate = new Date(date + 'T00:00:00')
      const endDate = new Date(date + 'T23:59:59')

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

      console.log(
        `📊 Disponibilidad diaria por defecto para ${service}: ${usedSlots}/${totalSlots}`
      )

      return {
        date,
        service,
        available: usedSlots < totalSlots,
        totalSlots,
        usedSlots,
      }
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
