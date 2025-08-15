'use client'
import { useState, useEffect } from 'react'
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} from '@/actions/admin'
import { motion, AnimatePresence } from 'framer-motion'
import VehicleList, { VehicleInTracking } from './VehicleList'
import VehicleDetails from './VehicleDetails'
import VehicleModal from './VehicleModal'

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
        year: new Date(v.createdAt ?? new Date()).getFullYear(),
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

  // Lógica de eliminación de vehículo
  const handleDeleteVehicle = async () => {
    if (!selectedVehicleData) return
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar el vehículo ${selectedVehicleData.plateNumber}? Esta acción no se puede deshacer.`
      )
    )
      return
    setMessage('Eliminando vehículo...')
    try {
      const response = await deleteVehicle(selectedVehicleData.plateNumber)
      if (response.success) {
        // Refrescar lista desde backend
        const backendVehicles = await getAllVehicles()
        const mapped = backendVehicles.map(v => ({
          id: v.plateNumber,
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          year: new Date(v.createdAt ?? new Date()).getFullYear(),
          clientName: v.clientName,
          clientPhone: v.clientPhone,
          serviceType: v.serviceType,
          entryDate: v.createdAt ? new Date(v.createdAt) : new Date(),
          status: 'received' as const,
          steps: [],
          notes: '',
        }))
        setVehiclesInTracking(mapped)
        setSelectedVehicle('')
        setMessage('Vehículo eliminado correctamente')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(response.message || 'Error al eliminar vehículo')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error al eliminar vehículo')
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Lógica de edición de vehículo
  const handleOpenEditVehicle = () => {
    if (selectedVehicleData) {
      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  const handleSaveVehicleEdit = async () => {
    if (!editVehicle) return
    setMessage('Guardando cambios...')
    try {
      // Llamar a la acción que actualiza en Firebase
      const response = await updateVehicle(editVehicle.plateNumber, {
        plateNumber: editVehicle.plateNumber,
        brand: editVehicle.brand,
        model: editVehicle.model,
        year: editVehicle.year,
        clientName: editVehicle.clientName,
        clientPhone: editVehicle.clientPhone,
        serviceType: editVehicle.serviceType,
        createdAt: editVehicle.entryDate || new Date(),
      })
      if (response.success) {
        // Refrescar lista desde backend
        const backendVehicles = await getAllVehicles()
        const mapped = backendVehicles.map(v => ({
          id: v.plateNumber,
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          year: v.year,
          clientName: v.clientName,
          clientPhone: v.clientPhone,
          serviceType: v.serviceType,
          entryDate: v.createdAt ? new Date(v.createdAt) : new Date(),
          status: 'received' as const,
          steps: [],
          notes: '',
        }))
        setVehiclesInTracking(mapped)
        setShowEditVehicleModal(false)
        setMessage('Vehículo actualizado')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(response.message || 'Error al actualizar vehículo')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error al guardar cambios')
      setTimeout(() => setMessage(''), 4000)
    }
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
  console.log('DEBUG newVehicle:', newVehicle);
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
          year: new Date(v.createdAt ?? new Date()).getFullYear(),
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

        <VehicleList
          vehicles={vehiclesInTracking}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        {/* Detalles del vehículo seleccionado */}
        <AnimatePresence>
          {selectedVehicleData && (
            <VehicleDetails
              vehicle={selectedVehicleData}
              onClose={() => setSelectedVehicle('')}
              onEdit={handleOpenEditVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAddStep={() => handleOpenStepModal()}
              onEditStep={step => handleOpenStepModal(step)}
              onDeleteStep={handleDeleteStep}
              setVehiclesInTracking={setVehiclesInTracking}
            />
          )}
        </AnimatePresence>

        <VehicleModal
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          handleAddVehicle={handleAddVehicle}
          showEditVehicleModal={showEditVehicleModal}
          setShowEditVehicleModal={setShowEditVehicleModal}
          editVehicle={editVehicle}
          setEditVehicle={setEditVehicle}
          handleSaveVehicleEdit={handleSaveVehicleEdit}
          showStepModal={showStepModal}
          setShowStepModal={setShowStepModal}
          editStep={editStep}
          setEditStep={setEditStep}
          handleSaveStep={handleSaveStep}
          handleDeleteStep={handleDeleteStep}
        />
      </main>
    </div>
  )
}
