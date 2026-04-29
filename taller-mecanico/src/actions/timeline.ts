import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
  toDate?: () => Date
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (value && typeof value === 'object') {
    if ('toDate' in value && typeof (value as FirestoreTimestamp).toDate === 'function') {
      return (value as FirestoreTimestamp).toDate!()
    }
    if ('seconds' in value) {
      return new Date((value as FirestoreTimestamp).seconds * 1000)
    }
  }
  if (typeof value === 'string') return new Date(value)
  return new Date()
}

export interface TimelineVehicle {
  id: string
  plateNumber: string
  clientName: string
  clientPhone?: string
  brand?: string
  model?: string
  year?: number
  serviceType?: string
  km?: number
  entryDate: Date
  finalizedAt: Date
  serviceNumber: number
  stepsCount: number
  notes?: string
}

export async function getAllTimelineVehicles(): Promise<TimelineVehicle[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'timeline'))
    const vehicles: TimelineVehicle[] = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      vehicles.push({
        id: doc.id,
        plateNumber: data.plateNumber || '',
        clientName: data.clientName || '',
        clientPhone: data.clientPhone || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || undefined,
        serviceType: data.serviceType || '',
        km: data.km || undefined,
        entryDate: toDate(data.entryDate || data.createdAt),
        finalizedAt: toDate(data.finalizedAt),
        serviceNumber: data.serviceNumber || 1,
        stepsCount: Array.isArray(data.steps) ? data.steps.length : 0,
        notes: data.notes || '',
      })
    })

    return vehicles
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return []
  }
}
