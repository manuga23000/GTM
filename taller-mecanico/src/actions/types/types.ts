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

// === ARCHIVOS DE STORAGE ===
// ACTUALIZADO: Interface para archivos del step (con Storage y thumbnails)
export interface StepFile {
  id: string
  fileName: string // Nombre original del archivo
  type: 'image' | 'video'
  url: string // URL de Firebase Storage (permanente)
  thumbnailUrl?: string // URL del thumbnail (solo para imágenes)
  storageRef: string // Referencia en Storage para eliminar
  uploadedAt: Date // Fecha de subida
  size: number // Tamaño del archivo en bytes
  dimensions?: {
    // Dimensiones originales (solo para imágenes)
    width: number
    height: number
  }
}

// NUEVO: Interface para archivos en proceso de subida (temporal)
export interface PendingStepFile {
  id: string
  file: File
  type: 'image' | 'video'
  tempUrl: string // URL temporal para preview
  uploadProgress?: number // Progreso de subida (0-100)
  uploading?: boolean // Si está subiendo
  error?: string // Error de subida
}

// === VEHÍCULOS ===
export interface VehicleStep {
  id: string
  title: string
  status: 'completed' | 'pending' | 'in-progress'
  date: Date
  notes?: string
  files?: StepFile[] // ACTUALIZADO: archivos de Storage
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
  updatedAt?: string // Agregado campo para última actualización
}
