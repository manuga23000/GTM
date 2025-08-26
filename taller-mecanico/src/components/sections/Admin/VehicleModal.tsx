// src/components/sections/Admin/VehicleModal.tsx
// REEMPLAZA TODO EL CONTENIDO DEL ARCHIVO ACTUAL
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import VehicleForm from './VehicleForm'
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
  getFileType,
} from '@/lib/storageUtils'

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

// ACTUALIZADO: Interface para archivos del step (con Storage y thumbnails)
interface StepFile {
  id: string
  fileName: string // Nombre original del archivo
  type: 'image' | 'video'
  url: string // URL de Firebase Storage (permanente)
  thumbnailUrl?: string // URL del thumbnail (solo para imágenes)
  storageRef: string // Referencia en Storage para eliminar
  uploadedAt: Date // Fecha de subida
  size: number // Tamaño del archivo en bytes
  dimensions?: {
    // Dimensiones originales (solo para imágenes)
    width: number
    height: number
  }
}

// NUEVO: Interface para archivos en proceso de subida (temporal)
interface PendingStepFile {
  id: string
  file: File
  type: 'image' | 'video'
  tempUrl: string // URL temporal para preview
  uploadProgress?: number // Progreso de subida (0-100)
  uploading?: boolean // Si está subiendo
  error?: string // Error de subida
}

// MODIFICADO: Agregamos archivos al step (date siempre válida)
interface VehicleStep {
  id: string
  title: string
  // ✅ QUITADO: description ya no está en la interface
  status: 'completed' // Siempre completado
  date: Date // SEGURO: Nunca null
  notes?: string
  files?: StepFile[] // ACTUALIZADO: archivos del step con thumbnails
}

