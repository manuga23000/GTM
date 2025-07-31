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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: Date
  updatedAt: Date
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
}

export interface AvailabilityCheck {
  date: string // YYYY-MM-DD format
  service: string
  available: boolean
  totalSlots: number
  usedSlots: number
}

export interface TurnoResponse {
  success: boolean
  message: string
  turno?: Turno
  error?: string
}
