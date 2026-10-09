import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  ServiceConfig,
  ServiceConfigInput,
  ServiceConfigResponse,
} from './types/types'

const COLLECTION_NAME = 'service_config'

const INITIAL_CONFIGS: ServiceConfigInput[] = [
  {
    serviceName: 'Diagnóstico',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Revisación técnica',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Otro',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },

  {
    serviceName: 'Service de mantenimiento',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Diagnóstico de caja',
    maxPerDay: null,
    maxPerWeek: 1,
    requiresDate: false,
    allowedDays: [1, 2, 3],
    isActive: true,
  },
  {
    serviceName: 'Reparación de fugas',
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3],
    isActive: true,
  },
  {
    serviceName: 'Cambio de solenoides',
    maxPerDay: null,
    maxPerWeek: 3,
    requiresDate: false,
    allowedDays: [1, 2, 3],
    isActive: true,
  },
  {
    serviceName: 'Overhaul completo',
    maxPerDay: null,
    maxPerWeek: 1,
    requiresDate: true,
    allowedDays: [1, 2, 3],
    isActive: true,
  },
  {
    serviceName: 'Reparaciones mayores',
    maxPerDay: null,
    maxPerWeek: 2,
    requiresDate: true,
    allowedDays: [1, 2, 3],
    isActive: true,
  },

  {
    serviceName: 'Correa de distribución',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Frenos',
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Embrague',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Suspensión',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Motor',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Bujías / Inyectores',
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Batería',
    maxPerDay: 4,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Ruidos o vibraciones',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Mantenimiento general',
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Dirección',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
  {
    serviceName: 'Otro / No estoy seguro',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
    isActive: true,
  },
]

export async function initializeServiceConfigs(): Promise<ServiceConfigResponse> {
  try {
    for (const configData of INITIAL_CONFIGS) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('serviceName', '==', configData.serviceName)
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        const now = new Date()
        const config: Omit<ServiceConfig, 'id'> = {
          ...configData,
          createdAt: now,
          updatedAt: now,
        }

        const firestoreData = {
          ...config,
          createdAt: Timestamp.fromDate(config.createdAt),
          updatedAt: Timestamp.fromDate(config.updatedAt),
        }

        const docRef = doc(collection(db, COLLECTION_NAME))
        await setDoc(docRef, firestoreData)
      }
    }

    return {
      success: true,
      message: 'Configuraciones inicializadas correctamente',
    }
  } catch (error) {
    console.error('❌ Error inicializando configuraciones:', error)
    return {
      success: false,
      message: 'Error al inicializar configuraciones',
      error: 'INITIALIZATION_ERROR',
    }
  }
}

export async function getServiceConfig(
  serviceName: string
): Promise<ServiceConfig | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('serviceName', '==', serviceName)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      id: doc.id,
      serviceName: data.serviceName,
      maxPerDay: data.maxPerDay,
      maxPerWeek: data.maxPerWeek,
      requiresDate: data.requiresDate,
      allowedDays: data.allowedDays,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  } catch (error) {
    console.error(
      `❌ Error obteniendo configuración para ${serviceName}:`,
      error
    )
    return null
  }
}

export async function getAllServiceConfigs(): Promise<ServiceConfig[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('serviceName', 'asc')
    )
    const querySnapshot = await getDocs(q)

    const configs: ServiceConfig[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      configs.push({
        id: doc.id,
        serviceName: data.serviceName,
        maxPerDay: data.maxPerDay,
        maxPerWeek: data.maxPerWeek,
        requiresDate: data.requiresDate,
        allowedDays: data.allowedDays,
        isActive: data.isActive,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      })
    })

    return configs
  } catch (error) {
    console.error('❌ Error obteniendo todas las configuraciones:', error)
    return []
  }
}

export async function updateServiceConfig(
  serviceName: string,
  configData: Partial<ServiceConfigInput>
): Promise<ServiceConfigResponse> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('serviceName', '==', serviceName)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        message: `No se encontró configuración para el servicio: ${serviceName}`,
        error: 'CONFIG_NOT_FOUND',
      }
    }

    const docRef = doc(db, COLLECTION_NAME, querySnapshot.docs[0].id)

    const updateData = {
      ...configData,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    await updateDoc(docRef, updateData)

    return {
      success: true,
      message: `Configuración de ${serviceName} actualizada correctamente`,
    }
  } catch (error) {
    console.error(
      `❌ Error actualizando configuración para ${serviceName}:`,
      error
    )
    return {
      success: false,
      message: 'Error al actualizar la configuración',
      error: 'UPDATE_ERROR',
    }
  }
}

export async function cleanDuplicateConfigs(): Promise<ServiceConfigResponse> {
  try {
    const allConfigs = await getAllServiceConfigs()
    const serviceGroups = new Map<string, ServiceConfig[]>()

    allConfigs.forEach(config => {
      if (!serviceGroups.has(config.serviceName)) {
        serviceGroups.set(config.serviceName, [])
      }
      serviceGroups.get(config.serviceName)!.push(config)
    })

    for (const [serviceName, configs] of serviceGroups) {
      if (configs.length > 1) {
        configs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

        const toKeep = configs[0]
        const toDelete = configs.slice(1)

        for (const configToDelete of toDelete) {
          await deleteDoc(doc(db, COLLECTION_NAME, configToDelete.id!))
        }
      }
    }

    return {
      success: true,
      message: 'Configuraciones duplicadas limpiadas correctamente',
    }
  } catch (error) {
    console.error('❌ Error limpiando configuraciones duplicadas:', error)
    return {
      success: false,
      message: 'Error al limpiar configuraciones duplicadas',
      error: 'CLEANUP_ERROR',
    }
  }
}
