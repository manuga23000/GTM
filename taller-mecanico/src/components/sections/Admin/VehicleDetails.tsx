import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  doc,
  getFirestore,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { app } from '@/lib/firebase'
import FluidConfig from './FluidConfig'
import {
  X,
  Pencil,
  ClipboardList,
  Droplets,
  Trash2,
  CheckCircle2,
  Paperclip,
  Camera,
  Video,
  FileText,
  ArrowRight,
  Clock,
  Wrench,
  Folder,
  User,
  Phone,
  Car,
  Hash,
  Gauge,
  CalendarDays,
} from 'lucide-react'

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
interface VehicleStep {
  id: string
  title: string
  status: 'completed'
  date: Date
  notes?: string
  files?: StepFile[]
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
  status:
    | 'received'
    | 'in-diagnosis'
    | 'in-repair'
    | 'completed'
    | 'delivered'
    | 'finalized'
  km?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
  timelineActive?: boolean
  serviceCount?: number
  finalizedAt?: Date
  serviceNumber?: number
  originalEntryDate?: Date
  fluidLevels?: {
    aceite: number
    agua: number
    frenos: number
  }
}

interface VehicleDetailsProps {
  vehicle: VehicleInTracking
  onClose: () => void
  onEditVehicle: () => void
  onEditTracking: () => void
  onDeleteVehicle: () => void
  onVehicleFinalized: () => Promise<void>
  onVehicleUpdated?: () => Promise<void>
}

const StepFileDisplay = ({ files }: { files: StepFile[] }) => {
  if (!files || files.length === 0) return null

  const totalFiles = files.length
  const imageCount = files.filter(f => f.type === 'image').length
  const videoCount = totalFiles - imageCount

  const openFileViewer = () => {
    const modal = document.createElement('div')
    modal.className =
      'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[99999] p-4'
    modal.onclick = e => {
      if (e.target === modal) document.body.removeChild(modal)
    }

    const container = document.createElement('div')
    container.className =
      'relative w-full h-full max-w-4xl max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden flex flex-col border border-zinc-700'

    const header = document.createElement('div')
    header.className =
      'bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800'

    const title = document.createElement('h3')
    title.className = 'text-white font-semibold text-base'
    title.textContent = `Archivos (${totalFiles})`

    const closeButton = document.createElement('button')
    closeButton.className = 'text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors'
    closeButton.textContent = '✕'
    closeButton.onclick = () => document.body.removeChild(modal)

    header.appendChild(title)
    header.appendChild(closeButton)

    const content = document.createElement('div')
    content.className =
      'flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'

    files.forEach(file => {
      const fileElement = document.createElement('div')
      fileElement.className =
        'bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-amber-500/50 transition-colors cursor-pointer'

      const preview = document.createElement('div')
      preview.className =
        'relative pt-[100%] bg-zinc-700 flex items-center justify-center'

      if (file.type === 'image') {
        const img = document.createElement('img')
        img.src = file.thumbnailUrl || file.url
        img.className = 'absolute inset-0 w-full h-full object-cover'
        img.alt = file.fileName
        preview.appendChild(img)
      } else {
        const videoIcon = document.createElement('div')
        videoIcon.className = 'absolute inset-0 flex items-center justify-center text-3xl text-zinc-400'
        videoIcon.innerHTML = '▶'
        preview.appendChild(videoIcon)
      }

      const info = document.createElement('div')
      info.className = 'p-2 text-xs text-zinc-400 truncate'
      info.title = file.fileName
      info.textContent = file.fileName

      fileElement.appendChild(preview)
      fileElement.appendChild(info)

      fileElement.onclick = e => {
        e.stopPropagation()
        const fileViewer = document.createElement('div')
        fileViewer.className =
          'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100000] p-4'

        const closeBtn = document.createElement('button')
        closeBtn.className =
          'absolute top-4 right-4 text-white z-10 bg-zinc-800 rounded-xl w-9 h-9 flex items-center justify-center hover:bg-zinc-700 transition-colors border border-zinc-700'
        closeBtn.textContent = '✕'
        closeBtn.onclick = () => document.body.removeChild(fileViewer)

        const viewerContent = document.createElement('div')
        viewerContent.className =
          'relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center'

        if (file.type === 'image') {
          const img = document.createElement('img')
          img.src = file.url
          img.className = 'max-w-full max-h-full object-contain rounded-xl'
          img.alt = file.fileName
          viewerContent.appendChild(img)
        } else {
          const video = document.createElement('video')
          video.src = file.url
          video.controls = true
          video.className = 'max-w-full max-h-full rounded-xl'
          video.autoplay = true
          viewerContent.appendChild(video)
        }

        fileViewer.appendChild(closeBtn)
        fileViewer.appendChild(viewerContent)

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            document.body.removeChild(fileViewer)
            document.removeEventListener('keydown', handleKeyDown)
          }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.body.appendChild(fileViewer)
      }

      content.appendChild(fileElement)
    })

    const footer = document.createElement('div')
    footer.className =
      'bg-zinc-900 p-3 border-t border-zinc-800 text-xs text-zinc-500 text-center'
    footer.textContent = `${totalFiles} archivos (${imageCount} imagen${
      imageCount !== 1 ? 'es' : ''
    }${videoCount > 0 ? `, ${videoCount} video${videoCount !== 1 ? 's' : ''}` : ''})`

    container.appendChild(header)
    container.appendChild(content)
    container.appendChild(footer)
    modal.appendChild(container)
    document.body.appendChild(modal)
  }

  return (
    <div className='mt-2'>
      <button
        onClick={openFileViewer}
        className='flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg text-xs font-medium transition-colors'
      >
        <Folder className='w-3.5 h-3.5' strokeWidth={2} />
        Ver archivos ({totalFiles})
      </button>
    </div>
  )
}

