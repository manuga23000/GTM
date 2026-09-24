import { motion } from 'framer-motion'
import {
  User,
  Wrench,
  CalendarDays,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Clock,
  Car,
} from 'lucide-react'
import type { ServiceData, ServiceDataMotor, ServiceDataCaja } from '@/actions/types/types'

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
  fluidLevels?: {
    aceite: number
    agua: number
    frenos: number
  }
  serviceData?: ServiceData
  serviceDataMotor?: ServiceDataMotor
  serviceDataCaja?: ServiceDataCaja
  fotoVehiculo?: string
  observaciones?: VehicleStep[]
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
    <div className='bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3 sm:p-5'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center'>
          <Car className='w-3.5 h-3.5 text-amber-400' strokeWidth={2.2} />
        </div>
        <h3 className='text-sm sm:text-base font-bold text-white'>Vehículos Activos</h3>
        {vehicles.length > 0 && (
          <span className='ml-auto text-xs text-zinc-500'>{vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className='text-center py-10 sm:py-14'>
          <Car className='w-10 h-10 text-zinc-700 mx-auto mb-3' strokeWidth={1.5} />
          <p className='text-zinc-500 text-sm'>No hay vehículos para mostrar</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {vehicles.map(vehicle => {
            const isSelected = selectedVehicle === vehicle.id
            return (
              <motion.div
                key={vehicle.id}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-900/30'
                    : 'bg-zinc-800/50 border-zinc-700/70 hover:border-zinc-600'
                }`}
                onClick={() => setSelectedVehicle(isSelected ? '' : vehicle.id)}
              >
                {/* Top accent */}
                <div className={`h-0.5 ${isSelected ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-zinc-700'}`} />

                <div className='p-3 sm:p-4'>
                  {/* Header row */}
                  <div className='flex justify-between items-start mb-2.5'>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-extrabold text-sm sm:text-base text-white tracking-wide'>
                        {vehicle.plateNumber}
                      </h4>
                      <p className='text-zinc-400 text-xs truncate mt-0.5'>
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-md text-xs text-white font-medium whitespace-nowrap ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className='space-y-1.5 text-xs'>
                    <div className='flex items-center gap-2'>
                      <User className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} strokeWidth={2} />
                      <p className='text-zinc-300 truncate flex-1'>{vehicle.clientName}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Wrench className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} strokeWidth={2} />
                      <p className='text-zinc-400 truncate flex-1'>{vehicle.serviceType || 'Sin servicio definido'}</p>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-1 border-t border-zinc-700/50'>
                      <div className='flex items-center gap-1.5'>
                        <CalendarDays className='w-3 h-3 text-zinc-600' strokeWidth={2} />
                        <p className='text-zinc-500 text-xs'>
                          {vehicle.entryDate.toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      {vehicle.km && vehicle.km > 0 && (
                        <div className='flex items-center gap-1'>
                          <Gauge className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} strokeWidth={2} />
                          <p className={`font-semibold text-xs ${isSelected ? 'text-amber-300' : 'text-zinc-400'}`}>
                            {vehicle.km.toLocaleString()} km
                          </p>
                        </div>
                      )}
                    </div>

                    {vehicle.steps && vehicle.steps.length > 0 && (
                      <div className='flex items-center justify-between pt-1 border-t border-zinc-700/50'>
                        <div className='flex items-center gap-1'>
                          <CheckCircle2 className='w-3 h-3 text-emerald-400' strokeWidth={2} />
                          <span className='text-emerald-400 text-xs font-medium'>
                            {vehicle.steps.length} trabajo{vehicle.steps.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {vehicle.nextStep && (
                          <div className='flex items-center gap-1'>
                            <ArrowRight className='w-3 h-3 text-amber-400' strokeWidth={2} />
                            <span className='text-amber-400 text-xs'>Próximo</span>
                          </div>
                        )}
                      </div>
                    )}

                    {vehicle.estimatedCompletionDate && (
                      <div className='flex items-center gap-1.5 pt-1'>
                        <Clock className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} strokeWidth={2} />
                        <p className={`text-xs font-medium ${isSelected ? 'text-amber-300' : 'text-zinc-400'}`}>
                          Entrega: {vehicle.estimatedCompletionDate.toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='flex items-center justify-center mt-2.5 py-1 bg-amber-500/15 rounded-lg text-amber-400 text-xs font-medium gap-1'
                    >
                      <ArrowRight className='w-3 h-3' strokeWidth={2} />
                      Ver detalles abajo · toca para cerrar
                    </motion.div>
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
