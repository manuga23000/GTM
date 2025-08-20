import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { VehicleInput, VehicleStep, AdminResponse } from './types/types'
import { filterUndefinedValues, normalizeVehicleData } from './utils/dataUtils'

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
      totalCost: vehicleData.totalCost || 0,
    }

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
 * Actualizar vehículo existente
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

    const docRef = doc(db, COLLECTION_NAME, plateNumber)

    const dataToUpdate = {
      ...updateData,
      plateNumber,
      updatedAt: new Date(),
    }

    if (updateData.totalCost !== undefined) {
      dataToUpdate.totalCost = Number(updateData.totalCost) || 0
    }

    const filteredData = filterUndefinedValues(dataToUpdate)
    await setDoc(docRef, filteredData, { merge: true })

    return {
      success: true,
      message: 'Vehículo actualizado correctamente',
    }
  } catch (error) {
    console.error('Error actualizando vehículo:', error)
    return {
      success: false,
      message: 'Error al actualizar el vehículo',
      error: error instanceof Error ? error.message : 'INTERNAL_ERROR',
    }
  }
}

/**
 * Eliminar vehículo
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
    let queryRef = collection(db, COLLECTION_NAME)

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
 * Agregar paso/trabajo realizado a un vehículo
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
