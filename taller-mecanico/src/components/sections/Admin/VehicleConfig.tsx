'use client'
import { useState, useEffect } from 'react'
import { createVehicle, getAllVehicles } from '@/actions/admin'
import { motion, AnimatePresence } from 'framer-motion'

// Tipos simplificados
interface VehicleStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  startDate?: Date
  endDate?: Date
  notes: string
}

interface VehicleInTracking {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number
  clientName: string
  clientPhone: string
  serviceType: string
  entryDate: Date
  estimatedCompletionDate?: Date
  status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered'
  totalCost?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
}

export default function VehicleConfig() {
  const [vehiclesInTracking, setVehiclesInTracking] = useState<
    VehicleInTracking[]
  >([])
  const [message, setMessage] = useState<string>('')

  // Estados para edición de vehículo y pasos
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<VehicleInTracking | null>(null)
  const [showStepModal, setShowStepModal] = useState(false)
  const [editStep, setEditStep] = useState<{
    vehicleId: string
    step: VehicleStep | null
  }>({ vehicleId: '', step: null })
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Cargar vehículos desde Firebase al montar
  useEffect(() => {
    async function fetchVehicles() {
      const backendVehicles = await getAllVehicles()
      // Mapear VehicleInput a VehicleInTracking
      const mapped = backendVehicles.map(v => ({
        id: v.plateNumber,
        plateNumber: v.plateNumber,
        brand: v.brand,
        model: v.model,
        year: new Date(v.createdAt).getFullYear(),
        clientName: v.clientName,
        clientPhone: v.clientPhone,
        serviceType: v.serviceType,
        entryDate: v.createdAt ? new Date(v.createdAt) : new Date(),
        status: 'received' as const,
        steps: [
          {
            id: `s${Date.now()}`,
            title: 'Recepción',
            description: 'Vehículo recibido en el taller',
            status: 'completed' as const,
            startDate: v.createdAt ? new Date(v.createdAt) : new Date(),
            endDate: v.createdAt ? new Date(v.createdAt) : new Date(),
            notes: 'Vehículo ingresado desde Firebase',
          },
        ],
        notes: '',
      }))
      setVehiclesInTracking(mapped)
    }
    fetchVehicles()
  }, [])

  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    clientName: '',
    clientPhone: '',
    serviceType: '',
    notes: '',
    createdAt: new Date(),
    status: 'received' as const,
    steps: [],
    totalCost: 0,
  })

  const selectedVehicleData = vehiclesInTracking.find(
    v => v.id === selectedVehicle
  )

  // Lógica de edición de vehículo
  const handleOpenEditVehicle = () => {
    if (selectedVehicleData) {
      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  const handleSaveVehicleEdit = () => {
    if (!editVehicle) return
    setVehiclesInTracking(prev =>
      prev.map(v => (v.id === editVehicle.id ? { ...editVehicle } : v))
    )
    setShowEditVehicleModal(false)
    setMessage('Vehículo actualizado')
    setTimeout(() => setMessage(''), 2000)
  }

  // Lógica de edición/agregado de pasos
  const handleOpenStepModal = (step: VehicleStep | null = null) => {
    if (!selectedVehicleData) return
    setEditStep({ vehicleId: selectedVehicleData.id, step })
    setShowStepModal(true)
  }

  const handleSaveStep = () => {
    if (!editStep.vehicleId) return
    setVehiclesInTracking(prev =>
      prev.map(vehicle => {
        if (vehicle.id !== editStep.vehicleId) return vehicle
        if (editStep.step && editStep.step.id) {
          // Editar paso existente
          return {
            ...vehicle,
            steps: vehicle.steps.map(s =>
              s.id === editStep.step!.id ? { ...editStep.step! } : s
            ),
          }
        } else {
          // Agregar nuevo paso
          const newStep: VehicleStep = {
            id: `s${Date.now()}`,
            title: editStep.step?.title || '',
            description: editStep.step?.description || '',
            notes: editStep.step?.notes || '',
            status: 'pending',
          }
          return {
            ...vehicle,
            steps: [...vehicle.steps, newStep],
          }
        }
      })
    )
    setShowStepModal(false)
    setEditStep({ vehicleId: '', step: null })
    setMessage('Paso guardado')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeleteStep = (stepId: string) => {
    if (!selectedVehicleData) return
    setVehiclesInTracking(prev =>
      prev.map(vehicle =>
        vehicle.id === selectedVehicleData.id
          ? { ...vehicle, steps: vehicle.steps.filter(s => s.id !== stepId) }
          : vehicle
      )
    )
    setMessage('Paso eliminado')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleAddVehicle = async () => {
    setMessage('Guardando vehículo...')
    try {
      const response = await createVehicle(newVehicle)
      if (response.success) {
        // Recargar lista desde backend
        const backendVehicles = await getAllVehicles()
        const mapped = backendVehicles.map(v => ({
          id: v.plateNumber,
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          year: new Date(v.createdAt).getFullYear(),
          clientName: v.clientName,
          clientPhone: v.clientPhone,
          serviceType: v.serviceType,
          entryDate: v.createdAt ? new Date(v.createdAt) : new Date(),
          status: 'received' as const,
          steps: [
            {
              id: `s${Date.now()}`,
              title: 'Recepción',
              description: 'Vehículo recibido en el taller',
              status: 'completed' as const,
              startDate: v.createdAt ? new Date(v.createdAt) : new Date(),
              endDate: v.createdAt ? new Date(v.createdAt) : new Date(),
              notes: 'Vehículo ingresado desde Firebase',
            },
          ],
          notes: '',
          totalCost: 0,
        }))
        setVehiclesInTracking(mapped)
        setNewVehicle({
          plateNumber: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          clientName: '',
          clientPhone: '',
          serviceType: '',
          notes: '',
          createdAt: new Date(),
          status: 'received' as const,
          steps: [],
          totalCost: 0,
        })
        setShowAddForm(false)
        setMessage('Vehículo agregado exitosamente')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(response.message || 'Error al agregar vehículo')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error de conexión o inesperado al guardar el vehículo')
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const getStatusColor = (
    status:
      | 'received'
      | 'in-diagnosis'
      | 'in-repair'
      | 'completed'
      | 'delivered'
  ) => {
    switch (status) {
      case 'received':
        return 'bg-blue-600'
      case 'in-diagnosis':
        return 'bg-yellow-600'
      case 'in-repair':
        return 'bg-orange-600'
      case 'completed':
        return 'bg-green-600'
      case 'delivered':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusText = (
    status:
      | 'received'
      | 'in-diagnosis'
      | 'in-repair'
      | 'completed'
      | 'delivered'
  ) => {
    switch (status) {
      case 'received':
        return 'Recibido'
      case 'in-diagnosis':
        return 'En diagnóstico'
      case 'in-repair':
        return 'En reparación'
      case 'completed':
        return 'Completado'
      case 'delivered':
        return 'Entregado'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <div className='bg-gray-800 shadow-lg py-6'>
        <div className='max-w-6xl mx-auto flex justify-between items-center px-4'>
          <div>
            <h2 className='text-3xl font-bold text-white'>
              Gestión de Vehículos
            </h2>
            <p className='text-gray-400 mt-1'>
              {vehiclesInTracking.length} vehículos en seguimiento
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors'
          >
            ➕ Nuevo Vehículo
          </motion.button>
        </div>
      </div>

      <main className='max-w-6xl mx-auto px-4 py-8 space-y-8'>
        {/* Mensaje */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='p-4 bg-blue-600 text-white rounded-lg text-center'
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de vehículos simplificada */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <h3 className='text-xl font-semibold mb-6'>Vehículos Activos</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {vehiclesInTracking.map(vehicle => (
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
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                      vehicle.status
                    )}`}
                  >
                    {getStatusText(vehicle.status)}
                  </span>
                </div>

                <div className='space-y-1 text-sm'>
                  <p className='text-gray-300'>{vehicle.clientName}</p>
                  <p className='text-gray-400'>{vehicle.serviceType}</p>
                  <p className='text-gray-500'>
                    Ingreso: {vehicle.entryDate.toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detalles del vehículo seleccionado */}
        <AnimatePresence>
          {selectedVehicleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-gray-800 rounded-xl p-6'
            >
              <div className='flex justify-between items-start mb-6'>
                <div className='flex-1'>
                  <h3 className='text-2xl font-bold text-white mb-2'>
                    {selectedVehicleData.plateNumber} -{' '}
                    {selectedVehicleData.brand} {selectedVehicleData.model}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3'>
                    <div>
                      <span className='text-gray-400'>Cliente:</span>{' '}
                      <span className='text-white ml-2'>
                        {selectedVehicleData.clientName}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Teléfono:</span>{' '}
                      <span className='text-white ml-2'>
                        {selectedVehicleData.clientPhone}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Servicio:</span>{' '}
                      <span className='text-white ml-2'>
                        {selectedVehicleData.serviceType}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Costo:</span>{' '}
                      <span className='text-white ml-2'>
                        ${selectedVehicleData.totalCost?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Edición inline de trabajos realizados, próximo paso y fecha estimada */}
                  <div className='bg-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-4'>
                    <div>
                      <label className='block text-gray-300 text-xs mb-1'>
                        Trabajos realizados / Notas
                      </label>
                      <textarea
                        className='w-full p-2 rounded bg-gray-800 border border-gray-600 text-white resize-none'
                        rows={2}
                        value={selectedVehicleData.notes || ''}
                        onChange={e =>
                          setVehiclesInTracking(prev =>
                            prev.map(v =>
                              v.id === selectedVehicleData.id
                                ? { ...v, notes: e.target.value }
                                : v
                            )
                          )
                        }
                        placeholder='Detalle de trabajos realizados o notas generales...'
                      />
                    </div>
                    <div className='flex flex-col md:flex-row gap-4'>
                      <div className='flex-1'>
                        <label className='block text-gray-300 text-xs mb-1'>
                          Próximo paso
                        </label>
                        <input
                          type='text'
                          className='w-full p-2 rounded bg-gray-800 border border-gray-600 text-white'
                          value={selectedVehicleData.nextStep || ''}
                          onChange={e =>
                            setVehiclesInTracking(prev =>
                              prev.map(v =>
                                v.id === selectedVehicleData.id
                                  ? { ...v, nextStep: e.target.value }
                                  : v
                              )
                            )
                          }
                          placeholder='Ej: Esperar repuesto, Llamar cliente, etc.'
                        />
                      </div>
                      <div className='flex-1'>
                        <label className='block text-gray-300 text-xs mb-1'>
                          Fecha estimada de finalización
                        </label>
                        <input
                          type='date'
                          className='w-full p-2 rounded bg-gray-800 border border-gray-600 text-white'
                          value={
                            selectedVehicleData.estimatedCompletionDate
                              ? new Date(
                                  selectedVehicleData.estimatedCompletionDate
                                )
                                  .toISOString()
                                  .substring(0, 10)
                              : ''
                          }
                          onChange={e =>
                            setVehiclesInTracking(prev =>
                              prev.map(v =>
                                v.id === selectedVehicleData.id
                                  ? {
                                      ...v,
                                      estimatedCompletionDate: e.target.value
                                        ? new Date(e.target.value)
                                        : undefined,
                                    }
                                  : v
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setSelectedVehicle('')}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleOpenEditVehicle}
                    className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm'
                  >
                    ✎ Editar
                  </button>
                </div>
              </div>

              {/* Timeline de pasos */}
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h4 className='text-lg font-semibold text-white'>
                    Progreso del Trabajo
                  </h4>
                  <button
                    onClick={() => handleOpenStepModal()}
                    className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm'
                  >
                    ➕ Agregar Paso
                  </button>
                </div>
                {selectedVehicleData.steps.map((step, index) => (
                  <div key={step.id} className='flex gap-4 group'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          step.status === 'completed'
                            ? 'bg-green-500'
                            : step.status === 'in-progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                      />
                      {index < selectedVehicleData.steps.length - 1 && (
                        <div className='w-0.5 h-16 bg-gray-600 mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <div className='flex justify-between items-start mb-2'>
                        <h5 className='font-semibold text-white'>
                          {step.title}
                        </h5>
                        <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <button
                            onClick={() => handleOpenStepModal(step)}
                            className='text-yellow-400 hover:text-yellow-300 text-lg'
                            title='Editar paso'
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className='text-red-500 hover:text-red-400 text-lg'
                            title='Eliminar paso'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className='text-gray-300 text-sm mb-2'>
                        {step.description}
                      </p>
                      {step.notes && (
                        <p className='text-gray-400 text-xs'>{step.notes}</p>
                      )}
                      {step.startDate && (
                        <p className='text-gray-500 text-xs mt-1'>
                          {step.startDate.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario simplificado para agregar vehículo */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-gray-800 rounded-xl p-6 w-full max-w-md'
              >
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-xl font-bold text-white'>
                    Nuevo Vehículo
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <div className='space-y-4'>
                  <input
                    type='text'
                    placeholder='Patente *'
                    value={newVehicle.plateNumber}
                    onChange={e =>
                      setNewVehicle(prev => ({
                        ...prev,
                        plateNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='text'
                      placeholder='Marca'
                      value={newVehicle.brand}
                      onChange={e =>
                        setNewVehicle(prev => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                    />
                    <input
                      type='text'
                      placeholder='Modelo'
                      value={newVehicle.model}
                      onChange={e =>
                        setNewVehicle(prev => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                    />
                  </div>

                  <input
                    type='text'
                    placeholder='Cliente *'
                    value={newVehicle.clientName}
                    onChange={e =>
                      setNewVehicle(prev => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />

                  <input
                    type='text'
                    placeholder='Teléfono'
                    value={newVehicle.clientPhone}
                    onChange={e =>
                      setNewVehicle(prev => ({
                        ...prev,
                        clientPhone: e.target.value,
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />

                  <input
                    type='text'
                    placeholder='Tipo de servicio'
                    value={newVehicle.serviceType}
                    onChange={e =>
                      setNewVehicle(prev => ({
                        ...prev,
                        serviceType: e.target.value,
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />

                  <div className='flex gap-4 pt-4'>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddVehicle}
                      className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal editar vehículo */}
        <AnimatePresence>
          {showEditVehicleModal && editVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-gray-800 rounded-xl p-6 w-full max-w-md'
              >
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-xl font-bold text-white'>
                    Editar Vehículo
                  </h3>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>
                <div className='space-y-4'>
                  <input
                    type='text'
                    placeholder='Patente *'
                    value={editVehicle.plateNumber}
                    onChange={e =>
                      setEditVehicle(v =>
                        v
                          ? { ...v, plateNumber: e.target.value.toUpperCase() }
                          : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='text'
                      placeholder='Marca'
                      value={editVehicle.brand}
                      onChange={e =>
                        setEditVehicle(v =>
                          v ? { ...v, brand: e.target.value } : v
                        )
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                    />
                    <input
                      type='text'
                      placeholder='Modelo'
                      value={editVehicle.model}
                      onChange={e =>
                        setEditVehicle(v =>
                          v ? { ...v, model: e.target.value } : v
                        )
                      }
                      className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                    />
                  </div>
                  <input
                    type='text'
                    placeholder='Cliente *'
                    value={editVehicle.clientName}
                    onChange={e =>
                      setEditVehicle(v =>
                        v ? { ...v, clientName: e.target.value } : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <input
                    type='text'
                    placeholder='Teléfono'
                    value={editVehicle.clientPhone}
                    onChange={e =>
                      setEditVehicle(v =>
                        v ? { ...v, clientPhone: e.target.value } : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <input
                    type='text'
                    placeholder='Tipo de servicio'
                    value={editVehicle.serviceType}
                    onChange={e =>
                      setEditVehicle(v =>
                        v ? { ...v, serviceType: e.target.value } : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <input
                    type='number'
                    placeholder='Año'
                    value={editVehicle.year}
                    onChange={e =>
                      setEditVehicle(v =>
                        v
                          ? {
                              ...v,
                              year:
                                parseInt(e.target.value) ||
                                new Date().getFullYear(),
                            }
                          : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <input
                    type='number'
                    placeholder='Costo total'
                    value={editVehicle.totalCost || ''}
                    onChange={e =>
                      setEditVehicle(v =>
                        v
                          ? {
                              ...v,
                              totalCost: parseInt(e.target.value) || undefined,
                            }
                          : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <textarea
                    placeholder='Notas'
                    value={editVehicle.notes}
                    onChange={e =>
                      setEditVehicle(v =>
                        v ? { ...v, notes: e.target.value } : v
                      )
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20'
                  />
                </div>
                <div className='flex gap-4 pt-4'>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveVehicleEdit}
                    className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal agregar/editar paso */}
        <AnimatePresence>
          {showStepModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-gray-800 rounded-xl p-6 w-full max-w-md'
              >
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-xl font-bold text-white'>
                    {editStep.step ? 'Editar Paso' : 'Agregar Paso'}
                  </h3>
                  <button
                    onClick={() => setShowStepModal(false)}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>
                <div className='space-y-4'>
                  <input
                    type='text'
                    placeholder='Título *'
                    value={editStep.step?.title || ''}
                    onChange={e =>
                      setEditStep(s => ({
                        ...s,
                        step: {
                          ...s.step,
                          title: e.target.value,
                          id: s.step?.id || '',
                          status: s.step?.status || 'pending',
                          description: s.step?.description || '',
                          notes: s.step?.notes || '',
                        },
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  />
                  <textarea
                    placeholder='Descripción'
                    value={editStep.step?.description || ''}
                    onChange={e =>
                      setEditStep(s => ({
                        ...s,
                        step: {
                          ...s.step,
                          description: e.target.value,
                          id: s.step?.id || '',
                          status: s.step?.status || 'pending',
                          title: s.step?.title || '',
                          notes: s.step?.notes || '',
                        },
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20'
                  />
                  <textarea
                    placeholder='Notas'
                    value={editStep.step?.notes || ''}
                    onChange={e =>
                      setEditStep(s => ({
                        ...s,
                        step: {
                          ...s.step,
                          notes: e.target.value,
                          id: s.step?.id || '',
                          status: s.step?.status || 'pending',
                          title: s.step?.title || '',
                          description: s.step?.description || '',
                        },
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-16'
                  />
                  <select
                    value={editStep.step?.status || 'pending'}
                    onChange={e =>
                      setEditStep(s => ({
                        ...s,
                        step: {
                          ...s.step,
                          status: e.target.value as VehicleStep['status'],
                          id: s.step?.id || '',
                          title: s.step?.title || '',
                          description: s.step?.description || '',
                          notes: s.step?.notes || '',
                        },
                      }))
                    }
                    className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
                  >
                    <option value='pending'>Pendiente</option>
                    <option value='in-progress'>En proceso</option>
                    <option value='completed'>Completado</option>
                  </select>
                </div>
                <div className='flex gap-4 pt-4'>
                  <button
                    onClick={() => setShowStepModal(false)}
                    className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveStep}
                    className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
