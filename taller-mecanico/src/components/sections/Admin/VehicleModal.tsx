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

type VehicleSetter<T> = (value: T | ((prev: T) => T)) => void

interface VehicleModalProps {
  // Props para agregar nuevo vehículo
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: NewVehicleData
  setNewVehicle: VehicleSetter<NewVehicleData>
  handleAddVehicle: () => void
  addVehicleError: string
  isAddingVehicle: boolean

  // Props para editar vehículo
  showEditVehicleModal: boolean
  setShowEditVehicleModal: (show: boolean) => void
  editVehicle: VehicleInTracking | null
  setEditVehicle: VehicleSetter<VehicleInTracking | null>
  handleSaveVehicleEdit: () => void
  isEditingVehicle: boolean

  // Props para editar seguimiento
  showTrackingModal: boolean
  setShowTrackingModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: VehicleSetter<VehicleInTracking | null>
  handleSaveTrackingEdit: () => void
  isEditingTracking: boolean
}

// Componente para formulario de seguimiento SIMPLE
const TrackingForm = ({
  tracking,
  setTracking,
}: {
  tracking: VehicleInTracking
  setTracking: VehicleSetter<VehicleInTracking>
}) => {
  const [nextStepInput, setNextStepInput] = useState('')
  const [newStep, setNewStep] = useState({
    title: '',
  })
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepTitle, setEditingStepTitle] = useState<string>('')
  const [editingNextStep, setEditingNextStep] = useState<boolean>(false)
  const [editingNextStepValue, setEditingNextStepValue] = useState<string>('')

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T12:00:00')
  }

  const handleAddStep = () => {
    if (!newStep.title.trim()) return
    const step: VehicleStep = {
      id: Date.now().toString(),
      title: newStep.title.trim(),
      description: '', // No hay descripción
      status: 'completed',
      date: new Date(), // Fecha actual
      notes: '',
    }
    setTracking(prev => ({
      ...prev,
      steps: [...prev.steps, step],
    }))
    setNewStep({ title: '' })
  }

  const handleDeleteStep = (stepId: string) => {
    if (confirm('¿Seguro que deseas eliminar este trabajo?')) {
      setTracking(prev => ({
        ...prev,
        steps: prev.steps.filter(step => step.id !== stepId),
      }))
    }
  }

  const handleEditStep = (stepId: string) => {
    const step = tracking.steps.find(s => s.id === stepId)
    if (step) {
      setEditingStepId(stepId)
      setEditingStepTitle(step.title)
    }
  }

  const handleSaveEditStep = () => {
    if (!editingStepId) return
    setTracking(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === editingStepId
          ? { ...step, title: editingStepTitle.trim() }
          : step
      ),
    }))
    setEditingStepId(null)
    setEditingStepTitle('')
  }

  const handleCancelEditStep = () => {
    setEditingStepId(null)
    setEditingStepTitle('')
  }

  return (
    <div className='space-y-6'>
      {/* Agregar trabajo realizado */}
      <div className='flex flex-col items-center justify-center py-2 w-full max-w-md mx-auto'>
        <label className='text-green-300 font-medium mb-1 text-sm self-start'>
          Agregar trabajo realizado
        </label>
        <div className='flex flex-row items-center gap-2 w-full'>
          <input
            type='text'
            placeholder='Agregar trabajo realizado...'
            value={newStep.title}
            onChange={e => setNewStep({ title: e.target.value })}
            className='flex-1 px-4 py-2 bg-gray-700 border border-green-400 rounded text-white text-base shadow'
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddStep()
            }}
            maxLength={60}
            autoFocus
          />
          <button
            onClick={handleAddStep}
            disabled={!newStep.title.trim()}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-base disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ minWidth: '48px' }}
          >
            ➕
          </button>
        </div>
      </div>

      {/* Lista de trabajos realizados */}
      <div className='space-y-2 max-h-48 overflow-y-auto mb-4'>
        {tracking.steps.map(step => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-gray-700/50 p-2 rounded border border-gray-600 flex items-center justify-between text-xs'
          >
            <div className='flex items-center gap-2 w-full'>
              <span className='text-base'>✅</span>
              {editingStepId === step.id ? (
                <>
                  <input
                    type='text'
                    value={editingStepTitle}
                    onChange={e => setEditingStepTitle(e.target.value)}
                    className='flex-1 px-2 py-1 bg-gray-800 border border-green-400 rounded text-white text-xs shadow mr-2'
                    maxLength={60}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveEditStep()
                      if (e.key === 'Escape') handleCancelEditStep()
                    }}
                  />
                  <button
                    onClick={handleSaveEditStep}
                    className='text-green-400 hover:text-green-300 text-xs p-1'
                    title='Guardar'
                    disabled={!editingStepTitle.trim()}
                  >
                    💾
                  </button>
                  <button
                    onClick={handleCancelEditStep}
                    className='text-gray-400 hover:text-gray-300 text-xs p-1 ml-1'
                    title='Cancelar'
                  >
                    ❌
                  </button>
                </>
              ) : (
                <>
                  <span className='text-white flex-1'>{step.title}</span>
                  <button
                    onClick={() => handleEditStep(step.id)}
                    className='text-yellow-400 hover:text-yellow-300 text-xs p-1 ml-1'
                    title='Editar'
                  >
                    ✏️
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteStep(step.id)}
                className='text-red-400 hover:text-red-300 text-xs p-1 ml-2'
                title='Eliminar'
              >
                🗑️
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Próximo paso (bloque separado) */}
      <div className='bg-blue-900/30 p-4 rounded border border-blue-500/30 mt-6 max-w-md mx-auto flex flex-col items-start'>
        <div className='flex flex-row items-center w-full mb-2'>
          <span className='text-blue-300 font-medium text-sm'>
            Próximo paso
          </span>
        </div>
        <div className='flex flex-row items-center gap-2 w-full'>
          {editingNextStep ? (
            <>
              <input
                type='text'
                value={editingNextStepValue}
                onChange={e => setEditingNextStepValue(e.target.value)}
                className='flex-1 px-4 py-2 bg-gray-700 border border-blue-400 rounded text-white text-base shadow'
                maxLength={60}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (editingNextStepValue.trim()) {
                      setTracking(prev => ({
                        ...prev,
                        nextStep: editingNextStepValue.trim(),
                      }))
                      setEditingNextStep(false)
                    }
                  }
                  if (e.key === 'Escape') {
                    setEditingNextStep(false)
                    setEditingNextStepValue(tracking.nextStep || '')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (editingNextStepValue.trim()) {
                    setTracking(prev => ({
                      ...prev,
                      nextStep: editingNextStepValue.trim(),
                    }))
                    setEditingNextStep(false)
                  }
                }}
                disabled={!editingNextStepValue.trim()}
                className='text-green-400 hover:text-green-300 text-base p-2 rounded'
                title='Guardar'
              >
                💾
              </button>
              <button
                onClick={() => {
                  setEditingNextStep(false)
                  setEditingNextStepValue(tracking.nextStep || '')
                }}
                className='text-gray-400 hover:text-gray-300 text-base p-2 rounded'
                title='Cancelar'
              >
                ❌
              </button>
            </>
          ) : tracking.nextStep ? (
            <>
              <span className='text-white flex-1'>{tracking.nextStep}</span>
              <button
                onClick={() => {
                  setEditingNextStep(true)
                  setEditingNextStepValue(tracking.nextStep || '')
                }}
                className='text-yellow-400 hover:text-yellow-300 text-base p-2 rounded ml-1'
                title='Editar'
              >
                ✏️
              </button>
              <button
                onClick={() => setTracking(prev => ({ ...prev, nextStep: '' }))}
                className='text-red-400 hover:text-red-300 text-base p-2 rounded ml-1'
                title='Borrar próximo paso'
              >
                🗑️
              </button>
            </>
          ) : (
            <>
              <input
                type='text'
                placeholder='Agregar próximo paso...'
                value={nextStepInput}
                onChange={e => setNextStepInput(e.target.value)}
                className='flex-1 px-4 py-2 bg-gray-700 border border-blue-400 rounded text-white text-base shadow'
                maxLength={60}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nextStepInput.trim()) {
                    setTracking(prev => ({
                      ...prev,
                      nextStep: nextStepInput.trim(),
                    }))
                    setNextStepInput('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (nextStepInput.trim()) {
                    setTracking(prev => ({
                      ...prev,
                      nextStep: nextStepInput.trim(),
                    }))
                    setNextStepInput('')
                  }
                }}
                disabled={!nextStepInput.trim()}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-base disabled:opacity-50 disabled:cursor-not-allowed'
                style={{ minWidth: '48px' }}
              >
                ➕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fecha estimada */}
      <div className='bg-purple-900/30 p-2 rounded border border-purple-500/30'>
        <h5 className='text-purple-300 font-medium mb-1 text-xs'>
          🕒 Fecha estimada de finalización
        </h5>
        <input
          type='date'
          value={
            tracking.estimatedCompletionDate
              ? formatDate(tracking.estimatedCompletionDate)
              : ''
          }
          onChange={e =>
            setTracking(prev => ({
              ...prev,
              estimatedCompletionDate: e.target.value
                ? parseDate(e.target.value)
                : null,
            }))
          }
          className='w-full p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs'
        />
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
  addVehicleError,
  isAddingVehicle,
  showEditVehicleModal,
  setShowEditVehicleModal,
  editVehicle,
  setEditVehicle,
  handleSaveVehicleEdit,
  isEditingVehicle,
  showTrackingModal,
  setShowTrackingModal,
  editTracking,
  setEditTracking,
  handleSaveTrackingEdit,
  isEditingTracking,
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
                  setVehicle={setNewVehicle as any}
                  isEdit={false}
                />

                {/* Mostrar mensaje de error */}
                {addVehicleError && (
                  <div className='mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <span className='text-red-400 text-lg'>⚠️</span>
                      <p className='text-red-300 text-sm font-medium'>
                        {addVehicleError}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex gap-3 pt-4 mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={!isValidVehicle(newVehicle) || isAddingVehicle}
                    className={`flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium ${
                      !isValidVehicle(newVehicle) || isAddingVehicle
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isAddingVehicle ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Creando...
                      </div>
                    ) : (
                      '✅ Crear Vehículo'
                    )}
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
                  setVehicle={setEditVehicle as any}
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
                    disabled={isEditingVehicle}
                    className={`flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium ${
                      isEditingVehicle ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingVehicle ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Guardando...
                      </div>
                    ) : (
                      '💾 Guardar Cambios'
                    )}
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
                  setTracking={setEditTracking as any}
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
                    disabled={isEditingTracking}
                    className={`flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium ${
                      isEditingTracking ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingTracking ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Guardando...
                      </div>
                    ) : (
                      '💾 Guardar'
                    )}
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
