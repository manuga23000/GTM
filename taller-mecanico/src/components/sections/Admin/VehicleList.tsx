import { motion } from 'framer-motion'

export interface StepFile {
  id: string
  fileName: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  storageRef: string
  uploadedAt: Date
  size: number
  dimensions?: {
    width: number
    height: number
  }
}

export interface VehicleStep {
  id: string
  title: string
  status: 'completed'
  date: Date
  notes?: string
  files?: StepFile[]
}

export interface VehicleInTracking {
  id: string
  plateNumber: string
  clientName: string
  brand?: string
  model?: string
  year?: number
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  entryDate: Date
  estimatedCompletionDate?: Date | null
  status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered'
  km?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
}

interface VehicleListProps {
  vehicles: VehicleInTracking[]
  selectedVehicle: string
  setSelectedVehicle: (id: string) => void
  getStatusColor: (status: VehicleInTracking['status']) => string
  getStatusText: (status: VehicleInTracking['status']) => string
}

export default function VehicleList({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
  getStatusColor,
  getStatusText,
}: VehicleListProps) {
  return (
    <div className='bg-gray-800 rounded-xl p-3 sm:p-6'>
      <h3 className='text-lg sm:text-xl font-semibold mb-4 sm:mb-6'>
        Vehículos Activos
      </h3>
      {vehicles.length === 0 ? (
        <div className='text-center py-8 sm:py-12'>
          <p className='text-gray-400 text-sm sm:text-base'>
            No hay vehículos para mostrar
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
          {vehicles.map(vehicle => {
            return (
              <motion.div
                key={vehicle.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => {
                  // Si hacemos click en el mismo vehículo, lo deseleccionamos
                  if (selectedVehicle === vehicle.id) {
                    setSelectedVehicle('')
                  } else {
                    // Si hacemos click en un vehículo diferente, lo seleccionamos directamente
                    setSelectedVehicle(vehicle.id)
                  }
                }}
              >
                {/* Header de la card - OPTIMIZADO MOBILE */}
                <div className='flex justify-between items-start mb-2 sm:mb-3'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-bold text-base sm:text-lg text-white truncate'>
                      {vehicle.plateNumber}
                    </h4>
                    <p className='text-gray-300 text-xs sm:text-sm truncate'>
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </p>
                  </div>

                  {/* Status - COMPACTO EN MÓVILES */}
                  <div className='flex flex-col items-end gap-1 ml-2'>
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                        vehicle.status
                      )} whitespace-nowrap`}
                    >
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>

                {/* Información principal - LAYOUT VERTICAL EN MÓVILES */}
                <div className='space-y-1 sm:space-y-2 text-xs sm:text-sm'>
                  {/* Cliente - PRIORIDAD EN MÓVILES */}
                  <div className='flex items-center gap-2'>
                    <span className='text-blue-400'>👤</span>
                    <p className='text-gray-300 truncate flex-1'>
                      {vehicle.clientName}
                    </p>
                  </div>

                  {/* Servicio */}
                  <div className='flex items-center gap-2'>
                    <span className='text-green-400'>🔧</span>
                    <p className='text-gray-400 truncate flex-1'>
                      {vehicle.serviceType || 'Sin servicio definido'}
                    </p>
                  </div>

                  {/* Fechas - LAYOUT RESPONSIVO */}
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 pt-1 sm:pt-2'>
                    <div className='flex items-center gap-1'>
                      <span className='text-yellow-400'>📅</span>
                      <p className='text-gray-500 text-xs'>
                        Ingreso: {vehicle.entryDate.toLocaleDateString('es-AR')}
                      </p>
                    </div>

                    {/* KM - DESTACADO SI EXISTE */}
                    {vehicle.km && vehicle.km > 0 && (
                      <div className='flex items-center gap-1'>
                        <span className='text-purple-400'>🛣️</span>
                        <p className='text-green-400 font-medium text-xs'>
                          {vehicle.km.toLocaleString()}KM
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Trabajos realizados - NUEVO INDICADOR */}
                  {vehicle.steps && vehicle.steps.length > 0 && (
                    <div className='flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-600 mt-2'>
                      <div className='flex items-center gap-1'>
                        <span className='text-green-400'>✅</span>
                        <span className='text-green-300 text-xs font-medium'>
                          {vehicle.steps.length} trabajo
                          {vehicle.steps.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Próximo paso indicator */}
                      {vehicle.nextStep && (
                        <div className='flex items-center gap-1'>
                          <span className='text-blue-400'>🔜</span>
                          <span className='text-blue-300 text-xs'>
                            Próximo paso
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fecha estimada de entrega - SI EXISTE */}
                  {vehicle.estimatedCompletionDate && (
                    <div className='flex items-center gap-1 pt-1'>
                      <span className='text-purple-400'>⏰</span>
                      <p className='text-purple-300 text-xs font-medium'>
                        Entrega:{' '}
                        {vehicle.estimatedCompletionDate.toLocaleDateString(
                          'es-AR'
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Visual indicator cuando está seleccionado */}
                {selectedVehicle === vehicle.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='flex items-center justify-center mt-2 sm:mt-3 py-1 bg-blue-600/20 rounded text-blue-300 text-xs font-medium'
                  >
                    👆 Toca para cerrar detalles
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
