export * from './turnos'

export * from './serviceconfig'

export * from './vehicle'

export * from './admin'

export {
  getSeguimientoByPatente,
  buscarVehiculosPorPatente,
  actualizarEstadoVehiculo,
} from './seguimiento'

export type {
  AdminResponse,
  Turno,
  TurnoInput,
  TurnoResponse,
  AvailabilityCheck,
  ServiceConfig,
  ServiceConfigInput,
  ServiceConfigResponse,
  VehicleInput,
  VehicleStep,
  TimelineItem as SeguimientoTimelineItem,
  ImagenItem as SeguimientoImagenItem,
  SeguimientoData as SeguimientoVehicleData,
} from './types/types'

export * from './utils/dataUtils'
