import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import {
  VehicleInput,
  VehicleStep,
  StepFile,
  AdminResponse,
} from './types/types'
import {
  filterUndefinedValues,
  normalizeVehicleData,
  cleanStepForFirestore,
  validateFirestoreData,
} from './utils/dataUtils'
import { deleteFileFromStorage } from '@/lib/storageUtils'

const COLLECTION_NAME = 'vehicles'

/**
 * Función de migración: agregar updatedAt a vehículos existentes
 * Ejecutar UNA SOLA VEZ para corregir vehículos que no tienen updatedAt
 */
export async function migrateUpdatedAtField(): Promise<{
  success: boolean
  migrated: number
  skipped: number
  message: string
}> {
  try {
    console.log('🔄 Iniciando migración de campo updatedAt...')

    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    let migrated = 0
    let skipped = 0

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data()

      // Si ya tiene updatedAt, saltar
      if (data.updatedAt) {
        skipped++
        continue
      }

      // Usar createdAt como updatedAt inicial
      const updatedAt = data.createdAt || new Date()

      await updateDoc(doc(db, COLLECTION_NAME, docSnapshot.id), {
        updatedAt: updatedAt,
      })

      migrated++
      console.log(`✅ Migrado: ${docSnapshot.id}`)
    }

    const message = `Migración completada: ${migrated} vehículos actualizados, ${skipped} ya tenían updatedAt`
    console.log(`🎉 ${message}`)

    return {
      success: true,
      migrated,
      skipped,
      message,
    }
  } catch (error) {
    console.error('❌ Error en migración:', error)
    return {
      success: false,
      migrated: 0,
      skipped: 0,
      message:
        'Error en la migración: ' +
        (error instanceof Error ? error.message : 'Error desconocido'),
    }
  }
}

/**
 * Obtener todos los vehículos
 */
export async function getAllVehicles(): Promise<VehicleInput[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const vehicles: VehicleInput[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      vehicles.push(normalizeVehicleData(data))
    })

    return vehicles
  } catch (error) {
    console.error('Error obteniendo vehículos:', error)
    return []
  }
}

/**
 * Obtener vehículo por patente
 */
