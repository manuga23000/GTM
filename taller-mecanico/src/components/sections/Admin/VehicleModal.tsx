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
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Car,
  Save,
  Plus,
  Pencil,
  Trash2,
  Camera,
  Video,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react'
import type { ServiceData, ServiceDataMotor, ServiceDataCaja } from '@/actions/types/types'
import ServiceDataForm, { getDetectedServiceTypes, getReparacionesTitulo, VehiclePhotoUpload } from './ServiceDataForm'

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
  dimensions?: { width: number; height: number }
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
  serviceData?: ServiceData
  serviceDataMotor?: ServiceDataMotor
  serviceDataCaja?: ServiceDataCaja
  fotoVehiculo?: string
  observaciones?: VehicleStep[]
}

type VehicleSetter<T> = (value: T | ((prev: T) => T)) => void

interface VehicleModalProps {
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  newVehicle: NewVehicleData
  setNewVehicle: (value: NewVehicleData | ((prev: NewVehicleData) => NewVehicleData)) => void
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
    value: VehicleInTracking | null | ((prev: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveVehicleEdit: () => void
  isEditingVehicle: boolean
  showTrackingModal: boolean
  setShowTrackingModal: (show: boolean) => void
  editTracking: VehicleInTracking | null
  setEditTracking: (
    value: VehicleInTracking | null | ((prev: VehicleInTracking | null) => VehicleInTracking | null)
  ) => void
  handleSaveTrackingEdit: () => void
  isEditingTracking: boolean
}

/* ── StepFileViewer ── */
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
  if ((!files || files.length === 0) && (!pendingFiles || pendingFiles.length === 0)) return null

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
              className='w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-zinc-600 cursor-pointer hover:border-amber-400 transition-colors'
              onClick={() => {
                const modal = document.createElement('div')
                modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-[99999] cursor-pointer p-4'
                modal.onclick = () => document.body.removeChild(modal)
                const img = document.createElement('img')
                img.src = file.url
                img.className = 'max-w-full max-h-full object-contain'
                img.alt = file.fileName
                const loader = document.createElement('div')
                loader.className = 'text-white text-lg'
                loader.innerHTML = 'Cargando imagen original...'
                modal.appendChild(loader)
                img.onload = () => { modal.removeChild(loader); modal.appendChild(img) }
                document.body.appendChild(modal)
              }}
            />
          ) : (
            <video
              src={file.url}
              className='w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-zinc-600 cursor-pointer hover:border-amber-400 transition-colors'
              onClick={() => {
                const modal = document.createElement('div')
                modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-[99999] cursor-pointer p-4'
                modal.onclick = e => { if (e.target === modal) document.body.removeChild(modal) }
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
            className='absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100'
          >
            <X className='w-2.5 h-2.5' strokeWidth={3} />
          </button>

          <div className='absolute bottom-0 right-0 bg-zinc-900/90 text-zinc-300 text-xs px-1 rounded-tl flex items-center'>
            {file.type === 'image'
              ? <Camera className='w-2.5 h-2.5' strokeWidth={2} />
              : <Video className='w-2.5 h-2.5' strokeWidth={2} />}
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
                className='w-full h-full object-cover rounded-lg border border-amber-500'
              />
            ) : (
              <video
                src={pendingFile.tempUrl}
                className='w-full h-full object-cover rounded-lg border border-amber-500'
              />
            )}

            <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
              {pendingFile.error ? (
                <X className='w-4 h-4 text-red-400' strokeWidth={2.5} />
              ) : pendingFile.uploading ? (
                <div className='text-white text-xs font-bold'>
                  {pendingFile.uploadProgress ? `${Math.round(pendingFile.uploadProgress)}%` : '...'}
                </div>
              ) : (
                <div className='w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin' />
              )}
            </div>
          </div>

          <button
            onClick={() => onRemovePendingFile(pendingFile.id)}
            className='absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all'
          >
            <X className='w-2.5 h-2.5' strokeWidth={3} />
          </button>

          <div className='absolute bottom-0 right-0 bg-amber-600 text-white text-xs px-1 rounded-tl flex items-center'>
            {pendingFile.type === 'image'
              ? <Camera className='w-2.5 h-2.5' strokeWidth={2} />
              : <Video className='w-2.5 h-2.5' strokeWidth={2} />}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── FileUploader ── */
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
        if (!validateFileType(file)) { alert(`Archivo ${file.name}: Tipo no permitido`); return false }
        const isVideo = getFileType(file) === 'video'
        const maxMB = isVideo ? 25 : 10
        if (!validateFileSize(file, maxMB)) { alert(`Archivo ${file.name}: Tamaño muy grande (máximo ${maxMB}MB)`); return false }
        return true
      })
      if (validFiles.length > 0) onFilesSelected(validFiles)
    }
    e.target.value = ''
  }

  const remainingSlots = 10 - currentFileCount
  const canAddVideo = !hasVideo && remainingSlots > 0

  return (
    <div className='flex gap-1'>
      {remainingSlots > 0 && (
        <>
          <label className='cursor-pointer' title='Agregar imagen'>
            <input
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/webp,image/gif'
              multiple
              onChange={handleFileSelect}
              className='hidden'
              disabled={disabled}
            />
            <div className='w-6 h-6 sm:w-7 sm:h-7 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg flex items-center justify-center transition-colors'>
              <Camera className='w-3 h-3 sm:w-3.5 sm:h-3.5' strokeWidth={2} />
            </div>
          </label>

          {canAddVideo && (
            <label className='cursor-pointer' title='Agregar video'>
              <input
                type='file'
                accept='video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime'
                onChange={handleFileSelect}
                className='hidden'
                disabled={disabled}
              />
              <div className='w-6 h-6 sm:w-7 sm:h-7 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg flex items-center justify-center transition-colors'>
                <Video className='w-3 h-3 sm:w-3.5 sm:h-3.5' strokeWidth={2} />
              </div>
            </label>
          )}
        </>
      )}
    </div>
  )
}

