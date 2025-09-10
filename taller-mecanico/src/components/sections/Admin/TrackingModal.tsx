import { motion, AnimatePresence } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'

interface TrackingModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: (tracking: VehicleInTracking | null) => void
  onSave: () => void
  isLoading: boolean
}

export default function TrackingModal({
  showModal,
  setShowModal,
  editTracking,
  setEditTracking,
  onSave,
  isLoading,
}: TrackingModalProps) {
  if (!editTracking) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4'
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-gray-800 rounded-xl p-3 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] overflow-y-auto'
          >
            <div className='flex justify-between items-center mb-4 sm:mb-6'>
              <div>
                <h2 className='text-lg sm:text-2xl font-bold text-white'>
                  Editar Seguimiento
                </h2>
                <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                  {editTracking.plateNumber} - {editTracking.brand}{' '}
                  {editTracking.model}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-white text-lg sm:text-xl'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
              <div className='bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-500/30'>
                <label className='block text-blue-300 font-medium mb-2 text-xs sm:text-sm'>
                  🔜 Próximo Paso
                </label>
                <textarea
                  value={editTracking.nextStep || ''}
                  onChange={e =>
                    setEditTracking({
                      ...editTracking,
                      nextStep: e.target.value,
                    })
                  }
                  rows={2}
                  className='w-full px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none text-xs sm:text-sm'
                  placeholder='Describe el próximo paso del servicio...'
                />
              </div>

              <div className='bg-purple-900/30 p-3 sm:p-4 rounded-lg border border-purple-500/30'>
                <label className='block text-purple-300 font-medium mb-2 text-xs sm:text-sm'>
                  📅 Fecha Estimada de Finalización
                </label>
                <input
                  type='date'
                  value={
                    editTracking.estimatedCompletionDate
                      ? editTracking.estimatedCompletionDate
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={e =>
                    setEditTracking({
                      ...editTracking,
                      estimatedCompletionDate: e.target.value
                        ? new Date(e.target.value)
                        : null,
                    })
                  }
                  className='w-full px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm'
                />
              </div>

              <div className='bg-gray-700/30 p-3 sm:p-4 rounded-lg border border-gray-600'>
                <label className='block text-gray-300 font-medium mb-2 text-xs sm:text-sm'>
                  📝 Notas Adicionales
                </label>
                <textarea
                  value={editTracking.notes}
                  onChange={e =>
                    setEditTracking({
                      ...editTracking,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className='w-full px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500 resize-none text-xs sm:text-sm'
                  placeholder='Notas sobre el estado del vehículo, observaciones, etc.'
                />
              </div>

              <div className='bg-yellow-900/20 p-3 sm:p-4 rounded-lg border border-yellow-500/30'>
                <h3 className='text-yellow-300 font-medium mb-2 sm:mb-3 text-xs sm:text-sm'>
                  🚗 Información del Vehículo
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm'>
                  <div>
                    <span className='text-gray-400 block'>Cliente:</span>
                    <p className='text-white font-medium'>
                      {editTracking.clientName}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-400 block'>Servicio:</span>
                    <p className='text-white font-medium'>
                      {editTracking.serviceType || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-400 block'>Ingreso:</span>
                    <p className='text-white font-medium'>
                      {editTracking.entryDate.toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-400 block'>Kilometraje:</span>
                    <p className='text-white font-medium'>
                      {editTracking.km?.toLocaleString() || '0'} km
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-500/30'>
                <h3 className='text-green-300 font-medium mb-2 sm:mb-3 text-xs sm:text-sm'>
                  ✅ Trabajos Realizados
                </h3>
                {editTracking.steps && editTracking.steps.length > 0 ? (
                  <div className='space-y-2 max-h-24 sm:max-h-32 overflow-y-auto'>
                    {editTracking.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className='flex items-center gap-2 text-xs sm:text-sm bg-green-800/20 p-2 rounded'
                      >
                        <span className='text-green-400'>✓</span>
                        <span className='text-white flex-1 truncate'>
                          {step.title}
                        </span>
                        <span className='text-green-300 text-xs'>
                          {step.date.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-400 text-xs sm:text-sm italic'>
                    No hay trabajos registrados aún
                  </p>
                )}
              </div>

              <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-700'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm sm:text-base'
                >
                  {isLoading ? (
                    <span className='flex items-center justify-center gap-2'>
                      <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Guardando...
                    </span>
                  ) : (
                    '💾 Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
