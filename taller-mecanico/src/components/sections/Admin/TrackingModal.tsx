import { motion, AnimatePresence } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'
import {
  X,
  ArrowRight,
  CalendarDays,
  FileText,
  Car,
  CheckCircle2,
} from 'lucide-react'

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
          className='fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4'
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl'
          >
            {/* Top accent */}
            <div className='h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 -mt-3 sm:-mt-6 mb-4 sm:mb-6 rounded-t-2xl' />

            <div className='flex justify-between items-center mb-4 sm:mb-6'>
              <div>
                <h2 className='text-lg sm:text-xl font-bold text-white'>
                  Editar Seguimiento
                </h2>
                <p className='text-zinc-400 text-xs sm:text-sm mt-0.5'>
                  {editTracking.plateNumber} · {editTracking.brand}{' '}
                  {editTracking.model}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors'
              >
                <X className='w-5 h-5' strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5'>
              {/* Próximo paso */}
              <div className='bg-amber-500/8 p-3 sm:p-4 rounded-xl border border-amber-500/20'>
                <label className='flex items-center gap-2 text-amber-300 font-medium mb-2 text-xs sm:text-sm'>
                  <ArrowRight className='w-3.5 h-3.5' strokeWidth={2} />
                  Próximo Paso
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
                  className='w-full px-2 sm:px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none text-xs sm:text-sm'
                  placeholder='Describe el próximo paso del servicio...'
                />
              </div>

              {/* Fecha estimada */}
              <div className='bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-zinc-700/50'>
                <label className='flex items-center gap-2 text-zinc-300 font-medium mb-2 text-xs sm:text-sm'>
                  <CalendarDays className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
                  Fecha Estimada de Finalización
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
                  className='w-full px-2 sm:px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50 text-xs sm:text-sm'
                />
              </div>

              {/* Notas adicionales */}
              <div className='bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-zinc-700/50'>
                <label className='flex items-center gap-2 text-zinc-300 font-medium mb-2 text-xs sm:text-sm'>
                  <FileText className='w-3.5 h-3.5 text-zinc-400' strokeWidth={2} />
                  Notas Adicionales
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
                  className='w-full px-2 sm:px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600 resize-none text-xs sm:text-sm'
                  placeholder='Notas sobre el estado del vehículo, observaciones, etc.'
                />
              </div>

              {/* Info vehículo */}
              <div className='bg-zinc-800/40 p-3 sm:p-4 rounded-xl border border-zinc-700/50'>
                <h3 className='flex items-center gap-2 text-zinc-300 font-medium mb-2 sm:mb-3 text-xs sm:text-sm'>
                  <Car className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
                  Información del Vehículo
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm'>
                  <div>
                    <span className='text-zinc-500 block'>Cliente:</span>
                    <p className='text-white font-medium'>{editTracking.clientName}</p>
                  </div>
                  <div>
                    <span className='text-zinc-500 block'>Servicio:</span>
                    <p className='text-white font-medium'>{editTracking.serviceType || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className='text-zinc-500 block'>Ingreso:</span>
                    <p className='text-white font-medium'>{editTracking.entryDate.toLocaleDateString('es-AR')}</p>
                  </div>
                  <div>
                    <span className='text-zinc-500 block'>Kilometraje:</span>
                    <p className='text-white font-medium'>{editTracking.km?.toLocaleString() || '0'} km</p>
                  </div>
                </div>
              </div>

              {/* Trabajos realizados */}
              <div className='bg-emerald-900/15 p-3 sm:p-4 rounded-xl border border-emerald-500/20'>
                <h3 className='flex items-center gap-2 text-emerald-300 font-medium mb-2 sm:mb-3 text-xs sm:text-sm'>
                  <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2} />
                  Trabajos Realizados
                </h3>
                {editTracking.steps && editTracking.steps.length > 0 ? (
                  <div className='space-y-2 max-h-24 sm:max-h-32 overflow-y-auto'>
                    {editTracking.steps.map(step => (
                      <div
                        key={step.id}
                        className='flex items-center gap-2 text-xs sm:text-sm bg-emerald-900/20 p-2 rounded-lg'
                      >
                        <CheckCircle2 className='w-3 h-3 text-emerald-400 shrink-0' strokeWidth={2} />
                        <span className='text-white flex-1 truncate'>{step.title}</span>
                        <span className='text-emerald-400 text-xs shrink-0'>
                          {step.date.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-zinc-500 text-xs sm:text-sm italic'>
                    No hay trabajos registrados aún
                  </p>
                )}
              </div>

              {/* Footer buttons */}
              <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-zinc-800'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors font-medium text-sm'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 rounded-xl font-bold transition-colors text-sm'
                >
                  {isLoading ? (
                    <span className='flex items-center justify-center gap-2'>
                      <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                      Guardando...
                    </span>
                  ) : (
                    'Guardar Cambios'
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
