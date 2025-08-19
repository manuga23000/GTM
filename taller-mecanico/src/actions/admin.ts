// src/actions/admin.ts
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Tipos para la configuración
export interface ServiceConfig {
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[] // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
}

export interface AdminResponse {
  success: boolean
  message: string
  error?: string
}

const CONFIG_COLLECTION = 'admin'
const CONFIG_DOC_ID = 'serviceConfig'

// Configuración por defecto (la misma que tienes en turnos.ts)
const DEFAULT_SERVICE_CONFIG: Record<string, ServiceConfig> = {
  // SERVICIOS PRINCIPALES
  Diagnóstico: {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Caja automática': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Mecánica general': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Revisación técnica': {
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Programación de módulos': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Otro: {
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },

  // SUB-SERVICIOS DE CAJA AUTOMÁTICA
  'Service de mantenimiento': {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Diagnóstico de caja': {
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Reparación de fugas': {
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Cambio de solenoides': {
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Overhaul completo': {
    maxPerDay: null,
    maxPerWeek: 2,
    requiresDate: true,
    allowedDays: [1, 2, 3],
  },
  'Reparaciones mayores': {
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: true,
    allowedDays: [1, 2, 3],
  },

  // SUB-SERVICIOS DE MECÁNICA GENERAL
  'Correa de distribución': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Frenos: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Embrague: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Suspensión: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Motor: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Bujías / Inyectores': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Batería: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Ruidos o vibraciones': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Mantenimiento general': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Dirección: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Otro / No estoy seguro': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
}

// Cache para evitar consultas innecesarias
let configCache: Record<string, ServiceConfig> | null = null
let cacheExpiry: number = 0

/**
 * Cargar configuración de servicios
 */
export async function loadServiceConfig(): Promise<
  Record<string, ServiceConfig>
> {
  try {
    // Si el cache es válido (5 minutos), usarlo
    const now = Date.now()
    if (configCache && now < cacheExpiry) {
      return configCache
    }

    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID)
    const docSnap = await getDoc(docRef)

    let loadedConfig: Record<string, ServiceConfig>

    if (docSnap.exists()) {
      const data = docSnap.data()
      loadedConfig = data.services || DEFAULT_SERVICE_CONFIG
    } else {
      // Si no existe, crear con configuración por defecto
      await saveServiceConfig(DEFAULT_SERVICE_CONFIG)
      loadedConfig = DEFAULT_SERVICE_CONFIG
    }

    // Actualizar cache
    configCache = loadedConfig
    cacheExpiry = now + 5 * 60 * 1000 // Cache válido por 5 minutos

    return loadedConfig
  } catch (error) {
    console.error('Error loading service config:', error)
    return DEFAULT_SERVICE_CONFIG
  }
}

/**
 * Guardar configuración de servicios
 */
