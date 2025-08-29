import { motion } from 'framer-motion'

// ACTUALIZADO: Interface para archivos del step (con Storage y thumbnails)
export interface StepFile {
  id: string
  fileName: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string // NUEVO: thumbnail para optimización
  storageRef: string
  uploadedAt: Date
  size: number
  dimensions?: {
    // NUEVO: dimensiones para imágenes
    width: number
    height: number
  }
}

// MODIFICADO: Agregamos archivos al step
export interface VehicleStep {
  id: string
  title: string
  // ✅ QUITADO: description ya no está en la interface
  status: 'completed' // Siempre completado
  date: Date
  notes?: string
  files?: StepFile[] // ACTUALIZADO: archivos del step
}

export interface VehicleInTracking {
  id: string
  plateNumber: string // obligatorio
  clientName: string // obligatorio
  brand?: string
  model?: string
  year?: number
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  entryDate: Date
  estimatedCompletionDate?: Date | null // Cambiar undefined por null
  status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered'
  km?: number // Campo de KM agregado
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
    <div className='bg-gray-800 rounded-xl p-6'>
      <h3 className='text-xl font-semibold mb-6'>Vehículos Activos</h3>
      {vehicles.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-400'>No hay vehículos para mostrar</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {vehicles.map(vehicle => {
            return (
              <motion.div
                key={vehicle.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() =>
                  setSelectedVehicle(
                    selectedVehicle === vehicle.id ? '' : vehicle.id
                  )
                }
              >
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h4 className='font-bold text-lg text-white'>
                      {vehicle.plateNumber}
                    </h4>
                    <p className='text-gray-300 text-sm'>
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                        vehicle.status
                      )}`}
                    >
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>
                <div className='space-y-1 text-sm'>
                  <p className='text-gray-300'>{vehicle.clientName}</p>
                  <p className='text-gray-400'>
                    {vehicle.serviceType || 'Sin servicio definido'}
                  </p>
                  <div className='flex justify-between items-center'>
                    <p className='text-gray-500'>
                      Ingreso: {vehicle.entryDate.toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  {vehicle.km && vehicle.km > 0 && (
                    <p className='text-green-400 font-medium'>
                      ${vehicle.km.toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
