'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} from '@/actions/vehicle'
import { motion, AnimatePresence } from 'framer-motion'
import VehicleList, { VehicleInTracking, VehicleStep } from './VehicleList'
import VehicleDetails from './VehicleDetails'
import VehicleModal from './VehicleModal'
import { deleteFileFromStorage } from '@/lib/storageUtils'
import { buscarHistorialCompleto } from '@/actions/seguimiento'

interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
}

export default function VehicleConfig() {
  const [vehiclesInTracking, setVehiclesInTracking] = useState<
    VehicleInTracking[]
  >([])
  const [message, setMessage] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const VEHICLES_PER_PAGE = 6

  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<VehicleInTracking | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [editTracking, setEditTracking] = useState<VehicleInTracking | null>(
    null
  )
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addVehicleError, setAddVehicleError] = useState<string>('')

  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [isEditingTracking, setIsEditingTracking] = useState(false)
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false)

  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false)
  const [datosHistorialCargados, setDatosHistorialCargados] = useState(false)

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

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchVehicles = async () => {
    try {
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
          : null,
        status: 'received' as const,
        km: v.km || 0,
        steps: (v.steps || []).map(step => {
          let stepDate: Date
          const dateValue = step.date

          if (dateValue instanceof Date) {
            stepDate = dateValue
          } else if (
            dateValue &&
            typeof dateValue === 'object' &&
            'seconds' in dateValue
          ) {
            const timestamp = dateValue as FirestoreTimestamp
            stepDate = new Date(timestamp.seconds * 1000)
          } else {
            stepDate = new Date()
          }

          return {
            ...step,
            status: 'completed' as const,
            date: stepDate,
            files: (step.files || []).map(file => ({
              ...file,
              uploadedAt:
                file.uploadedAt instanceof Date
                  ? file.uploadedAt
                  : new Date(file.uploadedAt),
            })),
          }
        }),
        notes: v.notes || '',
        nextStep: v.nextStep || '',
      }))
      setVehiclesInTracking(mapped)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      showMessage('Error al cargar vehículos')
    }
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
    km: 0,
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

  const handlePatenteChange = async (patente: string) => {
    setDatosHistorialCargados(false)
    setAddVehicleError('')

    setNewVehicle(prev => ({ ...prev, plateNumber: patente.toUpperCase() }))

    if (!patente.trim()) {
      return
    }

    setIsLoadingHistorial(true)

    try {
      const historial = await buscarHistorialCompleto(patente)

      if (historial.length > 0) {
        const ultimoServicio = historial[0]

        setNewVehicle(prev => ({
          ...prev,
          plateNumber: patente.toUpperCase(),
          clientName: ultimoServicio.cliente || prev.clientName,
          clientPhone: ultimoServicio.telefono || prev.clientPhone,
          brand: ultimoServicio.marca || prev.brand,
          model: ultimoServicio.modelo || prev.model,
          year: ultimoServicio.año ? parseInt(ultimoServicio.año) : prev.year,
          chassisNumber: prev.chassisNumber,
          km: ultimoServicio.km ? ultimoServicio.km + 1000 : prev.km,
          serviceType: '',
          notes: '',
          estimatedCompletionDate: null,
        }))

        setDatosHistorialCargados(true)
        showMessage(
          `Datos cargados del historial (${historial.length} servicio${
            historial.length > 1 ? 's' : ''
          } anterior${historial.length > 1 ? 'es' : ''})`
        )
      }
    } catch (error) {
      console.error('Error buscando historial:', error)
    } finally {
      setIsLoadingHistorial(false)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicleData || isDeletingVehicle) return

    const fileCount = selectedVehicleData.steps.reduce((acc, step) => {
      return acc + (step.files?.length || 0)
    }, 0)

    const confirmMessage =
      fileCount > 0
        ? `¿Seguro que deseas eliminar el vehículo ${
            selectedVehicleData.plateNumber
          }?\n\nEsto también eliminará ${fileCount} archivo${
            fileCount !== 1 ? 's' : ''
          } multimedia asociado${fileCount !== 1 ? 's' : ''}.`
        : `¿Seguro que deseas eliminar el vehículo ${selectedVehicleData.plateNumber}?`

    if (!window.confirm(confirmMessage)) return

    setIsDeletingVehicle(true)
    showMessage('Eliminando vehículo y archivos...')

    try {
      const response = await deleteVehicle(selectedVehicleData.plateNumber)

      if (response.success) {
        await fetchVehicles()
        setSelectedVehicle('')
        showMessage(
          fileCount > 0
            ? `Vehículo y ${fileCount} archivo${
                fileCount !== 1 ? 's' : ''
              } eliminado${fileCount !== 1 ? 's' : ''} exitosamente`
            : 'Vehículo eliminado exitosamente'
        )
      } else {
        showMessage(response.message || 'Error al eliminar vehículo')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      showMessage('Error al eliminar el vehículo')
    } finally {
      setIsDeletingVehicle(false)
    }
  }

  const handleOpenEditVehicle = () => {
    if (selectedVehicleData) {
      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  const handleSaveVehicleEdit = async () => {
    if (!editVehicle || isEditingVehicle) return
    setIsEditingVehicle(true)
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
        km: editVehicle.km,
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
    } finally {
      setIsEditingVehicle(false)
    }
  }

  const handleOpenTrackingEdit = (vehicle: VehicleInTracking) => {
    setEditTracking({
      ...vehicle,
      steps: vehicle.steps.map(step => ({
        ...step,
        files: (step.files || []).map(file => ({
          ...file,
          uploadedAt:
            file.uploadedAt instanceof Date
              ? file.uploadedAt
              : new Date(file.uploadedAt),
        })),
      })),
    })
    setShowTrackingModal(true)
  }

  const handleSaveTrackingEdit = async () => {
    if (!editTracking || isEditingTracking) return
    setIsEditingTracking(true)
    showMessage('Guardando seguimiento...')

    try {
      const normalizedSteps = editTracking.steps.map(step => ({
        ...step,
        files: (step.files || []).map(file => ({
          ...file,
          uploadedAt:
            file.uploadedAt instanceof Date
              ? file.uploadedAt
              : new Date(file.uploadedAt),
        })),
      }))

      const updateResult = await updateVehicle(editTracking.plateNumber, {
        steps: normalizedSteps,
        nextStep: editTracking.nextStep,
        notes: editTracking.notes,
        estimatedCompletionDate: editTracking.estimatedCompletionDate,
      })

      if (updateResult.success) {
        await fetchVehicles()
        setShowTrackingModal(false)
        showMessage('Seguimiento actualizado')
      } else {
        showMessage(
          'Error al guardar seguimiento: ' + (updateResult.message || '')
        )
      }
    } catch (error) {
      console.error('Error saving tracking:', error)
      showMessage('Error al guardar seguimiento')
    } finally {
      setIsEditingTracking(false)
    }
  }

  const handleAddVehicle = async () => {
    if (isAddingVehicle) return
    setIsAddingVehicle(true)
    setAddVehicleError('')
    showMessage('Guardando vehículo...')

    try {
      const response = await createVehicle({
        ...newVehicle,
        createdAt: newVehicle.createdAt,
        km: newVehicle.km,
        steps: [],
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
          km: 0,
          notes: '',
          createdAt: new Date(),
          estimatedCompletionDate: null,
        })
        setDatosHistorialCargados(false)
        setShowAddForm(false)
        showMessage('Vehículo agregado exitosamente')
      } else {
        setAddVehicleError(response.message || 'Error al agregar vehículo')
        showMessage(response.message || 'Error al agregar vehículo')
      }
    } catch (error) {
      setAddVehicleError('Error al guardar el vehículo')
      showMessage('Error al guardar el vehículo')
    } finally {
      setIsAddingVehicle(false)
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
              onClick={() => {
                setAddVehicleError('')
                setShowAddForm(true)
              }}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap'
            >
              Nuevo Vehículo
            </motion.button>
          </div>
        </div>
      </div>

      <main className='max-w-6xl mx-auto px-4 py-8 space-y-8'>
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

        <AnimatePresence>
          {selectedVehicleData && (
            <VehicleDetails
              vehicle={selectedVehicleData}
              onClose={() => setSelectedVehicle('')}
              onEditVehicle={handleOpenEditVehicle}
              onEditTracking={() => handleOpenTrackingEdit(selectedVehicleData)}
              onDeleteVehicle={handleDeleteVehicle}
              onVehicleFinalized={async () => {
                await fetchVehicles()
                setSelectedVehicle('')
                showMessage(
                  'Servicio finalizado. Vehículo movido al historial.'
                )
              }}
            />
          )}
        </AnimatePresence>

        <VehicleModal
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          handleAddVehicle={handleAddVehicle}
          addVehicleError={addVehicleError}
          isAddingVehicle={isAddingVehicle}
          onPatenteChange={handlePatenteChange}
          isLoadingHistorial={isLoadingHistorial}
          datosHistorialCargados={datosHistorialCargados}
          showEditVehicleModal={showEditVehicleModal}
          setShowEditVehicleModal={setShowEditVehicleModal}
          editVehicle={editVehicle}
          setEditVehicle={setEditVehicle}
          handleSaveVehicleEdit={handleSaveVehicleEdit}
          isEditingVehicle={isEditingVehicle}
          showTrackingModal={showTrackingModal}
          setShowTrackingModal={setShowTrackingModal}
          editTracking={editTracking}
          setEditTracking={setEditTracking}
          handleSaveTrackingEdit={handleSaveTrackingEdit}
          isEditingTracking={isEditingTracking}
        />
      </main>
    </div>
  )
}
