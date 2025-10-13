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

export async function createVehicle(
  vehicleData: VehicleInput
): Promise<AdminResponse> {
  try {
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

    const existingVehicle = await getDoc(docRef)
    if (existingVehicle.exists()) {
      return {
        success: false,
        message: `Ya existe un vehículo con la patente ${normalizedPlate}`,
        error: 'DUPLICATE_PLATE',
      }
    }

    const dataToSave = {
      ...vehicleData,
      plateNumber: normalizedPlate,
      createdAt: vehicleData.createdAt || new Date(),
      updatedAt: vehicleData.createdAt || new Date(),
      km: vehicleData.km || 0,
      steps: vehicleData.steps || [],
    }

    const filteredData = filterUndefinedValues(dataToSave)

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
 * CORREGIDO: Actualizar vehículo existente con normalización de patente
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

    // ✅ NORMALIZAR la patente (quitar espacios)
    const normalizedPlate = plateNumber.replace(/\s+/g, '').toUpperCase()
    const docRef = doc(db, COLLECTION_NAME, normalizedPlate)

    if (updateData.steps) {
      updateData.steps = updateData.steps.map(step =>
        cleanStepForFirestore(step)
      )
    }

    const currentTime = new Date()
    const dataToUpdate = {
      ...updateData,
      plateNumber: normalizedPlate, // ✅ Guardar la patente normalizada
      updatedAt: currentTime,
    }

    if (updateData.km !== undefined) {
      dataToUpdate.km = Number(updateData.km) || 0
    }

    const filteredData = filterUndefinedValues(dataToUpdate)

    const validationErrors = validateFirestoreData(filteredData)
    if (validationErrors.length > 0) {
      console.error('❌ Datos con undefined detectados:', validationErrors)
      console.error(
        '📋 Datos problemáticos:',
        JSON.stringify(filteredData, null, 2)
      )

      const doubleFiltered = filterUndefinedValues(filteredData)

      await setDoc(docRef, doubleFiltered, { merge: true })
    } else {
      await setDoc(docRef, filteredData, { merge: true })
    }

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

    // ✅ Normalizar la patente antes de eliminar
    const normalizedPlate = plateNumber.replace(/\s+/g, '').toUpperCase()
    const vehicle = await getVehicleByPlate(normalizedPlate)

    if (vehicle && vehicle.steps) {
      const allFiles: StepFile[] = []
      vehicle.steps.forEach(step => {
        if (step.files) {
          allFiles.push(...step.files)
        }
      })

      if (allFiles.length > 0) {
        await Promise.allSettled(
          allFiles.map(file => deleteFileFromStorage(file.url))
        )
      }
    }

    const docRef = doc(db, COLLECTION_NAME, normalizedPlate)
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

export async function searchVehicles(criteria: {
  clientName?: string
  plateNumber?: string
  serviceType?: string
}): Promise<VehicleInput[]> {
  try {
    const queryRef = collection(db, COLLECTION_NAME)

    const constraints = []

    if (criteria.clientName) {
      constraints.push(where('clientName', '>=', criteria.clientName))
    }

    if (criteria.serviceType) {
      constraints.push(where('serviceType', '==', criteria.serviceType))
    }

    const finalQuery =
      constraints.length > 0 ? query(queryRef, ...constraints) : queryRef

    const querySnapshot = await getDocs(finalQuery)
    const vehicles: VehicleInput[] = []

    querySnapshot.forEach(doc => {
      vehicles.push(normalizeVehicleData(doc.data()))
    })

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
      files: step.files || [],
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

    const stepToDelete = vehicle.steps?.find(s => s.id === stepId)
    if (stepToDelete?.files) {
      await Promise.allSettled(
        stepToDelete.files.map(file => deleteFileFromStorage(file.url))
      )
    }

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

interface FluidLevel {
  aceite: number
  agua: number
  frenos: number
}

/**
 * Crea un step automático de inspección inicial de fluidos
 * Se llama cuando configuras los fluidos por primera vez al recibir el vehículo
 */
export async function createInitialFluidInspection(
  plateNumber: string,
  fluidLevels: FluidLevel
): Promise<AdminResponse> {
  try {
    // Detectar niveles bajos
    const warnings: string[] = []
    const aceiteStatus =
      fluidLevels.aceite < 50
        ? '(BAJO - Requiere atención)'
        : fluidLevels.aceite < 80
        ? '(MEDIO)'
        : '(ÓPTIMO)'
    const aguaStatus =
      fluidLevels.agua < 50
        ? '(BAJO - Requiere atención)'
        : fluidLevels.agua < 80
        ? '(MEDIO)'
        : '(ÓPTIMO)'
    const frenosStatus =
      fluidLevels.frenos < 50
        ? '(BAJO - Requiere atención)'
        : fluidLevels.frenos < 80
        ? '(MEDIO)'
        : '(ÓPTIMO)'

    if (fluidLevels.aceite < 50) warnings.push('Aceite')
    if (fluidLevels.agua < 50) warnings.push('Refrigerante')
    if (fluidLevels.frenos < 50) warnings.push('Líquido de frenos')

    // Crear descripción del step
    const description = `Inspección inicial de fluidos realizada al ingreso del vehículo.

Estado detectado:
🛢️ Aceite Motor: ${fluidLevels.aceite}% ${aceiteStatus}
💧 Refrigerante: ${fluidLevels.agua}% ${aguaStatus}
🔴 Líquido de Frenos: ${fluidLevels.frenos}% ${frenosStatus}

${
  warnings.length > 0
    ? `⚠️ ATENCIÓN: Se detectaron niveles bajos en: ${warnings.join(
        ', '
      )}.\nSe recomienda completar o cambiar durante este servicio.`
    : '✅ Todos los niveles de fluidos están en rangos aceptables.'
}`

    // Crear el step
    return await addVehicleStep(plateNumber, {
      title: '🔍 Inspección inicial de fluidos',
      notes: description,
      status: 'completed',
      date: new Date(),
    })
  } catch (error) {
    console.error('Error creando inspección inicial de fluidos:', error)
    return {
      success: false,
      message: 'Error al crear inspección inicial',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Crea un step automático cuando se actualizan los niveles de fluidos
 * Documenta qué cambió y el estado anterior vs actual
 */
export async function createFluidChangeStep(
  plateNumber: string,
  previousLevels: FluidLevel,
  newLevels: FluidLevel,
  customNotes?: string
): Promise<AdminResponse> {
  try {
    // Detectar qué fluidos cambiaron
    const changes: string[] = []
    const details: string[] = []

    if (previousLevels.aceite !== newLevels.aceite) {
      const diff = newLevels.aceite - previousLevels.aceite
      if (diff > 0) {
        changes.push('Aceite')
        details.push(
          `🛢️ Aceite: ${previousLevels.aceite}% → ${newLevels.aceite}% (+${diff}%)`
        )
      } else {
        details.push(
          `🛢️ Aceite: ${previousLevels.aceite}% → ${newLevels.aceite}% (${diff}%)`
        )
      }
    }

    if (previousLevels.agua !== newLevels.agua) {
      const diff = newLevels.agua - previousLevels.agua
      if (diff > 0) {
        changes.push('Refrigerante')
        details.push(
          `💧 Refrigerante: ${previousLevels.agua}% → ${newLevels.agua}% (+${diff}%)`
        )
      } else {
        details.push(
          `💧 Refrigerante: ${previousLevels.agua}% → ${newLevels.agua}% (${diff}%)`
        )
      }
    }

    if (previousLevels.frenos !== newLevels.frenos) {
      const diff = newLevels.frenos - previousLevels.frenos
      if (diff > 0) {
        changes.push('Líquido de frenos')
        details.push(
          `🔴 Líquido de Frenos: ${previousLevels.frenos}% → ${newLevels.frenos}% (+${diff}%)`
        )
      } else {
        details.push(
          `🔴 Líquido de Frenos: ${previousLevels.frenos}% → ${newLevels.frenos}% (${diff}%)`
        )
      }
    }

    // Si no hubo cambios, no crear step
    if (changes.length === 0) {
      return {
        success: true,
        message: 'No hay cambios en los niveles de fluidos',
      }
    }

    // Crear título descriptivo
    const title =
      changes.length === 1
        ? `✅ ${changes[0]} actualizado`
        : `✅ Actualización de fluidos (${changes.length})`

    // Crear descripción
    const description = `${
      customNotes || 'Se realizó actualización de niveles de fluidos.'
    }

Cambios realizados:
${details.join('\n')}

Estado final:
🛢️ Aceite: ${newLevels.aceite}% ${
      newLevels.aceite >= 80 ? '✅' : newLevels.aceite >= 50 ? '⚠️' : '❌'
    }
💧 Refrigerante: ${newLevels.agua}% ${
      newLevels.agua >= 80 ? '✅' : newLevels.agua >= 50 ? '⚠️' : '❌'
    }
🔴 Líquido de Frenos: ${newLevels.frenos}% ${
      newLevels.frenos >= 80 ? '✅' : newLevels.frenos >= 50 ? '⚠️' : '❌'
    }`

    // Crear el step
    return await addVehicleStep(plateNumber, {
      title,
      notes: description,
      status: 'completed',
      date: new Date(),
    })
  } catch (error) {
    console.error('Error creando step de cambio de fluidos:', error)
    return {
      success: false,
      message: 'Error al crear registro de cambio de fluidos',
      error: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Helper: Verifica si hubo cambios en los niveles
 */
export function hasFluidChanges(
  previous: FluidLevel,
  current: FluidLevel
): boolean {
  return (
    previous.aceite !== current.aceite ||
    previous.agua !== current.agua ||
    previous.frenos !== current.frenos
  )
}
