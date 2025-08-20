import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AdminResponse } from './types/types'

const CONFIG_COLLECTION = 'admin'
const GENERAL_CONFIG_DOC = 'generalConfig'

interface GeneralConfig {
  businessHours: {
    monday: { start: string; end: string; active: boolean }
    tuesday: { start: string; end: string; active: boolean }
    wednesday: { start: string; end: string; active: boolean }
    thursday: { start: string; end: string; active: boolean }
    friday: { start: string; end: string; active: boolean }
    saturday: { start: string; end: string; active: boolean }
    sunday: { start: string; end: string; active: boolean }
  }
  contactInfo: {
    phone: string
    email: string
    address: string
    whatsapp: string
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    clientNotifications: boolean
    adminNotifications: boolean
  }
  maintenanceMode: boolean
  version: string
  updatedAt: Date
}

const DEFAULT_GENERAL_CONFIG: GeneralConfig = {
  businessHours: {
    monday: { start: '08:00', end: '17:00', active: true },
    tuesday: { start: '08:00', end: '17:00', active: true },
    wednesday: { start: '08:00', end: '17:00', active: true },
    thursday: { start: '08:00', end: '17:00', active: true },
    friday: { start: '08:00', end: '17:00', active: true },
    saturday: { start: '08:00', end: '12:00', active: false },
    sunday: { start: '08:00', end: '12:00', active: false },
  },
  contactInfo: {
    phone: '+54 11 1234-5678',
    email: 'info@taller.com',
    address: 'Dirección del taller',
    whatsapp: '+54 11 1234-5678',
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    clientNotifications: true,
    adminNotifications: true,
  },
  maintenanceMode: false,
  version: '1.0.0',
  updatedAt: new Date(),
}

/**
 * Cargar configuración general
 */
export async function loadGeneralConfig(): Promise<GeneralConfig> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, GENERAL_CONFIG_DOC)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        updatedAt: data.updatedAt.toDate(),
      } as GeneralConfig
    } else {
      // Crear configuración por defecto
      await saveGeneralConfig(DEFAULT_GENERAL_CONFIG)
      return DEFAULT_GENERAL_CONFIG
    }
  } catch (error) {
    console.error('Error loading general config:', error)
    return DEFAULT_GENERAL_CONFIG
  }
}

/**
 * Guardar configuración general
 */
export async function saveGeneralConfig(
  config: GeneralConfig
): Promise<AdminResponse> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, GENERAL_CONFIG_DOC)
    const dataToSave = {
      ...config,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    await setDoc(docRef, dataToSave)

    return {
      success: true,
      message: 'Configuración guardada exitosamente',
    }
  } catch (error) {
    console.error('Error saving general config:', error)
    return {
      success: false,
      message: 'Error al guardar la configuración',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}

/**
 * Resetear configuración a valores por defecto
 */
export async function resetGeneralConfig(): Promise<AdminResponse> {
  return await saveGeneralConfig(DEFAULT_GENERAL_CONFIG)
}

/**
 * Activar/desactivar modo mantenimiento
 */
export async function toggleMaintenanceMode(
  enabled: boolean
): Promise<AdminResponse> {
  try {
    const currentConfig = await loadGeneralConfig()
    const updatedConfig = {
      ...currentConfig,
      maintenanceMode: enabled,
      updatedAt: new Date(),
    }

    return await saveGeneralConfig(updatedConfig)
  } catch (error) {
    console.error('Error toggling maintenance mode:', error)
    return {
      success: false,
      message: 'Error al cambiar modo mantenimiento',
      error: 'INTERNAL_ERROR',
    }
  }
}
