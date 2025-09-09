'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import VehicleForm from './VehicleForm'
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
  getFileType,
} from '@/lib/storageUtils'

function usePortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return mounted
}

function Portal({ children }: { children: React.ReactNode }) {
  const mounted = usePortal()

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(children, document.body)
}

interface NewVehicleData {
  plateNumber: string
  brand: string
  model: string
  year: number
  clientName: string
  clientPhone: string
  serviceType: string
  chassisNumber: string
  km: number
  notes: string
  createdAt: Date
  estimatedCompletionDate: Date | null
}

interface StepFile {
  id: string
  fileName: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  storageRef: string
  uploadedAt: Date
  size: number
  dimensions?: {
    width: number
    height: number
  }
}

interface PendingStepFile {
  id: string
  file: File
  type: 'image' | 'video'
  tempUrl: string
  uploadProgress?: number
  uploading?: boolean
  error?: string
}

interface VehicleStep {
  id: string
  title: string
  status: 'completed'
  date: Date
  notes?: string
  files?: StepFile[]
}

interface LocalVehicleStep extends VehicleStep {
  pendingFiles?: PendingStepFile[]
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
  km?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
}

type VehicleSetter<T> = (value: T | ((prev: T) => T)) => void

interface VehicleModalProps {
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: NewVehicleData
  setNewVehicle: (
    value: NewVehicleData | ((prev: NewVehicleData) => NewVehicleData)
  ) => void
  handleAddVehicle: () => void
  addVehicleError: string
  isAddingVehicle: boolean

  onPatenteChange?: (patente: string) => void
  isLoadingHistorial?: boolean
  datosHistorialCargados?: boolean