/* ── TrackingForm ── */
const TrackingForm = ({
  tracking,
  setTracking,
}: {
  tracking: VehicleInTracking
  setTracking: VehicleSetter<VehicleInTracking>
}) => {
  const [nextStepInput, setNextStepInput] = useState('')
  const [newStep, setNewStep] = useState({ title: '' })
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepTitle, setEditingStepTitle] = useState<string>('')
  const [editingNextStep, setEditingNextStep] = useState<boolean>(false)
  const [editingNextStepValue, setEditingNextStepValue] = useState<string>('')
  const [localSteps, setLocalSteps] = useState<LocalVehicleStep[]>([])

  useEffect(() => {
    setLocalSteps(prev => {
      const pendingMap = new Map(prev.map(s => [s.id, s.pendingFiles || []]))
      return tracking.steps.map(step => ({
        ...step,
        pendingFiles: pendingMap.get(step.id) || [],
      }))
    })
  }, [tracking.steps])

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDate = (dateString: string): Date => new Date(dateString + 'T12:00:00')

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
    setTracking(prev => ({ ...prev, steps: [...prev.steps, step] }))
    setNewStep({ title: '' })
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este trabajo?')) return
    const stepToDelete = tracking.steps.find(s => s.id === stepId)
    if (stepToDelete?.files) {
      await Promise.all(stepToDelete.files.map(file => deleteFileFromStorage(file.url)))
    }
    setTracking(prev => ({ ...prev, steps: prev.steps.filter(step => step.id !== stepId) }))
  }

  const handleEditStep = (stepId: string) => {
    const step = tracking.steps.find(s => s.id === stepId)
    if (step) { setEditingStepId(stepId); setEditingStepTitle(step.title) }
  }

  const handleSaveEditStep = () => {
    if (!editingStepId) return
    setTracking(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === editingStepId ? { ...step, title: editingStepTitle.trim() } : step
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
    const currentVideoCount = currentFiles.filter(f => f.type === 'video').length
    const pendingFiles: PendingStepFile[] = []

    for (const file of files) {
      if (currentFiles.length + pendingFiles.length >= 10) break
      const isVideo = getFileType(file) === 'video'
      if (isVideo && (currentVideoCount > 0 || pendingFiles.some(f => f.type === 'video'))) continue
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
      prev.map(step => step.id !== stepId ? step : { ...step, pendingFiles: [...(step.pendingFiles || []), ...pendingFiles] })
    )

    for (const pendingFile of pendingFiles) {
      try {
        const fileName = generateUniqueFileName(pendingFile.file.name, tracking.plateNumber, stepId)
        const uploadResult = await uploadFileToStorage(
          pendingFile.file, fileName,
          progress => setLocalSteps(prev => prev.map(step =>
            step.id !== stepId ? step : {
              ...step,
              pendingFiles: (step.pendingFiles || []).map(pf =>
                pf.id === pendingFile.id ? { ...pf, uploadProgress: progress } : pf
              ),
            }
          ))
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
          steps: prev.steps.map(step =>
            step.id !== stepId ? step : { ...step, files: [...(step.files || []), uploadedFile] }
          ),
        }))

        setLocalSteps(prev => prev.map(step =>
          step.id !== stepId ? step : {
            ...step,
            pendingFiles: (step.pendingFiles || []).filter(pf => pf.id !== pendingFile.id),
          }
        ))

        URL.revokeObjectURL(pendingFile.tempUrl)
      } catch (error) {
        console.error('Error uploading file:', error)
        setLocalSteps(prev => prev.map(step =>
          step.id !== stepId ? step : {
            ...step,
            pendingFiles: (step.pendingFiles || []).map(pf =>
              pf.id === pendingFile.id ? { ...pf, uploading: false, error: 'Error al subir archivo' } : pf
            ),
          }
        ))
      }
    }
  }

  const handleRemoveStepFile = async (stepId: string, fileId: string) => {
    const stepFile = tracking.steps.find(s => s.id === stepId)?.files?.find(f => f.id === fileId)
    if (stepFile) await deleteFileFromStorage(stepFile.url)
    setTracking(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id !== stepId ? step : { ...step, files: (step.files || []).filter(f => f.id !== fileId) }
      ),
    }))
  }

  const handleRemovePendingFile = (stepId: string, fileId: string) => {
    const pendingFile = localSteps.find(s => s.id === stepId)?.pendingFiles?.find(f => f.id === fileId)
    if (pendingFile) URL.revokeObjectURL(pendingFile.tempUrl)
    setLocalSteps(prev => prev.map(step =>
      step.id !== stepId ? step : { ...step, pendingFiles: (step.pendingFiles || []).filter(f => f.id !== fileId) }
    ))
  }

  const showPasoAPaso = (() => {
    if (!tracking.serviceType) return true
    const types = getDetectedServiceTypes(tracking.serviceType)
    if (!types.motor && !types.caja) return true
    const titulo = getReparacionesTitulo(tracking.serviceType)
    return titulo !== tracking.serviceType
  })()

  // ── Observaciones state & handlers ──
  const [localObservaciones, setLocalObservaciones] = useState<LocalVehicleStep[]>([])
  const [newObservacion, setNewObservacion] = useState({ title: '' })
  const [editingObsId, setEditingObsId] = useState<string | null>(null)
  const [editingObsTitle, setEditingObsTitle] = useState('')

  useEffect(() => {
    setLocalObservaciones(prev => {
      const pendingMap = new Map(prev.map(s => [s.id, s.pendingFiles || []]))
      return (tracking.observaciones || []).map(obs => ({
        ...obs,
        pendingFiles: pendingMap.get(obs.id) || [],
      }))
    })
  }, [tracking.observaciones])

  const handleAddObservacion = () => {
    if (!newObservacion.title.trim()) return
    if ((tracking.observaciones || []).length >= 3) return
    const obs: VehicleStep = {
      id: Date.now().toString(),
      title: newObservacion.title.trim(),
      status: 'completed',
      date: new Date(),
      notes: '',
      files: [],
    }
    setTracking(prev => ({ ...prev, observaciones: [...(prev.observaciones || []), obs] }))
    setNewObservacion({ title: '' })
  }

  const handleDeleteObservacion = async (obsId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta observación?')) return
    const obsToDelete = (tracking.observaciones || []).find(o => o.id === obsId)
    if (obsToDelete?.files) {
      await Promise.all(obsToDelete.files.map(file => deleteFileFromStorage(file.url)))
    }
    setTracking(prev => ({ ...prev, observaciones: (prev.observaciones || []).filter(o => o.id !== obsId) }))
  }

  const handleEditObservacion = (obsId: string) => {
    const obs = (tracking.observaciones || []).find(o => o.id === obsId)
    if (obs) { setEditingObsId(obsId); setEditingObsTitle(obs.title) }
  }

  const handleSaveEditObservacion = () => {
    if (!editingObsId) return
    setTracking(prev => ({
      ...prev,
      observaciones: (prev.observaciones || []).map(obs =>
        obs.id === editingObsId ? { ...obs, title: editingObsTitle.trim() } : obs
      ),
    }))
    setEditingObsId(null)
    setEditingObsTitle('')
  }

  const handleCancelEditObservacion = () => {
    setEditingObsId(null)
    setEditingObsTitle('')
  }

  const handleObsFilesSelected = async (obsId: string, files: File[]) => {
    const currentObs = (tracking.observaciones || []).find(o => o.id === obsId)
    const currentFiles = currentObs?.files || []
    const currentVideoCount = currentFiles.filter(f => f.type === 'video').length
    const pendingFiles: PendingStepFile[] = []

    for (const file of files) {
      if (currentFiles.length + pendingFiles.length >= 10) break
      const isVideo = getFileType(file) === 'video'
      if (isVideo && (currentVideoCount > 0 || pendingFiles.some(f => f.type === 'video'))) continue
      pendingFiles.push({
        id: Date.now().toString() + Math.random(),
        file,
        type: getFileType(file),
        tempUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        uploading: true,
      })
    }

    setLocalObservaciones(prev =>
      prev.map(obs => obs.id !== obsId ? obs : { ...obs, pendingFiles: [...(obs.pendingFiles || []), ...pendingFiles] })
    )

    for (const pendingFile of pendingFiles) {
      try {
        const fileName = generateUniqueFileName(pendingFile.file.name, tracking.plateNumber, obsId)
        const uploadResult = await uploadFileToStorage(
          pendingFile.file, fileName,
          progress => setLocalObservaciones(prev => prev.map(obs =>
            obs.id !== obsId ? obs : {
              ...obs,
              pendingFiles: (obs.pendingFiles || []).map(pf =>
                pf.id === pendingFile.id ? { ...pf, uploadProgress: progress } : pf
              ),
            }
          ))
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
          observaciones: (prev.observaciones || []).map(obs =>
            obs.id !== obsId ? obs : { ...obs, files: [...(obs.files || []), uploadedFile] }
          ),
        }))

        setLocalObservaciones(prev => prev.map(obs =>
          obs.id !== obsId ? obs : {
            ...obs,
            pendingFiles: (obs.pendingFiles || []).filter(pf => pf.id !== pendingFile.id),
          }
        ))

        URL.revokeObjectURL(pendingFile.tempUrl)
      } catch (error) {
        console.error('Error uploading file:', error)
        setLocalObservaciones(prev => prev.map(obs =>
          obs.id !== obsId ? obs : {
            ...obs,
            pendingFiles: (obs.pendingFiles || []).map(pf =>
              pf.id === pendingFile.id ? { ...pf, uploading: false, error: 'Error al subir archivo' } : pf
            ),
          }
        ))
      }
    }
  }

  const handleRemoveObsFile = async (obsId: string, fileId: string) => {
    const obsFile = (tracking.observaciones || []).find(o => o.id === obsId)?.files?.find(f => f.id === fileId)
    if (obsFile) await deleteFileFromStorage(obsFile.url)
    setTracking(prev => ({
      ...prev,
      observaciones: (prev.observaciones || []).map(obs =>
        obs.id !== obsId ? obs : { ...obs, files: (obs.files || []).filter(f => f.id !== fileId) }
      ),
    }))
  }

  const handleRemoveObsPendingFile = (obsId: string, fileId: string) => {
    const pendingFile = localObservaciones.find(o => o.id === obsId)?.pendingFiles?.find(f => f.id === fileId)
    if (pendingFile) URL.revokeObjectURL(pendingFile.tempUrl)
    setLocalObservaciones(prev => prev.map(obs =>
      obs.id !== obsId ? obs : { ...obs, pendingFiles: (obs.pendingFiles || []).filter(f => f.id !== fileId) }
    ))
  }

  return (
    <div className='space-y-4 sm:space-y-5'>
      {tracking.fotoVehiculo && (
        <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50 mb-1'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/30 flex-shrink-0'>
              <img src={tracking.fotoVehiculo} alt='Vehículo' loading='eager' className='w-full h-full object-cover' />
            </div>
            <span className='text-zinc-300 font-medium text-xs sm:text-sm'>Foto del Vehículo</span>
          </div>
        </div>
      )}

      {/* Datos específicos del servicio */}
      {tracking.serviceType && (() => {
        const types = getDetectedServiceTypes(tracking.serviceType)
        return (
          <>
            {types.motor && (
              <ServiceDataForm
                formType="motor"
                serviceData={tracking.serviceDataMotor || (tracking.serviceData?.type === 'motor' ? tracking.serviceData : undefined)}
                onChange={(data: ServiceData) =>
                  setTracking(prev => ({ ...prev, serviceDataMotor: data as ServiceDataMotor }))
                }
                plateNumber={tracking.plateNumber}
              />
            )}
            {types.caja && (
              <ServiceDataForm
                formType="caja"
                serviceData={tracking.serviceDataCaja || (tracking.serviceData?.type === 'caja' ? tracking.serviceData : undefined)}
                onChange={(data: ServiceData) =>
                  setTracking(prev => ({ ...prev, serviceDataCaja: data as ServiceDataCaja }))
                }
                plateNumber={tracking.plateNumber}
              />
            )}
          </>
        )
      })()}

      {showPasoAPaso && (<>
      {/* Agregar trabajo */}
      <div className='flex flex-col w-full'>
        <label className='text-amber-300 font-medium mb-1.5 text-xs sm:text-sm'>
          Agregar trabajo realizado
        </label>
        <div className='flex flex-row items-center gap-2 w-full'>
          <input
            type='text'
            placeholder='Agregar trabajo realizado...'
            value={newStep.title}
            onChange={e => setNewStep({ title: e.target.value })}
            className='flex-1 px-2 sm:px-4 py-2 bg-zinc-900 border border-amber-500/40 rounded-xl text-white text-sm shadow focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20'
            onKeyDown={e => { if (e.key === 'Enter') handleAddStep() }}
            maxLength={120}
            autoFocus
          />
          <button
            onClick={handleAddStep}
            disabled={!newStep.title.trim()}
            className='px-3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
          >
            <Plus className='w-4 h-4' strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Lista de pasos */}
      <div className='space-y-2 max-h-36 sm:max-h-52 overflow-y-auto'>
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
              className='bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50 text-xs'
            >
              <div className='flex items-center justify-between w-full mb-1'>
                <div className='flex items-center gap-1 sm:gap-2 flex-1 min-w-0'>
                  <CheckCircle2 className='w-3.5 h-3.5 text-emerald-400 shrink-0' strokeWidth={2} />
                  {editingStepId === step.id ? (
                    <>
                      <input
                        type='text'
                        value={editingStepTitle}
                        onChange={e => setEditingStepTitle(e.target.value)}
                        className='flex-1 px-2 py-1 bg-zinc-900 border border-amber-500/50 rounded-lg text-white text-xs shadow mr-1 focus:outline-none'
                        maxLength={120}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEditStep()
                          if (e.key === 'Escape') handleCancelEditStep()
                        }}
                      />
                      <button
                        onClick={handleSaveEditStep}
                        className='text-emerald-400 hover:text-emerald-300 text-xs p-1'
                        title='Guardar'
                        disabled={!editingStepTitle.trim()}
                      >
                        <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2} />
                      </button>
                      <button
                        onClick={handleCancelEditStep}
                        className='text-zinc-400 hover:text-zinc-300 text-xs p-1'
                        title='Cancelar'
                      >
                        <X className='w-3.5 h-3.5' strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className='text-white flex-1 truncate text-xs sm:text-sm'>
                        {step.title}
                      </span>
                      <button
                        onClick={() => handleEditStep(step.id)}
                        className='text-amber-400 hover:text-amber-300 text-xs p-1'
                        title='Editar'
                      >
                        <Pencil className='w-3 h-3' strokeWidth={2} />
                      </button>
                    </>
                  )}

                  <FileUploader
                    onFilesSelected={files => handleStepFilesSelected(step.id, files)}
                    disabled={editingStepId === step.id}
                    currentFileCount={totalFiles}
                    hasVideo={hasVideo}
                  />

                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className='text-red-400 hover:text-red-300 text-xs p-1'
                    title='Eliminar'
                  >
                    <Trash2 className='w-3 h-3' strokeWidth={2} />
                  </button>
                </div>
              </div>

              <StepFileViewer
                files={stepFiles}
                pendingFiles={pendingFiles}
                onRemoveFile={fileId => handleRemoveStepFile(step.id, fileId)}
                onRemovePendingFile={fileId => handleRemovePendingFile(step.id, fileId)}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Próximo paso */}
      <div className='bg-amber-500/8 p-3 sm:p-4 rounded-xl border border-amber-500/20 w-full'>
        <div className='flex items-center gap-2 w-full mb-2'>
          <ArrowRight className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          <span className='text-amber-300 font-medium text-xs sm:text-sm'>Próximo paso</span>
        </div>
        <div className='flex flex-row items-center gap-2 w-full'>
          {editingNextStep ? (
            <>
              <input
                type='text'
                value={editingNextStepValue}
                onChange={e => setEditingNextStepValue(e.target.value)}
                className='flex-1 px-2 sm:px-4 py-2 bg-zinc-900 border border-amber-500/50 rounded-xl text-white text-sm shadow focus:outline-none'
                maxLength={120}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && editingNextStepValue.trim()) {
                    setTracking(prev => ({ ...prev, nextStep: editingNextStepValue.trim() }))
                    setEditingNextStep(false)
                  }
                  if (e.key === 'Escape') { setEditingNextStep(false); setEditingNextStepValue(tracking.nextStep || '') }
                }}
              />
              <button
                onClick={() => {
                  if (editingNextStepValue.trim()) {
                    setTracking(prev => ({ ...prev, nextStep: editingNextStepValue.trim() }))
                    setEditingNextStep(false)
                  }
                }}
                disabled={!editingNextStepValue.trim()}
                className='text-emerald-400 hover:text-emerald-300 text-sm p-2 rounded-lg'
                title='Guardar'
              >
                <CheckCircle2 className='w-4 h-4' strokeWidth={2} />
              </button>
              <button
                onClick={() => { setEditingNextStep(false); setEditingNextStepValue(tracking.nextStep || '') }}
                className='text-zinc-400 hover:text-zinc-300 text-sm p-2 rounded-lg'
                title='Cancelar'
              >
                <X className='w-4 h-4' strokeWidth={2} />
              </button>
            </>
          ) : tracking.nextStep ? (
            <>
              <span className='text-white flex-1 text-xs sm:text-sm'>{tracking.nextStep}</span>
              <button
                onClick={() => { setEditingNextStep(true); setEditingNextStepValue(tracking.nextStep || '') }}
                className='text-amber-400 hover:text-amber-300 p-2 rounded-lg'
                title='Editar'
              >
                <Pencil className='w-4 h-4' strokeWidth={2} />
              </button>
              <button
                onClick={() => setTracking(prev => ({ ...prev, nextStep: '' }))}
                className='text-red-400 hover:text-red-300 p-2 rounded-lg'
                title='Borrar'
              >
                <Trash2 className='w-4 h-4' strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <input
                type='text'
                placeholder='Agregar próximo paso...'
                value={nextStepInput}
                onChange={e => setNextStepInput(e.target.value)}
                className='flex-1 px-2 sm:px-4 py-2 bg-zinc-900 border border-amber-500/40 rounded-xl text-white text-sm shadow focus:outline-none focus:border-amber-500/70'
                maxLength={120}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nextStepInput.trim()) {
                    setTracking(prev => ({ ...prev, nextStep: nextStepInput.trim() }))
                    setNextStepInput('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (nextStepInput.trim()) {
                    setTracking(prev => ({ ...prev, nextStep: nextStepInput.trim() }))
                    setNextStepInput('')
                  }
                }}
                disabled={!nextStepInput.trim()}
                className='px-3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Plus className='w-4 h-4' strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
      </>)}

      {/* Observaciones */}
      <div className='flex flex-col w-full'>
        <div className='flex items-center justify-between mb-1.5'>
          <label className='text-amber-300 font-medium text-xs sm:text-sm flex items-center gap-1.5'>
            <Eye className='w-3.5 h-3.5' strokeWidth={2} />
            Observaciones
          </label>
          <span className='text-zinc-500 text-xs'>{(tracking.observaciones || []).length}/3</span>
        </div>
        {(tracking.observaciones || []).length < 3 && (
          <div className='flex flex-row items-center gap-2 w-full mb-2'>
            <input
              type='text'
              placeholder='Agregar observación...'
              value={newObservacion.title}
              onChange={e => setNewObservacion({ title: e.target.value })}
              className='flex-1 px-2 sm:px-4 py-2 bg-zinc-900 border border-amber-500/40 rounded-xl text-white text-sm shadow focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20'
              onKeyDown={e => { if (e.key === 'Enter') handleAddObservacion() }}
              maxLength={200}
            />
            <button
              onClick={handleAddObservacion}
              disabled={!newObservacion.title.trim()}
              className='px-3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
            >
              <Plus className='w-4 h-4' strokeWidth={2.5} />
            </button>
          </div>
        )}
        <div className='space-y-2 max-h-52 overflow-y-auto'>
          {localObservaciones.map(obs => {
            const obsFiles = obs.files || []
            const pendingFiles = obs.pendingFiles || []
            const totalFiles = obsFiles.length + pendingFiles.length
            const hasVideo =
              obsFiles.some(f => f.type === 'video') ||
              pendingFiles.some(f => f.type === 'video')

            return (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50 text-xs'
              >
                <div className='flex items-center justify-between w-full mb-1'>
                  <div className='flex items-center gap-1 sm:gap-2 flex-1 min-w-0'>
                    <Eye className='w-3.5 h-3.5 text-amber-400 shrink-0' strokeWidth={2} />
                    {editingObsId === obs.id ? (
                      <>
                        <input
                          type='text'
                          value={editingObsTitle}
                          onChange={e => setEditingObsTitle(e.target.value)}
                          className='flex-1 px-2 py-1 bg-zinc-900 border border-amber-500/50 rounded-lg text-white text-xs shadow mr-1 focus:outline-none'
                          maxLength={200}
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEditObservacion()
                            if (e.key === 'Escape') handleCancelEditObservacion()
                          }}
                        />
                        <button
                          onClick={handleSaveEditObservacion}
                          className='text-emerald-400 hover:text-emerald-300 text-xs p-1'
                          title='Guardar'
                          disabled={!editingObsTitle.trim()}
                        >
                          <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2} />
                        </button>
                        <button
                          onClick={handleCancelEditObservacion}
                          className='text-zinc-400 hover:text-zinc-300 text-xs p-1'
                          title='Cancelar'
                        >
                          <X className='w-3.5 h-3.5' strokeWidth={2} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className='text-white flex-1 truncate text-xs sm:text-sm'>
                          {obs.title}
                        </span>
                        <button
                          onClick={() => handleEditObservacion(obs.id)}
                          className='text-amber-400 hover:text-amber-300 text-xs p-1'
                          title='Editar'
                        >
                          <Pencil className='w-3 h-3' strokeWidth={2} />
                        </button>
                      </>
                    )}

                    <FileUploader
                      onFilesSelected={files => handleObsFilesSelected(obs.id, files)}
                      disabled={editingObsId === obs.id}
                      currentFileCount={totalFiles}
                      hasVideo={hasVideo}
                    />

                    <button
                      onClick={() => handleDeleteObservacion(obs.id)}
                      className='text-red-400 hover:text-red-300 text-xs p-1'
                      title='Eliminar'
                    >
                      <Trash2 className='w-3 h-3' strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <StepFileViewer
                  files={obsFiles}
                  pendingFiles={pendingFiles}
                  onRemoveFile={fileId => handleRemoveObsFile(obs.id, fileId)}
                  onRemovePendingFile={fileId => handleRemoveObsPendingFile(obs.id, fileId)}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Fecha estimada */}
      <div className='bg-zinc-800/60 p-2 sm:p-3 rounded-xl border border-zinc-700/50'>
        <div className='flex items-center gap-2 mb-1 sm:mb-2'>
          <Clock className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          <h5 className='text-zinc-300 font-medium text-xs sm:text-sm'>Fecha estimada de finalización</h5>
        </div>
        <input
          type='date'
          value={tracking.estimatedCompletionDate ? formatDate(tracking.estimatedCompletionDate) : ''}
          onChange={e =>
            setTracking(prev => ({
              ...prev,
              estimatedCompletionDate: e.target.value ? parseDate(e.target.value) : null,
            }))
          }
          className='w-full p-1 sm:p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/50'
        />
      </div>
    </div>
  )
}