export async function getVehicleByPlate(
  plateNumber: string
): Promise<VehicleInput | null> {
  try {
    const normalizedPlate = plateNumber.replace(/\s+/g, '').toUpperCase()
    const docRef = doc(db, COLLECTION_NAME, normalizedPlate)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return normalizeVehicleData(docSnap.data())
  } catch (error) {
    console.error('Error obteniendo vehículo:', error)
    return null
  }
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
    const docRef = doc(db, COLLECTION_NAME, normalizedPlate)

    // Verificar si ya existe
    const existingVehicle = await getDoc(docRef)
    if (existingVehicle.exists()) {
      return {
        success: false,
        message: `Ya existe un vehículo con la patente ${normalizedPlate}`,
        error: 'DUPLICATE_PLATE',
      }
    }

    // Preparar datos
    const dataToSave = {
      ...vehicleData,
      plateNumber: normalizedPlate,
      createdAt: vehicleData.createdAt || new Date(),
      updatedAt: vehicleData.createdAt || new Date(), // ← NUEVO: inicializar updatedAt
      km: vehicleData.km || 0,
      steps: vehicleData.steps || [],
    }

    // MEJORADO: Aplicar filtro recursivo
    const filteredData = filterUndefinedValues(dataToSave)

    // VALIDACIÓN: Verificar que no queden undefined
    const validationErrors = validateFirestoreData(filteredData)
    if (validationErrors.length > 0) {
      console.error(
        '❌ Datos con undefined detectados en creación:',
        validationErrors
      )
      console.error(
        '📋 Datos problemáticos:',
        JSON.stringify(filteredData, null, 2)
      )

      // Aplicar filtro doble
      const doubleFiltered = filterUndefinedValues(filteredData)
      await setDoc(docRef, doubleFiltered)
    } else {
      await setDoc(docRef, filteredData)
    }

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
 * ACTUALIZADO: Actualizar vehículo existente con manejo de archivos
 */
export async function updateVehicle(
  plateNumber: string,
  updateData: Partial<VehicleInput>
): Promise<AdminResponse> {
  try {
    console.log('🔄 updateVehicle llamada para:', plateNumber)
    console.log('📝 updateData recibido:', updateData)

    if (!plateNumber) {
      return {
        success: false,
        message: 'Falta la patente',
        error: 'MISSING_PLATE',
      }
    }

    const docRef = doc(db, COLLECTION_NAME, plateNumber)

    // MEJORADO: Si se están actualizando los steps, usar funciones de limpieza
    if (updateData.steps) {
      updateData.steps = updateData.steps.map(step =>
        cleanStepForFirestore(step)
      )
    }

    const currentTime = new Date()
    const dataToUpdate = {
      ...updateData,
      plateNumber,
      updatedAt: currentTime, // CRÍTICO: SIEMPRE actualizar la fecha
    }

    console.log('⏰ updatedAt establecido a:', currentTime)
    console.log('📦 dataToUpdate completo:', dataToUpdate)

    if (updateData.km !== undefined) {
      dataToUpdate.km = Number(updateData.km) || 0
    }

    // CRÍTICO: Aplicar filtro recursivo para eliminar todos los undefined
    const filteredData = filterUndefinedValues(dataToUpdate)

    console.log('🧹 Datos después del filtro:', filteredData)
    console.log('📅 updatedAt en datos filtrados:', filteredData.updatedAt)

    // VALIDACIÓN ADICIONAL: Verificar que no queden undefined
    const validationErrors = validateFirestoreData(filteredData)
    if (validationErrors.length > 0) {
      console.error('❌ Datos con undefined detectados:', validationErrors)
      console.error(
        '📋 Datos problemáticos:',
        JSON.stringify(filteredData, null, 2)
      )

      // Aplicar filtro una vez más para asegurar limpieza
      const doubleFiltered = filterUndefinedValues(filteredData)
      console.log('🧹🧹 Datos después del doble filtro:', doubleFiltered)

      await setDoc(docRef, doubleFiltered, { merge: true })
    } else {
      console.log('✅ Datos validados correctamente para Firestore')
      await setDoc(docRef, filteredData, { merge: true })
    }

    console.log('💾 Documento guardado en Firestore')

    return {
      success: true,
      message: 'Vehículo actualizado correctamente',
    }
  } catch (error) {
    console.error('❌ Error actualizando vehículo:', error)
    return {
      success: false,
      message: 'Error al actualizar el vehículo',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}

/**
 * ACTUALIZADO: Eliminar vehículo con limpieza de archivos de Storage
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

    // Obtener el vehículo para limpiar archivos
    const vehicle = await getVehicleByPlate(plateNumber)

    if (vehicle && vehicle.steps) {
      // Recopilar todas las URLs de archivos para eliminar de Storage
      const allFiles: StepFile[] = []
      vehicle.steps.forEach(step => {
        if (step.files) {
          allFiles.push(...step.files)
        }
      })

      // Eliminar archivos de Storage de forma paralela
      if (allFiles.length > 0) {
        await Promise.allSettled(
          allFiles.map(file => deleteFileFromStorage(file.url))
        )
      }
    }

    // Eliminar documento de Firestore
    const docRef = doc(db, COLLECTION_NAME, plateNumber)
    await deleteDoc(docRef)

    return {
      success: true,
      message: 'Vehículo eliminado correctamente',
    }
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
 * Buscar vehículos por múltiples criterios
 */
export async function searchVehicles(criteria: {
  clientName?: string
  plateNumber?: string
  serviceType?: string
}): Promise<VehicleInput[]> {
  try {
    // Construir query paso a paso
    const queryRef = collection(db, COLLECTION_NAME)

    // Crear array de constraints
    const constraints = []

    // Agregar filtros según criterios
    if (criteria.clientName) {
      constraints.push(where('clientName', '>=', criteria.clientName))
    }

    if (criteria.serviceType) {
      constraints.push(where('serviceType', '==', criteria.serviceType))
    }

    // Aplicar constraints solo si existen
    const finalQuery =
      constraints.length > 0 ? query(queryRef, ...constraints) : queryRef

    const querySnapshot = await getDocs(finalQuery)
    const vehicles: VehicleInput[] = []

    querySnapshot.forEach(doc => {
      vehicles.push(normalizeVehicleData(doc.data()))
    })

    // Filtrar por patente en el cliente si se especifica (Firestore no soporta LIKE)
    if (criteria.plateNumber) {
      return vehicles.filter(vehicle =>
        vehicle.plateNumber
          .toLowerCase()
          .includes(criteria.plateNumber!.toLowerCase())
      )
    }

    return vehicles
  } catch (error) {
    console.error('Error buscando vehículos:', error)
    return []
  }
}

/**
 * NUEVO: Agregar paso/trabajo realizado a un vehículo
 */
export async function addVehicleStep(
  plateNumber: string,
  step: Omit<VehicleStep, 'id'>
): Promise<AdminResponse> {
  try {
    const vehicle = await getVehicleByPlate(plateNumber)
    if (!vehicle) {
      return {
        success: false,
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
      }
    }

    const newStep: VehicleStep = {
      ...step,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
      files: step.files || [], // Asegurar que files esté presente
    }

    const updatedSteps = [...(vehicle.steps || []), newStep]

    return await updateVehicle(plateNumber, { steps: updatedSteps })
  } catch (error) {
    console.error('Error agregando paso:', error)
    return {
      success: false,
      message: 'Error al agregar el paso',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * NUEVO: Eliminar paso específico de un vehículo con limpieza de archivos
 */
export async function removeVehicleStep(
  plateNumber: string,
  stepId: string
): Promise<AdminResponse> {
  try {
    const vehicle = await getVehicleByPlate(plateNumber)
    if (!vehicle) {
      return {
        success: false,
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
      }
    }

    // Encontrar el step a eliminar para limpiar sus archivos
    const stepToDelete = vehicle.steps?.find(s => s.id === stepId)
    if (stepToDelete?.files) {
      // Eliminar archivos de Storage
      await Promise.allSettled(
        stepToDelete.files.map(file => deleteFileFromStorage(file.url))
      )
    }

    // Filtrar steps
    const updatedSteps = (vehicle.steps || []).filter(
      step => step.id !== stepId
    )

    return await updateVehicle(plateNumber, { steps: updatedSteps })
  } catch (error) {
    console.error('Error eliminando paso:', error)
    return {
      success: false,
      message: 'Error al eliminar el paso',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * NUEVO: Obtener estadísticas de archivos de un vehículo
 */
export async function getVehicleFileStats(plateNumber: string): Promise<{
  totalFiles: number
  totalImages: number
  totalVideos: number
  totalSize: number
} | null> {
  try {
    const vehicle = await getVehicleByPlate(plateNumber)
    if (!vehicle || !vehicle.steps) {
      return null
    }

    let totalFiles = 0
    let totalImages = 0
    let totalVideos = 0
    let totalSize = 0

    vehicle.steps.forEach(step => {
      if (step.files) {
        step.files.forEach(file => {
          totalFiles++
          totalSize += file.size
          if (file.type === 'image') {
            totalImages++
          } else if (file.type === 'video') {
            totalVideos++
          }
        })
      }
    })

    return {
      totalFiles,
      totalImages,
      totalVideos,
      totalSize,
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas de archivos:', error)
    return null
  }
}
