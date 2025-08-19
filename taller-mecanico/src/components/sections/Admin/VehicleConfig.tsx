'use client'
import { useState, useEffect, useMemo } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const VEHICLES_PER_PAGE = 6

  // Estados para edición
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<VehicleInTracking | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [editTracking, setEditTracking] = useState<VehicleInTracking | null>(
    null
  )
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Filtros y paginación
  const filteredVehicles = useMemo(() => {
    return vehiclesInTracking.filter(vehicle =>
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [vehiclesInTracking, searchTerm])

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * VEHICLES_PER_PAGE
    return filteredVehicles.slice(startIndex, startIndex + VEHICLES_PER_PAGE)
  }, [filteredVehicles, currentPage])

  const totalPages = Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE)

  // Cargar vehículos desde Firebase al montar
  useEffect(() => {
    fetchVehicles()
  }, [])

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchVehicles = async () => {
    const backendVehicles = await getAllVehicles()
    const mapped = backendVehicles.map(v => ({
      id: v.plateNumber,
      plateNumber: v.plateNumber,
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      clientName: v.clientName,
      clientPhone: v.clientPhone || '',
      serviceType: v.serviceType || '',
      chassisNumber: v.chassisNumber || '',
      entryDate: v.createdAt ? new Date(v.createdAt) : new Date(),
      estimatedCompletionDate: v.estimatedCompletionDate
        ? new Date(v.estimatedCompletionDate)
        : null, // Manejar null
      status: 'received' as const,
      totalCost: v.totalCost || 0, // Incluir totalCost
      steps: [],
      notes: v.notes || '',
      nextStep: v.nextStep || '',
    }))
    setVehiclesInTracking(mapped)
  }

  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    clientName: '',
    clientPhone: '',
    serviceType: '',
    chassisNumber: '',
    totalCost: 0,
    notes: '',
    createdAt: new Date(),
    estimatedCompletionDate: null as Date | null,
  })

  const selectedVehicleData = vehiclesInTracking.find(
    v => v.id === selectedVehicle
  )

  const showMessage = (msg: string, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  // Lógica de eliminación
  const handleDeleteVehicle = async () => {
    if (!selectedVehicleData) return
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar el vehículo ${selectedVehicleData.plateNumber}?`
      )
    )
      return

    showMessage('Eliminando vehículo...')
    try {
      const response = await deleteVehicle(selectedVehicleData.plateNumber)
      if (response.success) {
        await fetchVehicles()
        setSelectedVehicle('')
        showMessage('Vehículo eliminado correctamente')
      } else {
        showMessage(response.message || 'Error al eliminar vehículo')
      }
    } catch (error) {
      showMessage('Error al eliminar vehículo')
    }
  }

  // Lógica de edición de vehículo (datos básicos)
  const handleOpenEditVehicle = () => {
    if (selectedVehicleData) {
      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  const handleSaveVehicleEdit = async () => {
    if (!editVehicle) return
    showMessage('Guardando cambios...')
    try {
      const response = await updateVehicle(editVehicle.plateNumber, {
        plateNumber: editVehicle.plateNumber,
        brand: editVehicle.brand,
        model: editVehicle.model,
        year: editVehicle.year,
        clientName: editVehicle.clientName,
        clientPhone: editVehicle.clientPhone,
        serviceType: editVehicle.serviceType,
        chassisNumber: editVehicle.chassisNumber,
        totalCost: editVehicle.totalCost, // Incluir totalCost
        createdAt: editVehicle.entryDate,
        estimatedCompletionDate: editVehicle.estimatedCompletionDate,
      })
      if (response.success) {
        await fetchVehicles()
        setShowEditVehicleModal(false)
        showMessage('Vehículo actualizado')
      } else {
        showMessage(response.message || 'Error al actualizar vehículo')
      }
    } catch (error) {
      showMessage('Error al guardar cambios')
    }
  }

  // Lógica de edición de seguimiento (separada)
  const handleOpenTrackingEdit = () => {
    if (selectedVehicleData) {
      setEditTracking({ ...selectedVehicleData })
      setShowTrackingModal(true)
    }
  }

  const handleSaveTrackingEdit = async () => {
    if (!editTracking) return
    showMessage('Guardando seguimiento...')
    try {
      const response = await updateVehicle(editTracking.plateNumber, {
        notes: editTracking.notes,
        nextStep: editTracking.nextStep,
        estimatedCompletionDate: editTracking.estimatedCompletionDate,
      })
      if (response.success) {
        await fetchVehicles()
        setShowTrackingModal(false)
        showMessage('Seguimiento actualizado')
      } else {
        showMessage(response.message || 'Error al actualizar seguimiento')
      }
    } catch (error) {
      showMessage('Error al guardar seguimiento')
    }
  }

  const handleAddVehicle = async () => {
    showMessage('Guardando vehículo...')
    try {
      const response = await createVehicle({
        ...newVehicle,
        createdAt: newVehicle.createdAt,
        totalCost: newVehicle.totalCost, // Asegurar que se incluya totalCost
      })
      if (response.success) {
        await fetchVehicles()
        setNewVehicle({
          plateNumber: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          clientName: '',
          clientPhone: '',
          serviceType: '',
          chassisNumber: '',
          totalCost: 0,
          notes: '',
          createdAt: new Date(),
          estimatedCompletionDate: null,
        })
        setShowAddForm(false)
        showMessage('Vehículo agregado exitosamente')
      } else {
        showMessage(response.message || 'Error al agregar vehículo')
      }
    } catch (error) {
      showMessage('Error al guardar el vehículo')
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
        <div className='max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 gap-4'>
          <div>
            <h2 className='text-3xl font-bold text-white'>
              Gestión de Vehículos
            </h2>
            <p className='text-gray-400 mt-1'>
              {filteredVehicles.length} vehículos encontrados
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            {/* Buscador */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Buscar por patente...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  ✕
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap'
            >
              ➕ Nuevo Vehículo
            </motion.button>
          </div>
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
          vehicles={paginatedVehicles}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-2 mt-6'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors'
            >
              ← Anterior
            </button>

            <div className='flex gap-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors'
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Detalles del vehículo seleccionado */}
        <AnimatePresence>
          {selectedVehicleData && (
            <VehicleDetails
              vehicle={selectedVehicleData}
              onClose={() => setSelectedVehicle('')}
              onEditVehicle={handleOpenEditVehicle}
              onEditTracking={handleOpenTrackingEdit}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
        </AnimatePresence>

        <VehicleModal
          // Agregar nuevo vehículo
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          handleAddVehicle={handleAddVehicle}
          // Editar vehículo (datos básicos)
          showEditVehicleModal={showEditVehicleModal}
          setShowEditVehicleModal={setShowEditVehicleModal}
          editVehicle={editVehicle}
          setEditVehicle={setEditVehicle}
          handleSaveVehicleEdit={handleSaveVehicleEdit}
          // Editar seguimiento
          showTrackingModal={showTrackingModal}
          setShowTrackingModal={setShowTrackingModal}
          editTracking={editTracking}
          setEditTracking={setEditTracking}
          handleSaveTrackingEdit={handleSaveTrackingEdit}
        />
      </main>
    </div>
  )
}
