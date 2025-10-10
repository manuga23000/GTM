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

  // ✅ NUEVO: Guardar la patente original antes de editar
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

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchVehicles = async () => {
    try {
      console.log('🔍 fetchVehicles: Obteniendo vehículos de Firebase...')
      const backendVehicles = await getAllVehicles()
      console.log(
        '📦 fetchVehicles: Datos recibidos de Firebase:',
        backendVehicles.length,
        'vehículos'
      )

      const mapped = backendVehicles.map(v => {
        console.log(`🚗 Procesando vehículo ${v.plateNumber}:`, {
          fluidLevels: v.fluidLevels,
        })

        return {
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
          fluidLevels: v.fluidLevels || undefined,
        }
      })

      console.log('✅ fetchVehicles: Vehículos mapeados correctamente')
      console.log('📊 Primer vehículo mapeado:', {
        plateNumber: mapped[0]?.plateNumber,
        fluidLevels: mapped[0]?.fluidLevels,
      })

      setVehiclesInTracking(mapped)
    } catch (error) {
      console.error('❌ fetchVehicles: Error:', error)
      showMessage('Error al cargar vehículos')
    }
  }

  const refreshSelectedVehicle = async () => {
    if (!selectedVehicle) {
      console.log('⚠️ refreshSelectedVehicle: No hay vehículo seleccionado')
      return
    }

    console.log(
      '🔄 refreshSelectedVehicle: Refrescando vehículo:',
      selectedVehicle
    )

    try {
      // Solo obtener el vehículo seleccionado de Firebase
      const vehicleData = await getVehicleByPlate(selectedVehicle)

      console.log('📦 refreshSelectedVehicle: Datos recibidos de Firebase:', {
        plateNumber: vehicleData?.plateNumber,
        fluidLevels: vehicleData?.fluidLevels,
      })

      if (vehicleData) {
        // Actualizar solo ese vehículo en el estado
        setVehiclesInTracking(prev => {
          const updated = prev.map(v => {
            if (v.plateNumber === selectedVehicle) {
              console.log(
                '✅ refreshSelectedVehicle: Actualizando vehículo en lista'
              )
              console.log('📊 Nuevos fluidLevels:', vehicleData.fluidLevels)

              // Asegurarse de que fluidLevels tenga valores por defecto si no están presentes
              const updatedFluidLevels = vehicleData.fluidLevels || {
                aceite: 0,
                agua: 0,
                frenos: 0
              };

              console.log('🔄 Actualizando vehículo con fluidLevels:', updatedFluidLevels);

              return {
                ...v,
                ...(vehicleData.fluidLevels && { fluidLevels: updatedFluidLevels }), // Solo actualizar si existe
                // Mantener otros datos actualizados también
                steps: (vehicleData.steps || []).map(step => {
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
                notes: vehicleData.notes || v.notes,
                nextStep: vehicleData.nextStep || v.nextStep,
              }
            }
            return v
          })

          console.log(
            '📊 Estado actualizado, vehículo seleccionado ahora tiene:',
            {
              fluidLevels: updated.find(v => v.plateNumber === selectedVehicle)
                ?.fluidLevels,
            }
          )

          return updated
        })
      } else {
        console.log(
          '⚠️ refreshSelectedVehicle: No se encontró el vehículo en Firebase'
        )
      }
    } catch (error) {
      console.error('❌ refreshSelectedVehicle: Error:', error)
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

  // ✅ MODIFICADO: Guardar la patente original al abrir el modal de edición
  const handleOpenEditVehicle = () => {
    if (selectedVehicleData) {
      // Guardar la patente ORIGINAL normalizada (sin espacios)
      const normalizedPlate = selectedVehicleData.plateNumber
        .replace(/\s+/g, '')
        .toUpperCase()
      setOriginalPlateNumber(normalizedPlate)

      setEditVehicle({ ...selectedVehicleData })
      setShowEditVehicleModal(true)
    }
  }

  // ✅ REEMPLAZADO: Nueva lógica para detectar cambio de patente
  const handleSaveVehicleEdit = async () => {
    if (!editVehicle || isEditingVehicle) return
    setIsEditingVehicle(true)
    showMessage('Guardando cambios...')

    try {
      // Normalizar la nueva patente (sin espacios)
      const newPlateNormalized = editVehicle.plateNumber
        .replace(/\s+/g, '')
        .toUpperCase()

      // ✅ Detectar si cambió la patente
      const plateChanged = originalPlateNumber !== newPlateNormalized

      if (plateChanged) {
        // 🔄 Si cambió la patente: ELIMINAR viejo documento y CREAR uno nuevo
        console.log(
          `🔄 Cambiando patente de ${originalPlateNumber} a ${newPlateNormalized}`
        )

        // 1. Obtener todos los datos del vehículo actual (incluyendo steps con archivos)
        const vehicleData = await getVehicleByPlate(originalPlateNumber)

        if (!vehicleData) {
          showMessage('Error: No se encontró el vehículo original')
          setIsEditingVehicle(false)
          return
        }

        // 2. Crear el nuevo documento con la nueva patente y TODOS los datos
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
          steps: vehicleData.steps || [], // Mantener los steps con archivos
        })

        if (!createResponse.success) {
          showMessage(
            createResponse.message ||
              'Error al crear vehículo con nueva patente'
          )
          setIsEditingVehicle(false)
          return
        }

        // 3. Eliminar el documento viejo
        const deleteResponse = await deleteVehicle(originalPlateNumber)

        if (!deleteResponse.success) {
          showMessage(
            '⚠️ Vehículo actualizado pero no se pudo eliminar el registro anterior'
          )
        }

        showMessage(
          `✅ Patente actualizada: ${originalPlateNumber} → ${newPlateNormalized}`
        )
      } else {
        // ✏️ Si NO cambió la patente: solo actualizar normalmente
        console.log(`✏️ Actualizando datos del vehículo ${newPlateNormalized}`)

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

      // Recargar la lista y cerrar modal
      await fetchVehicles()

      // Seleccionar el vehículo con la nueva patente
      const vehicleToSelect = plateChanged
        ? newPlateNormalized
        : originalPlateNumber
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
        const currentSelected = selectedVehicle
        setSelectedVehicle('')
        setTimeout(() => setSelectedVehicle(currentSelected), 50)

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
      <div className='bg-gray-800 shadow-lg py-4 sm:py-6'>
        <div className='max-w-6xl mx-auto flex flex-col gap-4 px-3 sm:px-4'>
          <div className='flex flex-col sm:flex-row justify-between items-start gap-3'>
            <div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>
                Gestión de Vehículos
              </h2>
              <p className='text-gray-400 mt-1 text-sm sm:text-base'>
                {filteredVehicles.length} vehículos encontrados
              </p>
            </div>

            {/* BOTONES - Nuevo Vehículo y Generar Reporte PDF */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAddVehicleError('')
                  setShowAddForm(true)
                }}
                className='w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Nuevo Vehículo
              </motion.button>

              <WeeklyReportButton onMessage={showMessage} />
            </div>
          </div>

          <div className='relative w-full sm:max-w-md'>
            <input
              type='text'
              placeholder='Buscar por patente...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1'
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <main className='max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8'>
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='p-3 sm:p-4 bg-blue-600 text-white rounded-lg text-center text-sm sm:text-base'
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
          <div className='flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-xs sm:text-sm'
            >
              ← Ant
            </button>

            <div className='flex gap-1'>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page
                if (totalPages <= 5) {
                  page = i + 1
                } else {
                  if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors text-xs sm:text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-xs sm:text-sm'
            >
              Sig →
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
                showMessage(
                  'Servicio finalizado. Vehículo movido al historial.'
                )
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
