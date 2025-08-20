// Turnos
export * from './turnos'

// Configuración de servicios
export * from './serviceconfig'

// Vehículos
export * from './vehicle'

// Administración
export * from './admin'

// Seguimiento - exportaciones específicas para evitar conflictos
export {
  getSeguimientoByPatente,
  buscarVehiculosPorPatente,
  actualizarEstadoVehiculo,
} from './seguimiento'

// Tipos - exportaciones específicas para evitar duplicados
export type {
  // Tipos principales
  AdminResponse,

  // Turnos
  Turno,
  TurnoInput,
  TurnoResponse,
  AvailabilityCheck,

  // Servicios
  ServiceConfig,
  ServiceConfigInput,
  ServiceConfigResponse,

  // Vehículos
  VehicleInput,
  VehicleStep,

  // Seguimiento - usar alias para evitar conflictos
  TimelineItem as SeguimientoTimelineItem,
  ImagenItem as SeguimientoImagenItem,
  SeguimientoData as SeguimientoVehicleData,
} from './types/types'

// Utilidades
export * from './utils/dataUtils'