export default function VehicleDetails({
  vehicle,
  onClose,
  onEditVehicle,
  onEditTracking,
  onDeleteVehicle,
  onVehicleFinalized,
  onVehicleUpdated,
}: VehicleDetailsProps) {
  const [showFluidConfig, setShowFluidConfig] = useState(false)
  const [localVehicle, setLocalVehicle] = useState(vehicle)

  useEffect(() => {
    setLocalVehicle(vehicle)
  }, [vehicle])

  const totalSteps = localVehicle.steps.length

  const totalFiles = localVehicle.steps.reduce((acc, step) => acc + (step.files?.length || 0), 0)
  const totalImages = localVehicle.steps.reduce((acc, step) => acc + (step.files?.filter(f => f.type === 'image').length || 0), 0)
  const totalVideos = localVehicle.steps.reduce((acc, step) => acc + (step.files?.filter(f => f.type === 'video').length || 0), 0)

  const handleSaveFluidLevels = async (levels: { aceite: number; agua: number; frenos: number }) => {
    try {
      const { updateVehicle } = await import('@/actions/vehicle')
      const result = await updateVehicle(vehicle.plateNumber, { fluidLevels: levels })
      if (result.success) {
        setLocalVehicle(prev => ({ ...prev, fluidLevels: levels }))
        if (onVehicleUpdated) await onVehicleUpdated()
      } else {
        throw new Error(result.message || 'Error al guardar')
      }
    } catch (error) {
      console.error('❌ Error guardando niveles:', error)
      throw error
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl'
    >
      {/* Top accent bar */}
      <div className='h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-transparent' />

      <div className='p-4 sm:p-6'>
        {/* ── Header ── */}
        <div className='flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-5'>
          <div className='flex-1 w-full sm:w-auto'>
            <div className='flex justify-between items-start sm:block'>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <Car className='w-4 h-4 text-amber-400 shrink-0' strokeWidth={2} />
                  <h3 className='text-lg sm:text-xl font-extrabold text-white tracking-wide'>
                    {localVehicle.plateNumber}
                    <span className='text-zinc-400 font-normal text-sm ml-2'>
                      {localVehicle.brand} {localVehicle.model}
                    </span>
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className='text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors sm:hidden'
                title='Cerrar'
              >
                <X className='w-4 h-4' strokeWidth={2} />
              </button>
            </div>

            {/* Info grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm mt-3'>
              {[
                { icon: User,        label: 'Cliente',  value: localVehicle.clientName                  },
                { icon: Phone,       label: 'Teléfono', value: localVehicle.clientPhone || 'No registrado' },
                { icon: Wrench,      label: 'Servicio', value: localVehicle.serviceType || 'No especificado' },
                { icon: CalendarDays,label: 'Año',      value: String(localVehicle.year || '—')          },
                { icon: Hash,        label: 'Chasis',   value: localVehicle.chassisNumber || 'No registrado' },
                { icon: Gauge,       label: 'KM',       value: `${localVehicle.km?.toLocaleString() || '0'} km` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className='bg-zinc-800/60 border border-zinc-700/50 p-2.5 rounded-xl'>
                  <div className='flex items-center gap-1.5 mb-1'>
                    <Icon className='w-3 h-3 text-zinc-500' strokeWidth={2} />
                    <span className='text-zinc-500 text-xs'>{label}</span>
                  </div>
                  <span className='text-white font-medium text-xs sm:text-sm'>{value}</span>
                </div>
              ))}
            </div>

            {/* Dates */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs sm:text-sm'>
              <div className='bg-amber-500/8 border border-amber-500/20 p-2.5 rounded-xl'>
                <div className='flex items-center gap-1.5 mb-1'>
                  <CalendarDays className='w-3 h-3 text-amber-400' strokeWidth={2} />
                  <span className='text-amber-400/80 text-xs'>Fecha de Ingreso</span>
                </div>
                <span className='text-white font-medium'>{localVehicle.entryDate.toLocaleDateString('es-AR')}</span>
              </div>
              <div className='bg-zinc-800/60 border border-zinc-700/50 p-2.5 rounded-xl'>
                <div className='flex items-center gap-1.5 mb-1'>
                  <Clock className='w-3 h-3 text-zinc-400' strokeWidth={2} />
                  <span className='text-zinc-400 text-xs'>Entrega Estimada</span>
                </div>
                <span className='text-white font-medium'>
                  {localVehicle.estimatedCompletionDate
                    ? localVehicle.estimatedCompletionDate.toLocaleDateString('es-AR')
                    : 'No definida'}
                </span>
              </div>
            </div>

            {/* Files summary */}
            {totalFiles > 0 && (
              <div className='bg-zinc-800/40 border border-zinc-700/50 p-2.5 rounded-xl mt-2 flex items-center gap-4 text-xs flex-wrap'>
                <div className='flex items-center gap-1.5'>
                  <Paperclip className='w-3 h-3 text-zinc-400' strokeWidth={2} />
                  <span className='text-white'>{totalFiles} archivo{totalFiles !== 1 ? 's' : ''}</span>
                </div>
                {totalImages > 0 && (
                  <div className='flex items-center gap-1.5'>
                    <Camera className='w-3 h-3 text-emerald-400' strokeWidth={2} />
                    <span className='text-zinc-300'>{totalImages} imagen{totalImages !== 1 ? 'es' : ''}</span>
                  </div>
                )}
                {totalVideos > 0 && (
                  <div className='flex items-center gap-1.5'>
                    <Video className='w-3 h-3 text-purple-400' strokeWidth={2} />
                    <span className='text-zinc-300'>{totalVideos} video{totalVideos !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className='flex flex-row sm:flex-col gap-2 w-full sm:w-auto'>
            <button
              onClick={onClose}
              className='hidden sm:flex items-center justify-center p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors self-end'
              title='Cerrar'
            >
              <X className='w-4 h-4' strokeWidth={2} />
            </button>

            <div className='flex flex-col gap-2 w-full sm:w-auto'>
              <button
                onClick={onEditVehicle}
                className='flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap border border-amber-400/30 shadow-sm shadow-amber-900/20'
              >
                <Pencil className='w-3.5 h-3.5' strokeWidth={2.2} />
                Datos
              </button>
              <button
                onClick={onEditTracking}
                className='flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap border border-zinc-600'
              >
                <ClipboardList className='w-3.5 h-3.5' strokeWidth={2} />
                Seguimiento
              </button>
              <button
                onClick={() => setShowFluidConfig(!showFluidConfig)}
                className='flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-purple-600/70 hover:bg-purple-500 text-white font-medium rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap border border-purple-500/30'
              >
                <Droplets className='w-3.5 h-3.5' strokeWidth={2} />
                Fluidos
              </button>
              <button
                onClick={onDeleteVehicle}
                className='flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-red-600/70 hover:bg-red-500 text-white font-medium rounded-xl text-xs sm:text-sm transition-all border border-red-500/30'
              >
                <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                Eliminar
              </button>
              <button
                onClick={async () => {
                  if (confirm(`¿Estás seguro de finalizar el servicio para ${vehicle.plateNumber}?`)) {
                    try {
                      const db = getFirestore(app)
                      const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicle.id))
                      if (!vehicleDoc.exists()) throw new Error('Vehículo no encontrado en Firestore')
                      const freshVehicleData = vehicleDoc.data()
                      const vehicleWithFreshSteps = { ...vehicle, steps: freshVehicleData.steps || [] }
                      const patenteNormalizada = vehicle.plateNumber.toUpperCase().trim()
                      const patenteSinEspacios = patenteNormalizada.replace(/\s+/g, '')
                      const queries = [
                        query(collection(db, 'timeline'), where('plateNumber', '==', patenteNormalizada)),
                        query(collection(db, 'timeline'), where('plateNumber', '==', patenteSinEspacios)),
                      ]
                      const queryResults = await Promise.all(queries.map(q => getDocs(q)))
                      const allDocs: QueryDocumentSnapshot<DocumentData>[] = []
                      for (const querySnapshot of queryResults) {
                        querySnapshot.forEach(doc => {
                          if (!allDocs.some(existingDoc => existingDoc.id === doc.id)) allDocs.push(doc)
                        })
                      }
                      const serviceCount = allDocs.length + 1
                      const timelineDocId = `${vehicle.plateNumber}_servicio_${serviceCount}`
                      interface VehicleTimelineData extends Omit<VehicleInTracking, 'fluidLevels'> {
                        finalizedAt: Date
                        serviceNumber: number
                        fluidLevels?: { aceite: number; agua: number; frenos: number }
                      }
                      const { fluidLevels, ...vehicleWithoutFluidLevels } = vehicleWithFreshSteps
                      const vehicleData: VehicleTimelineData = {
                        ...vehicleWithoutFluidLevels,
                        finalizedAt: new Date(),
                        serviceNumber: serviceCount,
                      }
                      if (fluidLevels !== undefined) vehicleData.fluidLevels = fluidLevels
                      await setDoc(doc(db, 'timeline', timelineDocId), vehicleData)
                      await deleteDoc(doc(db, 'vehicles', vehicle.id))
                      alert(`Servicio finalizado correctamente. Número de servicio: ${serviceCount}`)
                      await onVehicleFinalized()
                    } catch (error) {
                      console.error('Error finalizando servicio:', error)
                      alert('Error al finalizar el servicio')
                    }
                  }
                }}
                className='flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600/70 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs sm:text-sm transition-all border border-emerald-500/30'
              >
                <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2} />
                Finalizar
              </button>
            </div>
          </div>
        </div>

        {/* Fluid config */}
        <AnimatePresence>
          {showFluidConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='mb-5'
            >
              <FluidConfig
                plateNumber={localVehicle.plateNumber}
                initialLevels={localVehicle.fluidLevels || { aceite: 100, agua: 100, frenos: 100 }}
                isFirstTime={!localVehicle.fluidLevels}
                onSave={handleSaveFluidLevels}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Works section ── */}
        <div className='border-t border-zinc-800 pt-4 sm:pt-5'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center'>
                <Wrench className='w-3.5 h-3.5 text-zinc-400' strokeWidth={2} />
              </div>
              <h4 className='text-sm sm:text-base font-bold text-white'>Trabajos Realizados</h4>
            </div>
            {totalSteps > 0 && (
              <span className='text-xs text-zinc-500'>{totalSteps} trabajo{totalSteps !== 1 ? 's' : ''} registrado{totalSteps !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Steps list */}
            <div className='bg-zinc-800/40 border border-zinc-700/50 p-3 sm:p-4 rounded-xl'>
              <h5 className='text-zinc-300 font-semibold mb-3 flex items-center gap-2 text-xs sm:text-sm'>
                <Wrench className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
                Lista de Trabajos
              </h5>

              {localVehicle.steps.length === 0 ? (
                <div className='text-center py-8 bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-700/50'>
                  <ClipboardList className='w-7 h-7 text-zinc-700 mx-auto mb-2' strokeWidth={1.5} />
                  <p className='text-zinc-500 text-xs sm:text-sm'>No hay trabajos registrados</p>
                  <p className='text-zinc-600 text-xs mt-1'>Usá &apos;Seguimiento&apos; para agregar trabajos</p>
                </div>
              ) : (
                <div className='space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1'>
                  {localVehicle.steps
                    .sort((a, b) => {
                      const dateA = a.date instanceof Date ? a.date : new Date()
                      const dateB = b.date instanceof Date ? b.date : new Date()
                      return dateA.getTime() - dateB.getTime()
                    })
                    .map((step, index) => {
                      const stepFiles = step.files || []
                      const stepDate = step.date instanceof Date ? step.date : new Date()
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className='bg-zinc-900/60 border border-zinc-700/60 p-2.5 sm:p-3 rounded-xl'
                        >
                          <div className='flex items-start justify-between mb-1'>
                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                              <CheckCircle2 className='w-3.5 h-3.5 text-emerald-400 shrink-0' strokeWidth={2} />
                              <h6 className='text-white font-medium text-xs sm:text-sm truncate'>{step.title}</h6>
                            </div>
                            <div className='flex items-center gap-2 ml-2 shrink-0'>
                              {stepFiles.length > 0 && (
                                <div className='flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded-lg'>
                                  <Paperclip className='w-3 h-3 text-amber-400' strokeWidth={2} />
                                  <span className='text-white text-xs'>{stepFiles.length}</span>
                                  {stepFiles.some(f => f.type === 'image') && <Camera className='w-3 h-3 text-emerald-400' strokeWidth={2} />}
                                  {stepFiles.some(f => f.type === 'video') && <Video className='w-3 h-3 text-purple-400' strokeWidth={2} />}
                                </div>
                              )}
                              <span className='text-zinc-500 text-xs'>{stepDate.toLocaleDateString('es-AR')}</span>
                            </div>
                          </div>
                          <div className='mt-1.5'>
                            <StepFileDisplay files={stepFiles} />
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className='space-y-3'>
              {/* Estimated date */}
              <div className='bg-zinc-800/40 border border-zinc-700/50 p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center gap-2 mb-2'>
                  <Clock className='w-3.5 h-3.5 text-zinc-400' strokeWidth={2} />
                  <h5 className='text-zinc-400 font-medium text-xs'>Fecha Estimada de Finalización</h5>
                </div>
                <div className='text-white font-semibold text-xs sm:text-sm'>
                  {localVehicle.estimatedCompletionDate
                    ? localVehicle.estimatedCompletionDate.toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : <span className='text-zinc-600 italic font-normal'>No definida</span>}
                </div>
              </div>

              {/* Next step */}
              <div className='bg-amber-500/8 border border-amber-500/20 p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center gap-2 mb-2'>
                  <ArrowRight className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
                  <h5 className='text-amber-400/90 font-semibold text-xs'>Próximo paso</h5>
                </div>
                <div className='text-white font-medium text-xs sm:text-sm min-h-[1.5em]'>
                  {localVehicle.nextStep && localVehicle.nextStep.trim()
                    ? localVehicle.nextStep
                    : <span className='text-zinc-600 italic font-normal'>No definido</span>}
                </div>
              </div>

              {/* Works count */}
              <div className='bg-emerald-900/20 border border-emerald-500/25 p-3 sm:p-4 rounded-xl text-center'>
                <div className='text-emerald-300 font-extrabold text-2xl sm:text-3xl'>{totalSteps}</div>
                <div className='text-emerald-400/70 text-xs mt-0.5'>
                  Trabajo{totalSteps !== 1 ? 's' : ''} Realizado{totalSteps !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {localVehicle.notes && localVehicle.notes.trim() && (
            <div className='mt-4 p-3 sm:p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl'>
              <div className='flex items-center gap-2 mb-2'>
                <FileText className='w-3.5 h-3.5 text-zinc-400' strokeWidth={2} />
                <h5 className='text-zinc-400 font-medium text-xs'>Notas Adicionales</h5>
              </div>
              <div className='text-zinc-300 text-xs sm:text-sm whitespace-pre-wrap'>{localVehicle.notes}</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
