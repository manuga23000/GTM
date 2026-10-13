'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
  getVehicleByPlate,
} from '@/actions/vehicle'
import { motion, AnimatePresence } from 'framer-motion'
import VehicleList, { VehicleInTracking, VehicleStep } from './VehicleList'
import VehicleDetails from './VehicleDetails'
import VehicleModal from './VehicleModal'
import WeeklyReportButton from './WeeklyReportButton'
import { deleteFileFromStorage } from '@/lib/storageUtils'
import { buscarHistorialCompleto } from '@/actions/seguimiento'
import { Plus, Search, X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
}

export default function VehicleConfig() {
  const [vehiclesInTracking, setVehiclesInTracking] = useState<VehicleInTracking[]>([])
  const [message, setMessage] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const VEHICLES_PER_PAGE = 6

  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<VehicleInTracking | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [editTracking, setEditTracking] = useState<VehicleInTracking | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addVehicleError, setAddVehicleError] = useState<string>('')

  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [isEditingTracking, setIsEditingTracking] = useState(false)
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false)

  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false)
  const [datosHistorialCargados, setDatosHistorialCargados] = useState(false)
  const [originalPlateNumber, setOriginalPlateNumber] = useState<string>('')

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

  useEffect(() => { fetchVehicles() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm])

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
        estimatedCompletionDate: v.estimatedCompletionDate ? new Date(v.estimatedCompletionDate) : null,
        status: 'received' as const,
        km: v.km || 0,
        steps: (v.steps || []).map(step => {
          let stepDate: Date
          const dateValue = step.date
          if (dateValue instanceof Date) {
            stepDate = dateValue
          } else if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
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
              uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt),
            })),
          }
        }),
        notes: v.notes || '',
        nextStep: v.nextStep || '',
        fluidLevels: v.fluidLevels || undefined,
      }))
      setVehiclesInTracking(mapped)
    } catch (error) {
      console.error('❌ fetchVehicles: Error:', error)
      showMessage('Error al cargar vehículos')
    }
  }

  const refreshSelectedVehicle = async () => {
    if (!selectedVehicle) return
    try {
      const vehicleData = await getVehicleByPlate(selectedVehicle)
      if (vehicleData) {
        setVehiclesInTracking(prev => {
          const updated = prev.map(v => {
            if (v.plateNumber === selectedVehicle) {
              return {
                ...v,
                fluidLevels: vehicleData.fluidLevels !== undefined ? vehicleData.fluidLevels : v.fluidLevels,
                steps: (vehicleData.steps || []).map(step => {
                  let stepDate: Date
                  const dateValue = step.date
                  if (dateValue instanceof Date) {
                    stepDate = dateValue
                  } else if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
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
                      uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt),
                    })),
                  }
                }),
                notes: vehicleData.notes || v.notes,
                nextStep: vehicleData.nextStep || v.nextStep,
              }
            }
            return v
          })
          return updated
        })
      }
    } catch (error) {
      console.error('❌ Error refrescando vehículo:', error)
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

  const selectedVehicleData = useMemo(() => {
    if (!selectedVehicle) return null
    return vehiclesInTracking.find(v => v.id === selectedVehicle) || null
  }, [selectedVehicle, vehiclesInTracking])

  const showMessage = (msg: string, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  const handlePatenteChange = async (patente: string) => {
    setDatosHistorialCargados(false)
    setAddVehicleError('')
    setNewVehicle(prev => ({ ...prev, plateNumber: patente.toUpperCase() }))
    if (!patente.trim()) return
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
        showMessage(`Datos cargados del historial (${historial.length} servicio${historial.length > 1 ? 's' : ''} anterior${historial.length > 1 ? 'es' : ''})`)
      }
    } catch (error) {
      console.error('Error buscando historial:', error)
    } finally {
      setIsLoadingHistorial(false)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicleData || isDeletingVehicle) return
    const fileCount = selectedVehicleData.steps.reduce((acc, step) => acc + (step.files?.length || 0), 0)
    const confirmMessage = fileCount > 0
      ? `¿Seguro que deseas eliminar el vehículo ${selectedVehicleData.plateNumber}?\n\nEsto también eliminará ${fileCount} archivo${fileCount !== 1 ? 's' : ''} multimedia asociado${fileCount !== 1 ? 's' : ''}.`
      : `¿Seguro que deseas eliminar el vehículo ${selectedVehicleData.plateNumber}?`
    if (!window.confirm(confirmMessage)) return
    setIsDeletingVehicle(true)
    showMessage('Eliminando vehículo y archivos...')
    try {
      const response = await deleteVehicle(selectedVehicleData.plateNumber)
      if (response.success) {
        await fetchVehicles()
        setSelectedVehicle('')
        showMessage(fileCount > 0 ? `Vehículo y ${fileCount} archivo${fileCount !== 1 ? 's' : ''} eliminado${fileCount !== 1 ? 's' : ''} exitosamente` : 'Vehículo eliminado exitosamente')
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
      const normalizedPlate = selectedVehicleData.plateNumber.replace(/\s+/g, '').toUpperCase()
      setOriginalPlateNumber(normalizedPlate)
      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  const handleSaveVehicleEdit = async () => {
    if (!editVehicle || isEditingVehicle) return
    setIsEditingVehicle(true)
    showMessage('Guardando cambios...')
    try {
      const newPlateNormalized = editVehicle.plateNumber.replace(/\s+/g, '').toUpperCase()
      const plateChanged = originalPlateNumber !== newPlateNormalized
      if (plateChanged) {
        const vehicleData = await getVehicleByPlate(originalPlateNumber)
        if (!vehicleData) {
          showMessage('Error: No se encontró el vehículo original')
          setIsEditingVehicle(false)
          return
        }
        const createResponse = await createVehicle({
          ...vehicleData,
          plateNumber: newPlateNormalized,
          brand: editVehicle.brand,
          model: editVehicle.model,
          year: editVehicle.year,
          clientName: editVehicle.clientName,
          clientPhone: editVehicle.clientPhone,
          serviceType: editVehicle.serviceType,
          chassisNumber: editVehicle.chassisNumber,
          km: editVehicle.km,
          estimatedCompletionDate: editVehicle.estimatedCompletionDate,
          steps: vehicleData.steps || [],
        })
        if (!createResponse.success) {
          showMessage(createResponse.message || 'Error al crear vehículo con nueva patente')
          setIsEditingVehicle(false)
          return
        }
        const deleteResponse = await deleteVehicle(originalPlateNumber)
        if (!deleteResponse.success) showMessage('⚠️ Vehículo actualizado pero no se pudo eliminar el registro anterior')
        showMessage(`✅ Patente actualizada: ${originalPlateNumber} → ${newPlateNormalized}`)
      } else {
        const response = await updateVehicle(originalPlateNumber, {
          plateNumber: newPlateNormalized,
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
        if (!response.success) {
          showMessage(response.message || 'Error al actualizar vehículo')
          setIsEditingVehicle(false)
          return
        }
        showMessage('Vehículo actualizado')
      }
      await fetchVehicles()
      const vehicleToSelect = plateChanged ? editVehicle.plateNumber.replace(/\s+/g, '').toUpperCase() : originalPlateNumber
      setSelectedVehicle('')
      setTimeout(() => setSelectedVehicle(vehicleToSelect), 50)
      setShowEditVehicleModal(false)
    } catch (error) {
      console.error('Error al guardar cambios:', error)
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
          uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt),
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
          uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt),
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
        const currentSelected = selectedVehicle
        setSelectedVehicle('')
        setTimeout(() => setSelectedVehicle(currentSelected), 50)
        setShowTrackingModal(false)
        showMessage('Seguimiento actualizado')
      } else {
        showMessage('Error al guardar seguimiento: ' + (updateResult.message || ''))
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
      const response = await createVehicle({ ...newVehicle, createdAt: newVehicle.createdAt, km: newVehicle.km, steps: [] })
      if (response.success) {
        await fetchVehicles()
        setNewVehicle({ plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), clientName: '', clientPhone: '', serviceType: '', chassisNumber: '', km: 0, notes: '', createdAt: new Date(), estimatedCompletionDate: null })
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

  const getStatusColor = (status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered') => {
    switch (status) {
      case 'received':     return 'bg-blue-600'
      case 'in-diagnosis': return 'bg-amber-600'
      case 'in-repair':    return 'bg-orange-600'
      case 'completed':    return 'bg-emerald-600'
      case 'delivered':    return 'bg-zinc-600'
      default:             return 'bg-zinc-600'
    }
  }

  const getStatusText = (status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered') => {
    switch (status) {
      case 'received':     return 'Recibido'
      case 'in-diagnosis': return 'En diagnóstico'
      case 'in-repair':    return 'En reparación'
      case 'completed':    return 'Completado'
      case 'delivered':    return 'Entregado'
      default:             return 'Desconocido'
    }
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>

      {/* ── Top bar ── */}
      <div className='bg-zinc-900/80 border-b border-zinc-800 py-4 sm:py-5'>
        <div className='max-w-6xl mx-auto flex flex-col gap-4 px-3 sm:px-4'>
          <div className='flex flex-col sm:flex-row justify-between items-start gap-3'>
            <div>
              <h2 className='text-lg sm:text-2xl font-bold text-white'>Gestión de Vehículos</h2>
              <p className='text-zinc-500 mt-0.5 text-xs sm:text-sm'>
                {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Buttons */}
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setAddVehicleError(''); setShowAddForm(true) }}
                className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-900 font-bold rounded-xl transition-all text-sm border border-amber-400/30 shadow-md shadow-amber-900/30'
              >
                <Plus className='w-4 h-4' strokeWidth={2.5} />
                Nuevo Vehículo
              </motion.button>
              <WeeklyReportButton onMessage={showMessage} />
            </div>
          </div>

          {/* Search */}
          <div className='relative w-full sm:max-w-sm'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none' strokeWidth={2} />
            <input
              type='text'
              placeholder='Buscar por patente…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-9 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all text-sm'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5'
              >
                <X className='w-3.5 h-3.5' strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>
      </div>

      <main className='max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6'>

        {/* ── Toast ── */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='p-3 sm:p-4 bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-xl flex items-center gap-3 text-sm'
            >
              <CheckCircle2 className='w-4 h-4 text-amber-400 shrink-0' strokeWidth={2} />
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

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-1.5 mt-4'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
            >
              <ChevronLeft className='w-4 h-4' strokeWidth={2} />
            </button>

            <div className='flex gap-1'>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg transition-all text-xs font-semibold ${
                      currentPage === page
                        ? 'bg-amber-500 text-zinc-900 shadow-sm'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className='p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
            >
              <ChevronRight className='w-4 h-4' strokeWidth={2} />
            </button>
          </div>
        )}

        <AnimatePresence mode='wait'>
          {selectedVehicleData && (
            <VehicleDetails
              key={selectedVehicleData.id}
              vehicle={selectedVehicleData}
              onClose={() => setSelectedVehicle('')}
              onEditVehicle={handleOpenEditVehicle}
              onEditTracking={() => handleOpenTrackingEdit(selectedVehicleData)}
              onDeleteVehicle={handleDeleteVehicle}
              onVehicleFinalized={async () => {
                await fetchVehicles()
                setSelectedVehicle('')
                showMessage('Servicio finalizado. Vehículo movido al historial.')
              }}
              onVehicleUpdated={refreshSelectedVehicle}
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