// Interface para el estado local del componente (incluye archivos pendientes)
interface LocalVehicleStep extends VehicleStep {
  pendingFiles?: PendingStepFile[] // Archivos en proceso de subida
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
  steps: VehicleStep[] // ACTUALIZADO: usa VehicleStep con thumbnails
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

// ACTUALIZADO: Componente para mostrar archivos de un step (con thumbnails optimizados)
const StepFileViewer = ({
  files,
  pendingFiles = [],
  onRemoveFile,
  onRemovePendingFile,
}: {
  files: StepFile[]
  pendingFiles?: PendingStepFile[]
  onRemoveFile: (fileId: string) => void
  onRemovePendingFile: (fileId: string) => void
}) => {
  if (
    (!files || files.length === 0) &&
    (!pendingFiles || pendingFiles.length === 0)
  ) {
    return null
  }

  return (
    <div className='mt-2 flex gap-2 flex-wrap'>
      {/* Archivos subidos */}
      {files?.map(file => (
        <div key={file.id} className='relative group'>
          {file.type === 'image' ? (
            <img
              // OPTIMIZADO: Usar thumbnail para vista previa
              src={file.thumbnailUrl || file.url}
              alt={file.fileName}
              className='w-16 h-16 object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400'
              loading='lazy' // Lazy loading para mejor rendimiento
              onClick={() => {
                // MEJORANDO: Abrir imagen original en modal fullscreen
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] cursor-pointer'
                modal.onclick = () => document.body.removeChild(modal)

                const img = document.createElement('img')
                img.src = file.url // IMPORTANTE: usar URL original, no thumbnail
                img.className = 'max-w-full max-h-full object-contain'
                img.alt = file.fileName

                // Loading indicator mientras carga la imagen original
                const loader = document.createElement('div')
                loader.className = 'text-white text-lg'
                loader.innerHTML = '🔄 Cargando imagen original...'
                modal.appendChild(loader)

                img.onload = () => {
                  modal.removeChild(loader)
                  modal.appendChild(img)
                }

                document.body.appendChild(modal)
              }}
            />
          ) : (
            <video
              src={file.url}
              className='w-16 h-16 object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400'
              onClick={() => {
                // Abrir video en modal
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] cursor-pointer'
                modal.onclick = e => {
                  if (e.target === modal) document.body.removeChild(modal)
                }

                const video = document.createElement('video')
                video.src = file.url
                video.controls = true
                video.className = 'max-w-full max-h-full'

                modal.appendChild(video)
                document.body.appendChild(modal)
              }}
            />
          )}

          {/* Botón eliminar */}
          <button
            onClick={() => onRemoveFile(file.id)}
            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            ✕
          </button>

          {/* Indicador de tipo con info adicional */}
          <div className='absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl'>
            {file.type === 'image' ? '📷' : '🎥'}
            {/* NUEVO: Mostrar dimensiones para imágenes */}
            {file.dimensions && (
              <div className='text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 p-1 rounded absolute bottom-full right-0 mb-1 whitespace-nowrap'>
                {file.dimensions.width}x{file.dimensions.height}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Archivos pendientes (subiendo) - SIN CAMBIOS */}
      {pendingFiles?.map(pendingFile => (
        <div key={pendingFile.id} className='relative group'>
          <div className='w-16 h-16 relative'>
            {pendingFile.type === 'image' ? (
              <img
                src={pendingFile.tempUrl}
                alt='Subiendo...'
                className='w-full h-full object-cover rounded border border-yellow-500'
              />
            ) : (
              <video
                src={pendingFile.tempUrl}
                className='w-full h-full object-cover rounded border border-yellow-500'
              />
            )}

            {/* Overlay de progreso */}
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded'>
              {pendingFile.error ? (
                <span className='text-red-400 text-xs'>❌</span>
              ) : pendingFile.uploading ? (
                <div className='text-white text-xs'>
                  {pendingFile.uploadProgress
                    ? `${Math.round(pendingFile.uploadProgress)}%`
                    : '...'}
                </div>
              ) : (
                <span className='text-yellow-400 text-xs'>⏳</span>
              )}
            </div>
          </div>

          {/* Botón eliminar (para archivos pendientes) */}
          <button
            onClick={() => onRemovePendingFile(pendingFile.id)}
            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            ✕
          </button>

          {/* Indicador de tipo */}
          <div className='absolute bottom-0 right-0 bg-yellow-600 text-white text-xs px-1 rounded-tl'>
            {pendingFile.type === 'image' ? '📷' : '🎥'}
          </div>
        </div>
      ))}
    </div>
  )
}

// NUEVO: Componente para subir archivos (actualizado para Storage)
const FileUploader = ({
  onFilesSelected,
  disabled,
  currentFileCount,
  hasVideo,
}: {
  onFilesSelected: (files: File[]) => void
  disabled: boolean
  currentFileCount: number
  hasVideo: boolean
}) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validar archivos antes de procesarlos
      const validFiles = files.filter(file => {
        if (!validateFileType(file)) {
          alert(`Archivo ${file.name}: Tipo no permitido`)
          return false
        }
        if (!validateFileSize(file, 10)) {
          alert(`Archivo ${file.name}: Tamaño muy grande (máximo 10MB)`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = ''
  }

  const remainingSlots = 3 - currentFileCount
  const canAddVideo = !hasVideo && remainingSlots > 0

  return (
    <div className='flex gap-1'>
      {remainingSlots > 0 && (
        <>
          {/* Subir imagen */}
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/webp,image/gif'
              multiple
              onChange={handleFileSelect}
              className='hidden'
              disabled={disabled}
            />
            <div className='w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center text-sm transition-colors disabled:opacity-50'>
              📷
            </div>
          </label>

          {/* Subir video (solo si no hay video ya) */}
          {canAddVideo && (
            <label className='cursor-pointer'>
              <input
                type='file'
                accept='video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime'
                onChange={handleFileSelect}
                className='hidden'
                disabled={disabled}
              />
              <div className='w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center text-sm transition-colors disabled:opacity-50'>
                🎥
              </div>
            </label>
          )}
        </>
      )}
    </div>
  )
}

// Componente para formulario de seguimiento ACTUALIZADO (con Storage)
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

  // Estado local para manejar archivos pendientes
  const [localSteps, setLocalSteps] = useState<LocalVehicleStep[]>([])

  // Sincronizar steps del tracking con el estado local
  useEffect(() => {
    setLocalSteps(tracking.steps.map(step => ({ ...step, pendingFiles: [] })))
  }, [tracking.steps])

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
      // ✅ QUITADO: description ya no se asigna
      status: 'completed',
      date: new Date(), // Fecha actual
      notes: '',
      files: [], // Inicializar archivos vacío
    }
    setTracking(prev => ({
      ...prev,
      steps: [...prev.steps, step],
    }))
    setNewStep({ title: '' })
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este trabajo?')) return

    // Encontrar el step para eliminar sus archivos de Storage
    const stepToDelete = tracking.steps.find(s => s.id === stepId)
    if (stepToDelete?.files) {
      // Eliminar archivos de Storage
      await Promise.all(
        stepToDelete.files.map(file => deleteFileFromStorage(file.url))
      )
    }

    setTracking(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }))
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

  // ACTUALIZADO: Manejar archivos de un step con Storage y thumbnails
  const handleStepFilesSelected = async (stepId: string, files: File[]) => {
    // Verificar límites primero
    const currentStep = tracking.steps.find(s => s.id === stepId)
    const currentFiles = currentStep?.files || []
    const currentVideoCount = currentFiles.filter(
      f => f.type === 'video'
    ).length

    // Crear archivos pendientes
    const pendingFiles: PendingStepFile[] = []

    for (const file of files) {
      // Verificar límites
      if (currentFiles.length + pendingFiles.length >= 3) break

      const isVideo = getFileType(file) === 'video'

      // Solo permitir un video
      if (
        isVideo &&
        (currentVideoCount > 0 || pendingFiles.some(f => f.type === 'video'))
      ) {
        continue
      }

      const pendingFile: PendingStepFile = {
        id: Date.now().toString() + Math.random(),
        file,
        type: getFileType(file),
        tempUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        uploading: true,
      }

      pendingFiles.push(pendingFile)
    }

    // Agregar archivos pendientes al estado local
    setLocalSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step
        return {
          ...step,
          pendingFiles: [...(step.pendingFiles || []), ...pendingFiles],
        }
      })
    )

    // Subir archivos uno por uno
    for (const pendingFile of pendingFiles) {
      try {
        const fileName = generateUniqueFileName(
          pendingFile.file.name,
          tracking.plateNumber,
          stepId
        )

        // ACTUALIZADO: usar nueva función que retorna objeto completo
        const uploadResult = await uploadFileToStorage(
          pendingFile.file,
          fileName,
          progress => {
            // Actualizar progreso
            setLocalSteps(prev =>
              prev.map(step => {
                if (step.id !== stepId) return step
                return {
                  ...step,
                  pendingFiles: (step.pendingFiles || []).map(pf =>
                    pf.id === pendingFile.id
                      ? { ...pf, uploadProgress: progress }
                      : pf
                  ),
                }
              })
            )
          }
        )

        // ACTUALIZADO: Crear archivo con toda la información incluyendo thumbnail
        const uploadedFile: StepFile = {
          id: pendingFile.id,
          fileName: uploadResult.metadata.name,
          type: pendingFile.type,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl, // NUEVO: thumbnail para imágenes
          storageRef: fileName,
          uploadedAt: new Date(),
          size: uploadResult.metadata.size,
          dimensions: uploadResult.metadata.dimensions, // NUEVO: dimensiones para imágenes
        }

        // Agregar al tracking y remover de pendientes
        setTracking(prev => ({
          ...prev,
          steps: prev.steps.map(step => {
            if (step.id !== stepId) return step
            return {
              ...step,
              files: [...(step.files || []), uploadedFile],
            }
          }),
        }))

        // Remover de archivos pendientes
        setLocalSteps(prev =>
          prev.map(step => {
            if (step.id !== stepId) return step
            return {
              ...step,
              pendingFiles: (step.pendingFiles || []).filter(
                pf => pf.id !== pendingFile.id
              ),
            }
          })
        )

        // Limpiar URL temporal
        URL.revokeObjectURL(pendingFile.tempUrl)
      } catch (error) {
        console.error('Error uploading file:', error)

        // Marcar como error
        setLocalSteps(prev =>
          prev.map(step => {
            if (step.id !== stepId) return step
            return {
              ...step,
              pendingFiles: (step.pendingFiles || []).map(pf =>
                pf.id === pendingFile.id
                  ? { ...pf, uploading: false, error: 'Error al subir archivo' }
                  : pf
              ),
            }
          })
        )
      }
    }
  }

  // NUEVO: Remover archivo subido de Storage
  const handleRemoveStepFile = async (stepId: string, fileId: string) => {
    const stepFile = tracking.steps
      .find(s => s.id === stepId)
      ?.files?.find(f => f.id === fileId)

    if (stepFile) {
      // Eliminar de Storage
      await deleteFileFromStorage(stepFile.url)
    }

    // Remover del estado
    setTracking(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id !== stepId) return step
        return {
          ...step,
          files: (step.files || []).filter(f => f.id !== fileId),
        }
      }),
    }))
  }

  // NUEVO: Remover archivo pendiente
  const handleRemovePendingFile = (stepId: string, fileId: string) => {
    // Encontrar archivo pendiente para limpiar URL temporal
    const pendingFile = localSteps
      .find(s => s.id === stepId)
      ?.pendingFiles?.find(f => f.id === fileId)

    if (pendingFile) {
      URL.revokeObjectURL(pendingFile.tempUrl)
    }

    setLocalSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step
        return {
          ...step,
          pendingFiles: (step.pendingFiles || []).filter(f => f.id !== fileId),
        }
      })
    )
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

      {/* Lista de trabajos realizados (MODIFICADA para usar Storage) */}
      <div className='space-y-2 max-h-48 overflow-y-auto mb-4'>
        {localSteps.map(step => {
          const stepFiles = step.files || []
          const pendingFiles = step.pendingFiles || []
          const totalFiles = stepFiles.length + pendingFiles.length
          const hasVideo =
            stepFiles.some(f => f.type === 'video') ||
            pendingFiles.some(f => f.type === 'video')

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-gray-700/50 p-2 rounded border border-gray-600 text-xs'
            >
              <div className='flex items-center justify-between w-full mb-1'>
                <div className='flex items-center gap-2 flex-1'>
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

                  {/* Uploader de archivos */}
                  <FileUploader
                    onFilesSelected={files =>
                      handleStepFilesSelected(step.id, files)
                    }
                    disabled={editingStepId === step.id}
                    currentFileCount={totalFiles}
                    hasVideo={hasVideo}
                  />

                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className='text-red-400 hover:text-red-300 text-xs p-1 ml-2'
                    title='Eliminar'
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Mostrar archivos del step */}
              <StepFileViewer
                files={stepFiles}
                pendingFiles={pendingFiles}
                onRemoveFile={fileId => handleRemoveStepFile(step.id, fileId)}
                onRemovePendingFile={fileId =>
                  handleRemovePendingFile(step.id, fileId)
                }
              />
            </motion.div>
          )
        })}
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
              onClick={e => {
                // Only close if clicking on the overlay, not the modal content
                if (e.target === e.currentTarget) {
                  setShowAddForm(false)
                }
              }}
            >
              <div
                className='absolute bg-black bg-opacity-80 backdrop-blur-sm'
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
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
                onClick={e => {
                  // Prevent click from bubbling up to the overlay
                  e.stopPropagation()
                }}
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
                    onClick={e => {
                      // Only close if clicking on the overlay, not the modal content
                      if (e.target === e.currentTarget) {
                        setShowAddForm(false)
                      }
                    }}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <VehicleForm
                  vehicle={newVehicle}
                  setVehicle={setNewVehicle as VehicleSetter<NewVehicleData>}
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
                    onClick={e => {
                      // Only close if clicking on the overlay, not the modal content
                      if (e.target === e.currentTarget) {
                        setShowAddForm(false)
                      }
                    }}
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
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
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
                onClick={e => {
                  // Prevent click from bubbling up to the overlay
                  e.stopPropagation()
                }}
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
                  setVehicle={setNewVehicle as VehicleSetter<NewVehicleData>}
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
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
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
                onClick={e => {
                  // Prevent click from bubbling up to the overlay
                  e.stopPropagation()
                }}
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
