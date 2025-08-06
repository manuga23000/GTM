// actions/serviceConfig.ts
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

// Configuración inicial para servicios con configuración dinámica
const INITIAL_CONFIGS: ServiceConfigInput[] = [
  {
    serviceName: 'Diagnóstico',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5], // Lunes a viernes
    isActive: true,
  },
  {
    serviceName: 'Revisación técnica',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5], // Lunes a viernes
    isActive: true,
  },
  {
    serviceName: 'Otro',
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5], // Lunes a viernes
    isActive: true,
  },
  // Sub-servicios de Caja automática
  {
    serviceName: 'Service de mantenimiento',
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5], // Lunes a viernes
    isActive: true,
  },
  {
    serviceName: 'Diagnóstico de caja',
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3], // Lunes a miércoles
    isActive: true,
  },
  {
    serviceName: 'Reparación de fugas',
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3], // Lunes a miércoles
    isActive: true,
  },
  {
    serviceName: 'Cambio de solenoides',
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3], // Lunes a miércoles
    isActive: true,
  },
  {
    serviceName: 'Overhaul completo',
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: true,
    allowedDays: [1, 2, 3], // Lunes a miércoles
    isActive: true,
  },
  {
    serviceName: 'Reparaciones mayores',
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: true,
    allowedDays: [1, 2, 3], // Lunes a miércoles
    isActive: true,
  },
]

/**
 * Inicializar configuraciones por defecto si no existen
 */
export async function initializeServiceConfigs(): Promise<ServiceConfigResponse> {
  try {
    console.log('🚀 Inicializando configuraciones de servicios...')

    for (const configData of INITIAL_CONFIGS) {
      // Verificar si ya existe la configuración
      const q = query(
        collection(db, COLLECTION_NAME),
        where('serviceName', '==', configData.serviceName)
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // No existe, crear configuración inicial
        const now = new Date()
        const config: Omit<ServiceConfig, 'id'> = {
          ...configData,
          createdAt: now,
          updatedAt: now,
        }

        // Convertir fechas a Timestamp para Firestore
        const firestoreData = {
          ...config,
          createdAt: Timestamp.fromDate(config.createdAt),
          updatedAt: Timestamp.fromDate(config.updatedAt),
        }

        const docRef = doc(collection(db, COLLECTION_NAME))
        await setDoc(docRef, firestoreData)

        console.log(`✅ Configuración creada para: ${configData.serviceName}`)
      } else {
        console.log(
          `📝 Configuración ya existe para: ${configData.serviceName}`
        )
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

/**
 * Obtener configuración de un servicio específico
 */
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

/**
 * Obtener todas las configuraciones de servicios
 */
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

/**
 * Actualizar configuración de un servicio
 */
export async function updateServiceConfig(
  serviceName: string,
  configData: Partial<ServiceConfigInput>
): Promise<ServiceConfigResponse> {
  try {
    console.log(`🔄 Actualizando configuración para: ${serviceName}`)
    console.log('📋 Nuevos datos:', configData)

    // Buscar la configuración existente
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

    // Preparar datos para actualización
    const updateData = {
      ...configData,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    await updateDoc(docRef, updateData)

    console.log(`✅ Configuración actualizada para: ${serviceName}`)

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

/**
 * Limpiar configuraciones duplicadas (mantener solo la más reciente)
 */
export async function cleanDuplicateConfigs(): Promise<ServiceConfigResponse> {
  try {
    console.log('🧹 Limpiando configuraciones duplicadas...')

    const allConfigs = await getAllServiceConfigs()
    const serviceGroups = new Map<string, ServiceConfig[]>()

    // Agrupar por serviceName
    allConfigs.forEach(config => {
      if (!serviceGroups.has(config.serviceName)) {
        serviceGroups.set(config.serviceName, [])
      }
      serviceGroups.get(config.serviceName)!.push(config)
    })

    // Para cada grupo, mantener solo la más reciente
    for (const [serviceName, configs] of serviceGroups) {
      if (configs.length > 1) {
        console.log(
          `🔍 Encontradas ${configs.length} configuraciones para ${serviceName}`
        )

        // Ordenar por fecha de actualización (más reciente primero)
        configs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

        // Mantener solo la primera (más reciente) y eliminar las demás
        const toKeep = configs[0]
        const toDelete = configs.slice(1)

        console.log(
          `✅ Manteniendo configuración ${toKeep.id} para ${serviceName}`
        )

        for (const configToDelete of toDelete) {
          console.log(
            `🗑️ Eliminando configuración duplicada ${configToDelete.id}`
          )
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