  showEditVehicleModal: boolean
  setShowEditVehicleModal: (show: boolean) => void
  editVehicle: VehicleInTracking | null
  setEditVehicle: (
    value:
      | VehicleInTracking
      | null
      | ((prev: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveVehicleEdit: () => void
  isEditingVehicle: boolean

  showTrackingModal: boolean
  setShowTrackingModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: (
    value:
      | VehicleInTracking
      | null
      | ((prev: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveTrackingEdit: () => void
  isEditingTracking: boolean
}

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
    <div className='mt-2 flex gap-1 sm:gap-2 flex-wrap'>
      {files?.map(file => (
        <div key={file.id} className='relative group'>
          {file.type === 'image' ? (
            <Image
              src={file.thumbnailUrl || file.url}
              alt={file.fileName}
              width={48}
              height={48}
              className='w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400'
              onClick={() => {
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] cursor-pointer p-4'
                modal.onclick = () => document.body.removeChild(modal)

                const img = document.createElement('img')
                img.src = file.url
                img.className = 'max-w-full max-h-full object-contain'
                img.alt = file.fileName

                const loader = document.createElement('div')
                loader.className = 'text-white text-lg'
                loader.innerHTML = 'Cargando imagen original...'
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
              className='w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400'
              onClick={() => {
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] cursor-pointer p-4'
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

          <button
            onClick={() => onRemoveFile(file.id)}
            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            ✕
          </button>

          <div className='absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl'>
            {file.type === 'image' ? '📷' : '🎥'}
          </div>
        </div>
      ))}

      {pendingFiles?.map(pendingFile => (
        <div key={pendingFile.id} className='relative group'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 relative'>
            {pendingFile.type === 'image' ? (
              <Image
                src={pendingFile.tempUrl}
                alt='Subiendo...'
                width={48}
                height={48}
                className='w-full h-full object-cover rounded border border-yellow-500'
              />
            ) : (
              <video
                src={pendingFile.tempUrl}
                className='w-full h-full object-cover rounded border border-yellow-500'
              />
            )}

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

          <button
            onClick={() => onRemovePendingFile(pendingFile.id)}
            className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            ✕
          </button>

          <div className='absolute bottom-0 right-0 bg-yellow-600 text-white text-xs px-1 rounded-tl'>
            {pendingFile.type === 'image' ? '📷' : '🎥'}
          </div>
        </div>
      ))}
    </div>
  )
}

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
    e.target.value = ''
  }

  const remainingSlots = 10 - currentFileCount
  const canAddVideo = !hasVideo && remainingSlots > 0

  return (
    <div className='flex gap-1'>
      {remainingSlots > 0 && (
        <>
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/webp,image/gif'
              multiple
              onChange={handleFileSelect}
              className='hidden'
              disabled={disabled}
            />
            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center text-xs sm:text-sm transition-colors disabled:opacity-50'>
              📷
            </div>
          </label>

          {canAddVideo && (
            <label className='cursor-pointer'>
              <input
                type='file'
                accept='video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime'
                onChange={handleFileSelect}
                className='hidden'
                disabled={disabled}
              />
              <div className='w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center text-xs sm:text-sm transition-colors disabled:opacity-50'>
                🎥
              </div>
            </label>
          )}
        </>
      )}
    </div>
  )
}

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

  const [localSteps, setLocalSteps] = useState<LocalVehicleStep[]>([])

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
      status: 'completed',
      date: new Date(),
      notes: '',
      files: [],
    }
    setTracking(prev => ({
      ...prev,
      steps: [...prev.steps, step],
    }))
    setNewStep({ title: '' })
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este trabajo?')) return

    const stepToDelete = tracking.steps.find(s => s.id === stepId)
    if (stepToDelete?.files) {
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

  const handleStepFilesSelected = async (stepId: string, files: File[]) => {
    const currentStep = tracking.steps.find(s => s.id === stepId)
    const currentFiles = currentStep?.files || []
    const currentVideoCount = currentFiles.filter(
      f => f.type === 'video'
    ).length

    const pendingFiles: PendingStepFile[] = []

    for (const file of files) {
      if (currentFiles.length + pendingFiles.length >= 10) break

      const isVideo = getFileType(file) === 'video'

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

    setLocalSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step
        return {
          ...step,
          pendingFiles: [...(step.pendingFiles || []), ...pendingFiles],
        }
      })
    )

    for (const pendingFile of pendingFiles) {
      try {
        const fileName = generateUniqueFileName(
          pendingFile.file.name,
          tracking.plateNumber,
          stepId
        )

        const uploadResult = await uploadFileToStorage(
          pendingFile.file,
          fileName,
          progress => {
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

        const uploadedFile: StepFile = {
          id: pendingFile.id,
          fileName: uploadResult.metadata.name,
          type: pendingFile.type,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          storageRef: fileName,
          uploadedAt: new Date(),
          size: uploadResult.metadata.size,
          dimensions: uploadResult.metadata.dimensions,
        }

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

        URL.revokeObjectURL(pendingFile.tempUrl)
      } catch (error) {
        console.error('Error uploading file:', error)

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

  const handleRemoveStepFile = async (stepId: string, fileId: string) => {
    const stepFile = tracking.steps
      .find(s => s.id === stepId)
      ?.files?.find(f => f.id === fileId)

    if (stepFile) {
      await deleteFileFromStorage(stepFile.url)
    }

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

  const handleRemovePendingFile = (stepId: string, fileId: string) => {
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
    <div className='space-y-4 sm:space-y-6'>
      {/* Agregar trabajo - COMPACTO MÓVIL */}
      <div className='flex flex-col items-center justify-center py-2 w-full'>
        <label className='text-green-300 font-medium mb-1 text-xs sm:text-sm self-start'>
          Agregar trabajo realizado
        </label>
        <div className='flex flex-row items-center gap-2 w-full'>
          <input
            type='text'
            placeholder='Agregar trabajo realizado...'
            value={newStep.title}
            onChange={e => setNewStep({ title: e.target.value })}
            className='flex-1 px-2 sm:px-4 py-2 bg-gray-700 border border-green-400 rounded text-white text-sm sm:text-base shadow'
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddStep()
            }}
            maxLength={120}
            autoFocus
          />
          <button
            onClick={handleAddStep}
            disabled={!newStep.title.trim()}
            className='px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] sm:min-w-[48px]'
          >
            ➕
          </button>
        </div>
      </div>

      {/* Lista de trabajos - ALTURA LIMITADA EN MÓVIL */}
      <div className='space-y-2 max-h-32 sm:max-h-48 overflow-y-auto mb-4'>
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
                <div className='flex items-center gap-1 sm:gap-2 flex-1 min-w-0'>
                  <span className='text-sm sm:text-base'>✅</span>
                  {editingStepId === step.id ? (
                    <>
                      <input
                        type='text'
                        value={editingStepTitle}
                        onChange={e => setEditingStepTitle(e.target.value)}
                        className='flex-1 px-2 py-1 bg-gray-800 border border-green-400 rounded text-white text-xs shadow mr-1'
                        maxLength={120}
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
                        className='text-gray-400 hover:text-gray-300 text-xs p-1'
                        title='Cancelar'
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <span className='text-white flex-1 truncate text-xs sm:text-sm'>
                        {step.title}
                      </span>
                      <button
                        onClick={() => handleEditStep(step.id)}
                        className='text-yellow-400 hover:text-yellow-300 text-xs p-1'
                        title='Editar'
                      >
                        ✏️
                      </button>
                    </>
                  )}

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
                    className='text-red-400 hover:text-red-300 text-xs p-1'
                    title='Eliminar'
                  >
                    🗑️
                  </button>
                </div>
              </div>

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

      {/* Próximo paso - COMPACTO MÓVIL */}
      <div className='bg-blue-900/30 p-3 sm:p-4 rounded border border-blue-500/30 w-full flex flex-col items-start'>
        <div className='flex flex-row items-center w-full mb-2'>
          <span className='text-blue-300 font-medium text-xs sm:text-sm'>
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
                className='flex-1 px-2 sm:px-4 py-2 bg-gray-700 border border-blue-400 rounded text-white text-sm sm:text-base shadow'
                maxLength={120}
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
                className='text-green-400 hover:text-green-300 text-sm sm:text-base p-2 rounded'
                title='Guardar'
              >
                💾
              </button>
              <button
                onClick={() => {
                  setEditingNextStep(false)
                  setEditingNextStepValue(tracking.nextStep || '')
                }}
                className='text-gray-400 hover:text-gray-300 text-sm sm:text-base p-2 rounded'
                title='Cancelar'
              >
                ❌
              </button>
            </>
          ) : tracking.nextStep ? (
            <>
              <span className='text-white flex-1 text-xs sm:text-sm'>
                {tracking.nextStep}
              </span>
              <button
                onClick={() => {
                  setEditingNextStep(true)
                  setEditingNextStepValue(tracking.nextStep || '')
                }}
                className='text-yellow-400 hover:text-yellow-300 text-sm sm:text-base p-2 rounded'
                title='Editar'
              >
                ✏️
              </button>
              <button
                onClick={() => setTracking(prev => ({ ...prev, nextStep: '' }))}
                className='text-red-400 hover:text-red-300 text-sm sm:text-base p-2 rounded'
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
                className='flex-1 px-2 sm:px-4 py-2 bg-gray-700 border border-blue-400 rounded text-white text-sm sm:text-base shadow'
                maxLength={120}
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
                className='px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] sm:min-w-[48px]'
              >
                ➕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fecha estimada - COMPACTO */}
      <div className='bg-purple-900/30 p-2 sm:p-3 rounded border border-purple-500/30'>
        <h5 className='text-purple-300 font-medium mb-1 text-xs sm:text-sm'>
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
          className='w-full p-1 sm:p-2 bg-gray-700 border border-gray-600 rounded text-white text-xs sm:text-sm'
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
  onPatenteChange,
  isLoadingHistorial = false,
  datosHistorialCargados = false,
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
  const [patenteDebounce, setPatenteDebounce] = useState('')

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patenteDebounce && onPatenteChange) {
        onPatenteChange(patenteDebounce)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [patenteDebounce, onPatenteChange])

  const _handlePatenteInputChange = (value: string) => {
    const normalizedValue = value.toUpperCase()

    setNewVehicle((prev: NewVehicleData) => ({
      ...prev,
      plateNumber: normalizedValue,
    }))

    setPatenteDebounce(normalizedValue)
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setPatenteDebounce('')
  }

  const isValidVehicle = (vehicle: NewVehicleData): boolean => {
    return (
      !!vehicle.plateNumber &&
      /^([A-Z]{3} \d{3}|[A-Z]{2} \d{3} [A-Z]{2})$/.test(vehicle.plateNumber) &&
      !!vehicle.clientName.trim()
    )
  }

  return (
    <>
      {/* Modal Nuevo Vehículo - OPTIMIZADO MÓVIL */}
      <Portal>
        <AnimatePresence>
          {showAddForm && (
            <div
              className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4 pt-16 pb-8 sm:pt-4 sm:pb-4'
              onClick={e => {
                if (e.target === e.currentTarget) {
                  handleCloseAddForm()
                }
              }}
            >
              <div className='absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[75vh] sm:max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-3 sm:mb-4'>
                  <div>
                    <h3 className='text-lg sm:text-xl font-bold text-white'>
                      Crear Nuevo Vehículo
                    </h3>
                    <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                      Ingresa los datos del nuevo vehículo al sistema
                    </p>
                  </div>
                  <button
                    onClick={handleCloseAddForm}
                    className='text-gray-400 hover:text-white text-xl sm:text-2xl'
                  >
                    ✕
                  </button>
                </div>

                {datosHistorialCargados && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-3 sm:mb-4 p-2 sm:p-3 bg-green-900/30 border border-green-500/30 rounded-lg'
                  >
                    <div className='flex items-center gap-2 text-green-300'>
                      <span>✅</span>
                      <span className='font-medium text-xs sm:text-sm'>
                        Datos cargados del historial
                      </span>
                    </div>
                    <p className='text-green-200 text-xs mt-1'>
                      Se han precargado los datos del cliente de servicios
                      anteriores. Verifica y ajusta según sea necesario.
                    </p>
                  </motion.div>
                )}

                <VehicleForm
                  vehicle={newVehicle}
                  setVehicle={setNewVehicle as VehicleSetter<NewVehicleData>}
                  isEdit={false}
                  onPatenteChange={onPatenteChange}
                />

                {addVehicleError && (
                  <div className='mt-3 sm:mt-4 p-2 sm:p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <span className='text-red-400 text-sm sm:text-lg'>
                        ⚠️
                      </span>
                      <p className='text-red-300 text-xs sm:text-sm font-medium'>
                        {addVehicleError}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-700'>
                  <button
                    onClick={handleCloseAddForm}
                    className='flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={!isValidVehicle(newVehicle) || isAddingVehicle}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base ${
                      !isValidVehicle(newVehicle) || isAddingVehicle
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isAddingVehicle ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-xs sm:text-sm'>Creando...</span>
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

      {/* Modal Editar Vehículo - OPTIMIZADO MÓVIL */}
      <Portal>
        <AnimatePresence>
          {showEditVehicleModal && editVehicle && (
            <div
              className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4'
              onClick={() => setShowEditVehicleModal(false)}
            >
              <div className='absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[75vh] sm:max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-3 sm:mb-4'>
                  <div>
                    <h3 className='text-lg sm:text-xl font-bold text-white'>
                      Editar Datos del Vehículo
                    </h3>
                    <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                      Modificar información básica del vehículo
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='text-gray-400 hover:text-white text-xl sm:text-2xl'
                  >
                    ✕
                  </button>
                </div>

                <VehicleForm
                  vehicle={editVehicle}
                  setVehicle={value => {
                    if (typeof value === 'function') {
                      setEditVehicle(prev => (prev ? value(prev) : prev))
                    } else {
                      setEditVehicle(value)
                    }
                  }}
                  isEdit={true}
                />

                <div className='flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveVehicleEdit}
                    disabled={isEditingVehicle}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base ${
                      isEditingVehicle ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingVehicle ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-xs sm:text-sm'>Guardando...</span>
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

      {/* Modal Seguimiento - OPTIMIZADO MÓVIL */}
      <Portal>
        <AnimatePresence>
          {showTrackingModal && editTracking && (
            <div className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4'>
              <div className='absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-gray-800 rounded-xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[95vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                <div className='flex justify-between items-center mb-4 sm:mb-6'>
                  <div>
                    <h3 className='text-lg sm:text-xl font-bold text-white'>
                      Actualizar Seguimiento
                    </h3>
                    <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                      {editTracking.plateNumber} - {editTracking.brand}{' '}
                      {editTracking.model}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className='text-gray-400 hover:text-white text-xl sm:text-2xl'
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

                <div className='flex gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-700'>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className='flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTrackingEdit}
                    disabled={isEditingTracking}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base ${
                      isEditingTracking ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingTracking ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-xs sm:text-sm'>Guardando...</span>
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
