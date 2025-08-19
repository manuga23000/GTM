// src/components/sections/Admin/VehicleModal.tsx
// REEMPLAZA TODO EL CONTENIDO DEL ARCHIVO ACTUAL
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import VehicleForm from './VehicleForm'

// Portal Hook Inline
function usePortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return mounted
}

// Portal Component Inline
function Portal({ children }: { children: React.ReactNode }) {
  const mounted = usePortal()

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(children, document.body)
}

// Tipos existentes (copiados del original)
interface NewVehicleData {
  plateNumber: string
  brand: string
  model: string
  year: number
  clientName: string
  clientPhone: string
  serviceType: string
  chassisNumber: string
  totalCost: number
  notes: string
  createdAt: Date
  estimatedCompletionDate: Date | null
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
  steps: unknown[]
  notes: string
  nextStep?: string
}

type VehicleSetter<T> = (value: T | ((prev: T) => T)) => void

interface VehicleModalProps {
  // Props para agregar nuevo vehículo
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: NewVehicleData
  setNewVehicle: VehicleSetter<NewVehicleData>
  handleAddVehicle: () => void

  // Props para editar vehículo
  showEditVehicleModal: boolean
  setShowEditVehicleModal: (show: boolean) => void
  editVehicle: VehicleInTracking | null
  setEditVehicle: VehicleSetter<VehicleInTracking | null>
  handleSaveVehicleEdit: () => void

  // Props para editar seguimiento
  showTrackingModal: boolean
  setShowTrackingModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: VehicleSetter<VehicleInTracking | null>
  handleSaveTrackingEdit: () => void
}

// Componente para formulario de seguimiento (copiado del original)
const TrackingForm = ({
  tracking,
  setTracking,
}: {
  tracking: VehicleInTracking
  setTracking: VehicleSetter<VehicleInTracking>
}) => {
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return ''
    if (typeof date === 'string') return date.slice(0, 10)
    if (date instanceof Date) return date.toISOString().slice(0, 10)
    return ''
  }

  const handleTrackingUpdate = (updates: Partial<VehicleInTracking>) => {
    setTracking((prev: VehicleInTracking) => ({
      ...prev,
      ...updates,
    }))
  }

  return (
    <div className='space-y-6'>
      {/* Trabajos realizados / Notas */}
      <div>
        <label className='block text-gray-300 text-sm mb-2 font-medium'>
          📝 Trabajos realizados / Notas
        </label>
        <textarea
          value={tracking.notes || ''}
          onChange={e => handleTrackingUpdate({ notes: e.target.value })}
          placeholder='Detalle de trabajos realizados, diagnósticos, reparaciones realizadas...'
          className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:border-blue-500 focus:outline-none'
          rows={4}
        />
        <p className='text-xs text-gray-400 mt-1'>
          Describe qué trabajos se han realizado hasta ahora
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Próximo paso */}
        <div>
          <label className='block text-gray-300 text-sm mb-2 font-medium'>
            ➡️ Próximo paso
          </label>
          <input
            type='text'
            value={tracking.nextStep || ''}
            onChange={e => handleTrackingUpdate({ nextStep: e.target.value })}
            placeholder='Ej: Esperar repuesto, Llamar cliente...'
            className='w-full h-10 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none'
          />
        </div>

        {/* Fecha estimada de finalización */}
        <div>
          <label className='block text-gray-300 text-sm mb-2 font-medium'>
            📅 Fecha estimada
          </label>
          <input
            type='date'
            value={formatDate(tracking.estimatedCompletionDate)}
            onChange={e =>
              handleTrackingUpdate({
                estimatedCompletionDate: e.target.value
                  ? new Date(e.target.value)
                  : null,
              })
            }
            className='w-full h-10 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none'
          />
        </div>
      </div>
    </div>
  )
}