/* ── Modal header / close button shared style ── */
const modalCloseBtn = 'p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors'

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
    const anyModalOpen = showAddForm || showEditVehicleModal || showTrackingModal
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
      if (patenteDebounce && onPatenteChange) onPatenteChange(patenteDebounce)
    }, 800)
    return () => clearTimeout(timer)
  }, [patenteDebounce, onPatenteChange])

  const _handlePatenteInputChange = (value: string) => {
    const normalizedValue = value.toUpperCase()
    setNewVehicle((prev: NewVehicleData) => ({ ...prev, plateNumber: normalizedValue }))
    setPatenteDebounce(normalizedValue)
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setPatenteDebounce('')
  }

  const isValidVehicle = (vehicle: NewVehicleData): boolean =>
    !!vehicle.plateNumber &&
    /^([A-Z]{3} \d{3}|[A-Z]{2} \d{3} [A-Z]{2})$/.test(vehicle.plateNumber) &&
    !!vehicle.clientName.trim()

  return (
    <>
      {/* ── Add Vehicle Modal ── */}
      <Portal>
        <AnimatePresence>
          {showAddForm && (
            <div
              className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4 pt-16 pb-8 sm:pt-4 sm:pb-4'
              onClick={e => { if (e.target === e.currentTarget) handleCloseAddForm() }}
            >
              <div className='absolute inset-0 bg-black/75 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[75vh] sm:max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                {/* Top accent */}
                <div className='h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 -mt-3 sm:-mt-6 mb-4 rounded-t-2xl' />

                <div className='flex justify-between items-center mb-3 sm:mb-4'>
                  <div>
                    <h3 className='text-base sm:text-lg font-bold text-white flex items-center gap-2'>
                      <Car className='w-4 h-4 text-amber-400' strokeWidth={2} />
                      Crear Nuevo Vehículo
                    </h3>
                    <p className='text-zinc-500 text-xs sm:text-sm mt-0.5'>
                      Ingresa los datos del nuevo vehículo al sistema
                    </p>
                  </div>
                  <button onClick={handleCloseAddForm} className={modalCloseBtn}>
                    <X className='w-5 h-5' strokeWidth={2} />
                  </button>
                </div>

                {datosHistorialCargados && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-3 sm:mb-4 p-2 sm:p-3 bg-emerald-900/20 border border-emerald-500/25 rounded-xl'
                  >
                    <div className='flex items-center gap-2 text-emerald-300'>
                      <CheckCircle2 className='w-4 h-4 shrink-0' strokeWidth={2} />
                      <span className='font-medium text-xs sm:text-sm'>Datos cargados del historial</span>
                    </div>
                    <p className='text-emerald-400 text-xs mt-1'>
                      Se han precargado los datos del cliente de servicios anteriores. Verifica y ajusta según sea necesario.
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
                  <div className='mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 border border-red-500/25 rounded-xl'>
                    <div className='flex items-center gap-2'>
                      <AlertTriangle className='text-red-400 w-4 h-4 shrink-0' strokeWidth={2} />
                      <p className='text-red-300 text-xs sm:text-sm font-medium'>{addVehicleError}</p>
                    </div>
                  </div>
                )}

                <div className='flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-4 sm:mt-5 border-t border-zinc-800'>
                  <button
                    onClick={handleCloseAddForm}
                    className='flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors font-medium text-sm'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={!isValidVehicle(newVehicle) || isAddingVehicle}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 ${
                      !isValidVehicle(newVehicle) || isAddingVehicle ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAddingVehicle ? (
                      <>
                        <div className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                        <span className='text-xs sm:text-sm'>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Car className='w-4 h-4' strokeWidth={2} />
                        Crear Vehículo
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      {/* ── Edit Vehicle Modal ── */}
      <Portal>
        <AnimatePresence>
          {showEditVehicleModal && editVehicle && (
            <div
              className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4'
              onClick={() => setShowEditVehicleModal(false)}
            >
              <div className='absolute inset-0 bg-black/75 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[75vh] sm:max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                <div className='h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 -mt-3 sm:-mt-6 mb-4 rounded-t-2xl' />

                <div className='flex justify-between items-center mb-3 sm:mb-4'>
                  <div>
                    <h3 className='text-base sm:text-lg font-bold text-white'>
                      Editar Datos del Vehículo
                    </h3>
                    <p className='text-zinc-500 text-xs sm:text-sm mt-0.5'>
                      Modificar información básica del vehículo
                    </p>
                  </div>
                  <button onClick={() => setShowEditVehicleModal(false)} className={modalCloseBtn}>
                    <X className='w-5 h-5' strokeWidth={2} />
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

                <div className='mt-4'>
                  <VehiclePhotoUpload
                    fotoUrl={editVehicle.fotoVehiculo}
                    onChange={url => setEditVehicle(prev => prev ? ({ ...prev, fotoVehiculo: url }) : prev)}
                    plateNumber={editVehicle.plateNumber}
                  />
                </div>

                <div className='flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-4 sm:mt-5 border-t border-zinc-800'>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className='flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors font-medium text-sm'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveVehicleEdit}
                    disabled={isEditingVehicle}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 ${
                      isEditingVehicle ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingVehicle ? (
                      <>
                        <div className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                        <span className='text-xs sm:text-sm'>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4' strokeWidth={2} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      {/* ── Tracking Modal ── */}
      <Portal>
        <AnimatePresence>
          {showTrackingModal && editTracking && (
            <div className='fixed z-[99999] inset-0 flex items-center justify-center p-2 sm:p-4'>
              <div className='absolute inset-0 bg-black/75 backdrop-blur-sm' />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='relative bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 sm:p-6 w-full shadow-2xl max-w-sm sm:max-w-lg max-h-[95vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
              >
                <div className='h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 -mt-3 sm:-mt-6 mb-4 rounded-t-2xl' />

                <div className='flex justify-between items-center mb-4 sm:mb-5'>
                  <div>
                    <h3 className='text-base sm:text-lg font-bold text-white'>
                      Actualizar Seguimiento
                    </h3>
                    <p className='text-zinc-500 text-xs sm:text-sm mt-0.5'>
                      {editTracking.plateNumber} · {editTracking.brand} {editTracking.model}
                    </p>
                  </div>
                  <button onClick={() => setShowTrackingModal(false)} className={modalCloseBtn}>
                    <X className='w-5 h-5' strokeWidth={2} />
                  </button>
                </div>

                <TrackingForm
                  tracking={editTracking}
                  setTracking={setEditTracking as VehicleSetter<VehicleInTracking>}
                />

                <div className='flex gap-2 sm:gap-3 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-zinc-800'>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className='flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors font-medium text-sm'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTrackingEdit}
                    disabled={isEditingTracking}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 ${
                      isEditingTracking ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isEditingTracking ? (
                      <>
                        <div className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                        <span className='text-xs sm:text-sm'>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4' strokeWidth={2} />
                        Guardar
                      </>
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
