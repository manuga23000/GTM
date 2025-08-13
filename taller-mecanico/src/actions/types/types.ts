// actions/types/types.ts
export interface Turno {
  id?: string
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
  createdAt: Date
  updatedAt: Date
  cancelToken: string // Token único para cancelar el turno
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
  cancelToken: string // Token único para cancelar el turno
}

export interface TurnoResponse {
  success: boolean
  message: string
  error?: string
  turno?: Turno
}

export interface AvailabilityCheck {
  date: string
  service: string
  available: boolean
  totalSlots: number
  usedSlots: number
}

// NUEVOS TIPOS PARA CONFIGURACIÓN DE SERVICIOS
export interface ServiceConfig {
  id?: string
  serviceName: string
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[] // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ServiceConfigInput {
  serviceName: string
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[]
  isActive: boolean
}

export interface ServiceConfigResponse {
  success: boolean
  message: string
  error?: string
  config?: ServiceConfig
}

// NUEVO: Tipo para alta de vehículo
export interface VehicleInput {
  plateNumber: string;
  brand: string;
  model: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  createdAt: Date;
}
