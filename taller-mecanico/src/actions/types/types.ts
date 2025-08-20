export interface AdminResponse {
  success: boolean
  message: string
  error?: string
}

export interface BaseEntity {
  id?: string
  createdAt: Date
  updatedAt: Date
}

// === TURNOS ===
export interface Turno extends BaseEntity {
  name: string
  email: string
  phone: string
  vehicle: string
  service: string
  subService?: string
  date: Date | null
  time: string
  message: string
  status: 'pending' | 'cancelled' | 'completed' | 'reprogrammed'
  cancelToken: string
}

export interface TurnoInput {
  name: string
  email: string
  phone: string
  vehicle: string
  service: string
  subService?: string
  date: Date | null
  time: string
  message: string
  cancelToken: string
}

export interface TurnoResponse extends AdminResponse {
  turno?: Turno
}

export interface AvailabilityCheck {
  date: string
  service: string
  available: boolean
  totalSlots: number
  usedSlots: number
}

// === CONFIGURACIÓN DE SERVICIOS ===
export interface ServiceConfig extends BaseEntity {
  serviceName: string
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[] // 1=Lunes, 2=Martes, etc.
  isActive: boolean
}

export interface ServiceConfigInput {
  serviceName: string
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[]
  isActive: boolean
}

export interface ServiceConfigResponse extends AdminResponse {
  config?: ServiceConfig
}

// === VEHÍCULOS ===
export interface VehicleStep {
  id: string
  title: string
  description?: string
  status: 'completed' | 'pending' | 'in-progress'
  date: Date
  notes?: string
}

export interface VehicleInput {
  plateNumber: string // obligatorio
  clientName: string // obligatorio
  brand?: string
  model?: string
  year?: number
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  totalCost?: number
  createdAt?: Date
  estimatedCompletionDate?: Date | null
  notes?: string
  nextStep?: string
  steps?: VehicleStep[]
}

// === SEGUIMIENTO ===
export interface TimelineItem {
  id: number
  fecha: string
  hora: string
  estado: string
  descripcion: string
  completado: boolean
}

export interface ImagenItem {
  id: number
  url: string
  fecha: string
  descripcion: string
  tipo: 'antes' | 'proceso' | 'despues'
}

export interface SeguimientoData {
  patente: string
  modelo: string
  marca: string
  año: string
  cliente: string
  fechaIngreso: string
  estadoActual?: string
  telefono?: string
  tipoServicio?: string
  trabajosRealizados?: string[]
  proximoPaso?: string
  fechaEstimadaEntrega?: string
  timeline?: TimelineItem[]
  imagenes?: ImagenItem[]
}
