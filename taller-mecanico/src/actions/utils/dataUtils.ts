import { VehicleInput } from '../types/types'

/**
 * Filtrar valores undefined para Firebase
 */
export function filterUndefinedValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key] = value
    }
  }
  return filtered
}

/**
 * Normalizar datos de vehículo desde Firebase
 */
export function normalizeVehicleData(data: any): VehicleInput {
  return {
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
    totalCost: data.totalCost || 0,
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
      : null,
    notes: data.notes || '',
    nextStep: data.nextStep || '',
    steps: Array.isArray(data.steps)
      ? data.steps.map((step: any) => ({
          id: typeof step.id === 'string' ? step.id : '',
          title: typeof step.title === 'string' ? step.title : '',
          description: typeof step.description === 'string' ? step.description : '',
          status: ['completed', 'pending', 'in-progress'].includes(step.status)
            ? step.status
            : 'pending',
          date:
            step.date instanceof Date
              ? step.date
              : step.date?.toDate
              ? step.date.toDate()
              : step.date
              ? new Date(step.date)
              : null,
          notes: typeof step.notes === 'string' ? step.notes : '',
        }))
      : (typeof data.steps === 'object' && data.steps !== null
        ? Object.values(data.steps).map((step: any) => ({
            id: typeof step.id === 'string' ? step.id : '',
            title: typeof step.title === 'string' ? step.title : '',
            description: typeof step.description === 'string' ? step.description : '',
            status: ['completed', 'pending', 'in-progress'].includes(step.status)
              ? step.status
              : 'pending',
            date:
              step.date instanceof Date
                ? step.date
                : step.date?.toDate
                ? step.date.toDate()
                : step.date
                ? new Date(step.date)
                : null,
            notes: typeof step.notes === 'string' ? step.notes : '',
          }))
        : []),
  }
}

/**
 * Formatear fecha para Firestore
 */
export function formatDateForFirestore(date: unknown): Date | null {
  if (!date) return null

  if (date instanceof Date) return date

  if (typeof date === 'string') {
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  // Si es Timestamp de Firestore
  if (typeof date === 'object' && date !== null && 'toDate' in date) {
    return (date as any).toDate()
  }

  return null
}
