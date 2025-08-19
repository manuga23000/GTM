import { AnimatePresence, motion } from 'framer-motion'
import { VehicleInTracking } from './VehicleList'
import React from 'react'

interface VehicleModalProps {
  // Agregar nuevo vehículo
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: any
  setNewVehicle: (v: any) => void
  handleAddVehicle: () => void

  // Editar vehículo (datos básicos)
  showEditVehicleModal: boolean
  setShowEditVehicleModal: (show: boolean) => void
  editVehicle: VehicleInTracking | null
  setEditVehicle: (
    v:
      | VehicleInTracking
      | null
      | ((v: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveVehicleEdit: () => void

  // Editar seguimiento
  showTrackingModal: boolean
  setShowTrackingModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: (
    v:
      | VehicleInTracking
      | null
      | ((v: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveTrackingEdit: () => void
}

// Componente reutilizable para formulario de vehículo
const VehicleForm = ({
  vehicle,
  setVehicle,
  isEdit = false,
}: {
  vehicle: any
  setVehicle: (v: any) => void
  isEdit?: boolean
}) => {
  const formatPlateNumber = (value: string) => {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (formatted.length <= 7) {
      if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(formatted)) {
        formatted =
          formatted.slice(0, 2) +
          ' ' +
          formatted.slice(2, 5) +
          ' ' +
          formatted.slice(5, 7)
      } else if (/^[A-Z]{3}\d{3}$/.test(formatted)) {
        formatted = formatted.slice(0, 3) + ' ' + formatted.slice(3, 6)
      }
    }
    return formatted
  }

  const formatDate = (date: any) => {
    if (!date) return ''
    if (typeof date === 'string') return date.slice(0, 10)
    if (date instanceof Date) return date.toISOString().slice(0, 10)
    return ''
  }

  return (
    <div className='space-y-4'>
      {/* Fechas */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-gray-300 text-sm mb-1'>
            Fecha de ingreso *
          </label>
          <input
            type='date'
            value={formatDate(vehicle.entryDate || vehicle.createdAt)}
            onChange={e =>
              setVehicle((prev: any) => ({
                ...prev,
                [isEdit ? 'entryDate' : 'createdAt']: e.target.value,
              }))
            }
            className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
          />
        </div>
        <div>
          <label className='block text-gray-300 text-sm mb-1'>
            Fecha estimada de finalización
          </label>
          <input
            type='date'
            value={formatDate(vehicle.estimatedCompletionDate)}
            onChange={e =>
              setVehicle((prev: any) => ({
                ...prev,
                estimatedCompletionDate: e.target.value
                  ? new Date(e.target.value)
                  : null,
              }))
            }
            className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
          />
        </div>
      </div>

      {/* Cliente y teléfono */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='Cliente *'
          value={vehicle.clientName || ''}
          onChange={e =>
            setVehicle((prev: any) => ({ ...prev, clientName: e.target.value }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Teléfono'
          value={vehicle.clientPhone || ''}
          onChange={e =>
            setVehicle((prev: any) => ({
              ...prev,
              clientPhone: e.target.value,
            }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Marca y modelo */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='Marca'
          value={vehicle.brand || ''}
          onChange={e =>
            setVehicle((prev: any) => ({ ...prev, brand: e.target.value }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Modelo'
          value={vehicle.model || ''}
          onChange={e =>
            setVehicle((prev: any) => ({ ...prev, model: e.target.value }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Año y patente */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='number'
          placeholder='Año'
          value={vehicle.year || ''}
          onChange={e =>
            setVehicle((prev: any) => ({
              ...prev,
              year: parseInt(e.target.value) || new Date().getFullYear(),
            }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Patente *'
          value={vehicle.plateNumber || ''}
          onChange={e =>
            setVehicle((prev: any) => ({
              ...prev,
              plateNumber: formatPlateNumber(e.target.value),
            }))
          }
          maxLength={9}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Chasis y costo */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='N° de chasis'
          value={vehicle.chassisNumber || ''}
          onChange={e =>
            setVehicle((prev: any) => ({
              ...prev,
              chassisNumber: e.target.value,
            }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='number'
          placeholder='Costo total'
          value={vehicle.totalCost || ''}
          onChange={e =>
            setVehicle((prev: any) => ({
              ...prev,
              totalCost: parseFloat(e.target.value) || 0,
            }))
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Tipo de servicio */}
      <input
        type='text'
        placeholder='Tipo de servicio'
        value={vehicle.serviceType || ''}
        onChange={e =>
          setVehicle((prev: any) => ({ ...prev, serviceType: e.target.value }))
        }
        className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
      />
    </div>
  )
}

// Componente para formulario de seguimiento (simplificado)
const TrackingForm = ({
  tracking,
  setTracking,
}: {
  tracking: any
  setTracking: (v: any) => void
}) => {
  const formatDate = (date: any) => {
    if (!date) return ''
    if (typeof date === 'string') return date.slice(0, 10)
    if (date instanceof Date) return date.toISOString().slice(0, 10)
    return ''
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
          onChange={e =>
            setTracking((prev: any) => ({ ...prev, notes: e.target.value }))
          }
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
            onChange={e =>
              setTracking((prev: any) => ({
                ...prev,
                nextStep: e.target.value,
              }))
            }
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
              setTracking((prev: any) => ({
                ...prev,
                estimatedCompletionDate: e.target.value
                  ? new Date(e.target.value)
                  : null,
              }))
            }
            className='w-full h-10 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none'
          />
        </div>
      </div>
    </div>
  )
}

import { useEffect } from 'react'

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
  // Bloquear scroll del body cuando cualquier modal esté abierto
  useEffect(() => {
    const anyModalOpen =
      showAddForm || showEditVehicleModal || showTrackingModal

    if (anyModalOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY

      // Aplicar estilos para bloquear scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        // Restaurar estilos y posición
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [showAddForm, showEditVehicleModal, showTrackingModal])

  const isValidVehicle = (vehicle: any) => {
    return (
      vehicle.plateNumber &&
      /^([A-Z]{3} \d{3}|[A-Z]{2} \d{3} [A-Z]{2})$/.test(vehicle.plateNumber) &&
      vehicle.clientName?.trim()
    )
  }

  return (
    <>
      {/* Modal agregar nuevo vehículo */}
      <AnimatePresence>
        {showAddForm && (
          <div
            className='fixed z-[9999]'
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

      {/* Modal editar vehículo (datos básicos) */}
      <AnimatePresence>
        {showEditVehicleModal && editVehicle && (
          <div
            className='fixed z-[9999]'
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
                setVehicle={setEditVehicle}
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

      {/* Modal editar seguimiento */}
      <AnimatePresence>
        {showTrackingModal && editTracking && (
          <div
            className='fixed z-[9999]'
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
                setTracking={setEditTracking}
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
    </>
  )
}