export default function VehicleModal({
  showAddForm,
  setShowAddForm,
  newVehicle,
  setNewVehicle,
  handleAddVehicle,
  showEditVehicleModal,
  setShowEditVehicleModal,
  editVehicle,
  setEditVehicle,
  handleSaveVehicleEdit,
  showTrackingModal,
  setShowTrackingModal,
  editTracking,
  setEditTracking,
  handleSaveTrackingEdit,
}: VehicleModalProps) {
  // Bloquear scroll cuando cualquier modal esté abierto
  useEffect(() => {
    const anyModalOpen =
      showAddForm || showEditVehicleModal || showTrackingModal

    if (anyModalOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [showAddForm, showEditVehicleModal, showTrackingModal])

  const isValidVehicle = (vehicle: NewVehicleData): boolean => {
    return (
      !!vehicle.plateNumber &&
      /^([A-Z]{3} \d{3}|[A-Z]{2} \d{3} [A-Z]{2})$/.test(vehicle.plateNumber) &&
      !!vehicle.clientName.trim()
    )
  }

  return (
    <>
      {/* Modal agregar nuevo vehículo */}
      <Portal>
        <AnimatePresence>
          {showAddForm && (
            <div
              className='fixed z-[99999]'
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setShowAddForm(false)}
            >
              <div
                className='absolute bg-black bg-opacity-80 backdrop-blur-sm'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-6 w-full shadow-2xl'
                style={{
                  maxWidth: '32rem',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  position: 'relative',
                  zIndex: 1,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-xl font-bold text-white'>
                      Crear Nuevo Vehículo
                    </h3>
                    <p className='text-gray-400 text-sm mt-1'>
                      Ingresa los datos del nuevo vehículo al sistema
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <VehicleForm
                  vehicle={newVehicle}
                  setVehicle={setNewVehicle}
                  isEdit={false}
                />

                <div className='flex gap-3 pt-4 mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={!isValidVehicle(newVehicle)}
                    className={`flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium ${
                      !isValidVehicle(newVehicle)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    ✅ Crear Vehículo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Modal editar vehículo (datos básicos) */}
      <Portal>
        <AnimatePresence>
          {showEditVehicleModal && editVehicle && (
            <div
              className='fixed z-[99999]'
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setShowEditVehicleModal(false)}
            >
              <div
                className='absolute bg-black bg-opacity-80 backdrop-blur-sm'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-6 w-full shadow-2xl'
                style={{
                  maxWidth: '32rem',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  position: 'relative',
                  zIndex: 1,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-xl font-bold text-white'>
                      Editar Datos del Vehículo
                    </h3>
                    <p className='text-gray-400 text-sm mt-1'>
                      Modificar información básica del vehículo
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <VehicleForm
                  vehicle={editVehicle}
                  setVehicle={
                    setEditVehicle as VehicleSetter<VehicleInTracking>
                  }
                  isEdit={true}
                />

                <div className='flex gap-3 pt-4 mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveVehicleEdit}
                    className='flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium'
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Modal editar seguimiento */}
      <Portal>
        <AnimatePresence>
          {showTrackingModal && editTracking && (
            <div
              className='fixed z-[99999]'
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setShowTrackingModal(false)}
            >
              <div
                className='absolute bg-black bg-opacity-80 backdrop-blur-sm'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-6 w-full shadow-2xl'
                style={{
                  maxWidth: '32rem',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  position: 'relative',
                  zIndex: 1,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <h3 className='text-xl font-bold text-white'>
                      Actualizar Seguimiento
                    </h3>
                    <p className='text-gray-400 text-sm mt-1'>
                      {editTracking.plateNumber} - {editTracking.brand}{' '}
                      {editTracking.model}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <TrackingForm
                  tracking={editTracking}
                  setTracking={
                    setEditTracking as VehicleSetter<VehicleInTracking>
                  }
                />

                <div className='flex gap-3 pt-6 mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTrackingEdit}
                    className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium'
                  >
                    💾 Guardar Seguimiento
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}