export async function saveServiceConfig(
  services: Record<string, ServiceConfig>
): Promise<AdminResponse> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID)
    await setDoc(
      docRef,
      {
        services,
        updatedAt: Timestamp.fromDate(new Date()),
        version: 1,
      },
      { merge: true }
    )

    // Invalidar cache
    configCache = null
    cacheExpiry = 0

    return {
      success: true,
      message: 'Configuración guardada exitosamente',
    }
  } catch (error) {
    console.error('Error saving service config:', error)
    return {
      success: false,
      message: 'Error al guardar la configuración',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Obtener configuración de un servicio específico
 */
export async function getServiceConfig(
  serviceName: string
): Promise<ServiceConfig | null> {
  const allConfigs = await loadServiceConfig()
  return allConfigs[serviceName] || null
}

/**
 * Invalidar cache (útil para testing o actualizaciones forzadas)
 */
export function invalidateConfigCache(): void {
  configCache = null
  cacheExpiry = 0
}

/**
 * Resetear configuración a valores por defecto
 */
export async function resetServiceConfig(): Promise<AdminResponse> {
  try {
    const result = await saveServiceConfig(DEFAULT_SERVICE_CONFIG)
    return result
  } catch (error) {
    console.error('Error resetting service config:', error)
    return {
      success: false,
      message: 'Error al resetear la configuración',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Exportar configuración (para backup)
 */
export async function exportServiceConfig(): Promise<
  Record<string, ServiceConfig>
> {
  return await loadServiceConfig()
}

/**
 * Obtener todos los vehículos
 */
import { VehicleInput } from './types/types'

export async function getAllVehicles(): Promise<VehicleInput[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'vehicles'))
    const vehicles: VehicleInput[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      vehicles.push({
        plateNumber: data.plateNumber,
        brand: data.brand,
        model: data.model,
        year:
          typeof data.year === 'number'
            ? data.year
            : data.createdAt
            ? new Date(
                data.createdAt instanceof Date
                  ? data.createdAt
                  : data.createdAt?.toDate
                  ? data.createdAt.toDate()
                  : new Date()
              ).getFullYear()
            : new Date().getFullYear(),
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        serviceType: data.serviceType,
        chassisNumber: data.chassisNumber,
        totalCost: data.totalCost || 0, // NUEVO: incluir totalCost
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt
            : data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
        estimatedCompletionDate: data.estimatedCompletionDate
          ? data.estimatedCompletionDate instanceof Date
            ? data.estimatedCompletionDate
            : data.estimatedCompletionDate.toDate()
          : null, // Manejar null correctamente
        notes: data.notes || '',
        nextStep: data.nextStep || '',
      })
    })
    return vehicles
  } catch (error) {
    console.error('Error obteniendo vehículos:', error)
    return []
  }
}

/**
 * Eliminar un vehículo por patente
 * @param plateNumber Patente (ID)
 */
export async function deleteVehicle(
  plateNumber: string
): Promise<AdminResponse> {
  try {
    if (!plateNumber) {
      return {
        success: false,
        message: 'Falta la patente',
        error: 'MISSING_PLATE',
      }
    }
    const docRef = doc(db, 'vehicles', plateNumber)
    await deleteDoc(docRef)
    return { success: true, message: 'Vehículo eliminado correctamente' }
  } catch (error) {
    console.error('Error eliminando vehículo:', error)
    return {
      success: false,
      message: 'Error al eliminar el vehículo',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}

/**
 * Filtrar valores undefined de un objeto para Firebase
 */
function filterUndefinedValues(obj: any): any {
  const filtered: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key] = value
    }
  }
  return filtered
}

/**
 * Crear un nuevo vehículo
 */
export async function createVehicle(
  vehicleData: VehicleInput
): Promise<AdminResponse> {
  try {
    // Validaciones básicas
    if (!vehicleData.plateNumber || !vehicleData.clientName) {
      return {
        success: false,
        message: 'Faltan campos obligatorios (patente y cliente)',
        error: 'MISSING_REQUIRED_FIELDS',
      }
    }

    const normalizedPlate = vehicleData.plateNumber
      .replace(/\s+/g, '')
      .toUpperCase()
    const docRef = doc(db, 'vehicles', normalizedPlate)

    // Preparar datos con todos los campos incluido totalCost
    const dataToSave = {
      ...vehicleData,
      plateNumber: normalizedPlate,
      createdAt: vehicleData.createdAt || new Date(),
      totalCost: vehicleData.totalCost || 0,
    }

    // Filtrar valores undefined antes de enviar a Firebase
    const filteredData = filterUndefinedValues(dataToSave)

    await setDoc(docRef, filteredData)

    return {
      success: true,
      message: 'Vehículo creado exitosamente',
    }
  } catch (error) {
    console.error('Error creando vehículo:', error)
    return {
      success: false,
      message: 'Error al crear el vehículo',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}

/**
 * Actualizar los datos de un vehículo existente en Firebase
 * @param plateNumber Patente (ID)
 * @param updateData Campos a actualizar (ahora incluye totalCost)
 */
export async function updateVehicle(
  plateNumber: string,
  updateData: Partial<VehicleInput>
): Promise<AdminResponse> {
  try {
    if (!plateNumber) {
      return {
        success: false,
        message: 'Falta la patente',
        error: 'MISSING_PLATE',
      }
    }
    const docRef = doc(db, 'vehicles', plateNumber)

    // Preparar datos de actualización
    const dataToUpdate = {
      ...updateData,
      plateNumber, // Siempre mantener la patente
      updatedAt: new Date(),
    }

    // Si se incluye totalCost, asegurar que es un número
    if (updateData.totalCost !== undefined) {
      dataToUpdate.totalCost = Number(updateData.totalCost) || 0
    }

    // Filtrar valores undefined antes de enviar a Firebase
    const filteredData = filterUndefinedValues(dataToUpdate)

    await setDoc(docRef, filteredData, { merge: true })
    return { success: true, message: 'Vehículo actualizado correctamente' }
  } catch (error) {
    console.error('Error actualizando vehículo:', error)
    return {
      success: false,
      message: 'Error al actualizar el vehículo',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}
