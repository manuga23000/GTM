import { motion } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'

interface VehicleDetailsProps {
  vehicle: VehicleInTracking
  onClose: () => void
  onEditVehicle: () => void
  onEditTracking: () => void
  onDeleteVehicle: () => void
}

export default function VehicleDetails({
  vehicle,
  onClose,
  onEditVehicle,
  onEditTracking,
  onDeleteVehicle,
}: VehicleDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-gray-800 rounded-xl p-6'
    >
      {/* Header con información básica */}
      <div className='flex justify-between items-start mb-6'>
        <div className='flex-1'>
          <h3 className='text-2xl font-bold text-white mb-3'>
            {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
          </h3>

          {/* Información básica del vehículo */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4'>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Cliente:</span>
              <span className='text-white font-medium'>
                {vehicle.clientName}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Teléfono:</span>
              <span className='text-white font-medium'>
                {vehicle.clientPhone || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Servicio:</span>
              <span className='text-white font-medium'>
                {vehicle.serviceType || 'No especificado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Año:</span>
              <span className='text-white font-medium'>{vehicle.year}</span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Chasis:</span>
              <span className='text-white font-medium'>
                {vehicle.chassisNumber || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Costo Total:</span>
              <span className='text-white font-medium'>
                ${vehicle.totalCost?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Fechas importantes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4'>
            <div className='bg-blue-900/30 p-3 rounded-lg border border-blue-500/30'>
              <span className='text-blue-300 block'>Fecha de Ingreso:</span>
              <span className='text-white font-medium'>
                {vehicle.entryDate.toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className='bg-purple-900/30 p-3 rounded-lg border border-purple-500/30'>
              <span className='text-purple-300 block'>Entrega Estimada:</span>
              <span className='text-white font-medium'>
                {vehicle.estimatedCompletionDate
                  ? vehicle.estimatedCompletionDate.toLocaleDateString('es-AR')
                  : 'No definida'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className='flex flex-col gap-2 ml-4'>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white text-xl p-1 self-end'
            title='Cerrar'
          >
            ✕
          </button>
          <button
            onClick={onEditVehicle}
            className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap'
          >
            ✎ Datos del Vehículo
          </button>
          <button
            onClick={onEditTracking}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap'
          >
            📋 Seguimiento
          </button>
          <button
            onClick={onDeleteVehicle}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Sección de seguimiento (solo lectura) */}
      <div className='border-t border-gray-700 pt-6'>
        <h4 className='text-lg font-semibold text-white mb-4'>
          Estado del Seguimiento
        </h4>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Trabajos realizados / Notas */}
          <div className='bg-gray-700/50 p-4 rounded-lg'>
            <h5 className='text-white font-medium mb-2 flex items-center'>
              📝 Trabajos Realizados
            </h5>
            <div className='text-gray-300 text-sm bg-gray-800 p-3 rounded border min-h-[100px] whitespace-pre-wrap'>
              {vehicle.notes || 'Sin trabajos registrados'}
            </div>
          </div>

          {/* Próximo paso y fecha */}
          <div className='space-y-4'>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h5 className='text-white font-medium mb-2 flex items-center'>
                ➡️ Próximo Paso
              </h5>
              <div className='text-gray-300 text-sm bg-gray-800 p-3 rounded border'>
                {vehicle.nextStep || 'Sin próximo paso definido'}
              </div>
            </div>

            <div className='bg-purple-900/30 p-4 rounded-lg border border-purple-500/30'>
              <h5 className='text-purple-300 font-medium mb-2'>
                🕒 Fecha Estimada
              </h5>
              <div className='text-white font-medium'>
                {vehicle.estimatedCompletionDate
                  ? vehicle.estimatedCompletionDate.toLocaleDateString(
                      'es-AR',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'No definida'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
