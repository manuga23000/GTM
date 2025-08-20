import { motion } from 'framer-motion'

interface VehicleStep {
  id: string
  title: string
  description: string
  status: 'completed' // Siempre completado
  date: Date
  notes?: string
}

interface VehicleInTracking {
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
  totalCost?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
}

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
  const totalSteps = vehicle.steps.length

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
        <div className='flex justify-between items-center mb-4'>
          <h4 className='text-lg font-semibold text-white'>
            Trabajos Realizados
          </h4>
          {totalSteps > 0 && (
            <div className='text-sm text-gray-400'>
              {totalSteps} trabajo{totalSteps !== 1 ? 's' : ''} registrado
              {totalSteps !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Lista de trabajos realizados */}
          <div className='bg-gray-700/50 p-4 rounded-lg'>
            <h5 className='text-white font-medium mb-3 flex items-center'>
              🔧 Lista de Trabajos
            </h5>

            {vehicle.steps.length === 0 ? (
              <div className='text-center py-8 bg-gray-800 rounded border-2 border-dashed border-gray-600'>
                <p className='text-gray-400 mb-2'>📋</p>
                <p className='text-gray-400 text-sm'>
                  No hay trabajos registrados
                </p>
                <p className='text-gray-500 text-xs mt-1'>
                  Usa "Seguimiento" para agregar trabajos
                </p>
              </div>
            ) : (
              <div className='space-y-3 max-h-80 overflow-y-auto'>
                {vehicle.steps
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='bg-gray-800 p-3 rounded border border-gray-600'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-lg'>✅</span>
                          <div className='flex-1'>
                            <h6 className='text-white font-medium text-sm'>
                              {step.title}
                            </h6>
                          </div>
                        </div>
                        <span className='text-gray-400 text-xs'>
                          {step.date.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <p className='text-gray-300 text-sm mt-2'>
                        {step.description}
                      </p>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className='space-y-4'>
            {/* Fecha estimada */}
            <div className='bg-purple-900/30 p-4 rounded-lg border border-purple-500/30'>
              <h5 className='text-purple-300 font-medium mb-2'>
                🕒 Fecha Estimada de Finalización
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

            {/* Próximo paso */}
            <div className='bg-blue-100/80 p-4 rounded-lg border border-blue-300/70 mb-2'>
              <h5 className='text-blue-700 font-semibold mb-2 flex items-center gap-2'>
                <span>🔜</span> Próximo paso
              </h5>
              <div className='text-blue-900 font-medium text-base min-h-[1.5em]'>
                {vehicle.nextStep && vehicle.nextStep.trim()
                  ? vehicle.nextStep
                  : <span className='text-blue-400 italic'>No definido</span>}
              </div>
            </div>

            {/* Resumen */}
            <div className='bg-green-900/30 p-4 rounded border border-green-500/30 text-center'>
              <div className='text-green-300 font-bold text-2xl'>
                {totalSteps}
              </div>
              <div className='text-green-200 text-sm'>
                Trabajo{totalSteps !== 1 ? 's' : ''} Realizado
                {totalSteps !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Mantener notas legacy si existen */}
        {vehicle.notes && vehicle.notes.trim() && (
          <div className='mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30'>
            <h5 className='text-blue-300 font-medium mb-2'>
              📄 Notas Adicionales
            </h5>
            <div className='text-blue-100 text-sm whitespace-pre-wrap'>
              {vehicle.notes}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
