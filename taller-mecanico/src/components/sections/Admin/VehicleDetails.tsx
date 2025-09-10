import { motion } from 'framer-motion'
import Image from 'next/image'
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
}

interface VehicleDetailsProps {
  vehicle: VehicleInTracking
  onClose: () => void
  onEditVehicle: () => void
  onEditTracking: () => void
  onDeleteVehicle: () => void
  onVehicleFinalized: () => Promise<void>
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
      'relative w-full h-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col'

    const header = document.createElement('div')
    header.className =
      'bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700'

    const title = document.createElement('h3')
    title.className = 'text-white font-medium text-lg'
    title.textContent = `Archivos (${totalFiles})`

    const closeButton = document.createElement('button')
    closeButton.className = 'text-white hover:text-gray-300 p-2'
    closeButton.innerHTML = '✕'
    closeButton.onclick = () => document.body.removeChild(modal)

    header.appendChild(title)
    header.appendChild(closeButton)

    const content = document.createElement('div')
    content.className =
      'flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'

    files.forEach(file => {
      const fileElement = document.createElement('div')
      fileElement.className =
        'bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer'

      const preview = document.createElement('div')
      preview.className =
        'relative pt-[100%] bg-gray-700 flex items-center justify-center'

      if (file.type === 'image') {
        const img = document.createElement('img')
        img.src = file.thumbnailUrl || file.url
        img.className = 'absolute inset-0 w-full h-full object-cover'
        img.alt = file.fileName
        preview.appendChild(img)
      } else {
        const videoIcon = document.createElement('div')
        videoIcon.className = 'text-4xl text-gray-400'
        videoIcon.innerHTML = '▶️'
        preview.appendChild(videoIcon)
      }

      const info = document.createElement('div')
      info.className = 'p-2 text-xs text-gray-300 truncate'
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
          'absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75'
        closeBtn.innerHTML = '✕'
        closeBtn.onclick = () => document.body.removeChild(fileViewer)

        const viewerContent = document.createElement('div')
        viewerContent.className =
          'relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center'

        if (file.type === 'image') {
          const img = document.createElement('img')
          img.src = file.url
          img.className = 'max-w-full max-h-full object-contain'
          img.alt = file.fileName
          viewerContent.appendChild(img)
        } else {
          const video = document.createElement('video')
          video.src = file.url
          video.controls = true
          video.className = 'max-w-full max-h-full'
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
      'bg-gray-800 p-3 border-t border-gray-700 text-sm text-gray-400 text-center'
    footer.textContent = `${totalFiles} archivos (${imageCount} imagen${
      imageCount !== 1 ? 'es' : ''
    }${
      videoCount > 0
        ? `, ${videoCount} video${videoCount !== 1 ? 's' : ''}`
        : ''
    })`

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
        className='px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
      >
        <span>📁</span>
        <span>Ver archivos ({totalFiles})</span>
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
}: VehicleDetailsProps) {
  const totalSteps = vehicle.steps.length

  const totalFiles = vehicle.steps.reduce((acc, step) => {
    return acc + (step.files?.length || 0)
  }, 0)

  const totalImages = vehicle.steps.reduce((acc, step) => {
    return acc + (step.files?.filter(f => f.type === 'image').length || 0)
  }, 0)

  const totalVideos = vehicle.steps.reduce((acc, step) => {
    return acc + (step.files?.filter(f => f.type === 'video').length || 0)
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-gray-800 rounded-xl p-3 sm:p-6'
    >
      <div className='flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6'>
        <div className='flex-1 w-full sm:w-auto'>
          <div className='flex justify-between items-start sm:block'>
            <h3 className='text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-3'>
              {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-xl p-1 sm:hidden'
              title='Cerrar'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4'>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>Cliente:</span>
              <span className='text-white font-medium'>
                {vehicle.clientName}
              </span>
            </div>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>Teléfono:</span>
              <span className='text-white font-medium'>
                {vehicle.clientPhone || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>Servicio:</span>
              <span className='text-white font-medium'>
                {vehicle.serviceType || 'No especificado'}
              </span>
            </div>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>Año:</span>
              <span className='text-white font-medium'>{vehicle.year}</span>
            </div>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>Chasis:</span>
              <span className='text-white font-medium'>
                {vehicle.chassisNumber || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-2 sm:p-3 rounded-lg'>
              <span className='text-gray-400 block'>KM:</span>
              <span className='text-white font-medium'>
                {vehicle.km?.toLocaleString() || '0'}KM
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4'>
            <div className='bg-blue-900/30 p-2 sm:p-3 rounded-lg border border-blue-500/30'>
              <span className='text-blue-300 block'>Fecha de Ingreso:</span>
              <span className='text-white font-medium'>
                {vehicle.entryDate.toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className='bg-purple-900/30 p-2 sm:p-3 rounded-lg border border-purple-500/30'>
              <span className='text-purple-300 block'>Entrega Estimada:</span>
              <span className='text-white font-medium'>
                {vehicle.estimatedCompletionDate
                  ? vehicle.estimatedCompletionDate.toLocaleDateString('es-AR')
                  : 'No definida'}
              </span>
            </div>
          </div>

          {totalFiles > 0 && (
            <div className='bg-gray-700/50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4'>
              <div className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap'>
                <div className='flex items-center gap-1'>
                  <span className='text-blue-400'>📎</span>
                  <span className='text-white'>
                    {totalFiles} archivo{totalFiles !== 1 ? 's' : ''}
                  </span>
                </div>
                {totalImages > 0 && (
                  <div className='flex items-center gap-1'>
                    <span className='text-green-400'>📷</span>
                    <span className='text-white'>
                      {totalImages} imagen{totalImages !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
                {totalVideos > 0 && (
                  <div className='flex items-center gap-1'>
                    <span className='text-purple-400'>🎥</span>
                    <span className='text-white'>
                      {totalVideos} video{totalVideos !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-row sm:flex-col gap-2 w-full sm:w-auto'>
          <button
            onClick={onClose}
            className='hidden sm:block text-gray-400 hover:text-white text-xl p-1 self-end'
            title='Cerrar'
          >
            ✕
          </button>

          <div className='flex flex-col sm:flex-col gap-2 w-full sm:w-auto'>
            <button
              onClick={onEditVehicle}
              className='px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap'
            >
              ✎ Datos del Vehículo
            </button>
            <button
              onClick={onEditTracking}
              className='px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap'
            >
              📋 Seguimiento
            </button>
            <button
              onClick={onDeleteVehicle}
              className='px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors'
            >
              🗑️ Eliminar
            </button>
            <button
              onClick={async () => {
                if (
                  confirm(
                    `¿Estás seguro de finalizar el servicio para ${vehicle.plateNumber}?`
                  )
                ) {
                  try {
                    const db = getFirestore(app)

                    const vehicleDoc = await getDoc(
                      doc(db, 'vehicles', vehicle.id)
                    )

                    if (!vehicleDoc.exists()) {
                      throw new Error('Vehículo no encontrado en Firestore')
                    }

                    const freshVehicleData = vehicleDoc.data()

                    const vehicleWithFreshSteps = {
                      ...vehicle,
                      steps: freshVehicleData.steps || [],
                    }

                    const patenteNormalizada = vehicle.plateNumber
                      .toUpperCase()
                      .trim()
                    const patenteSinEspacios = patenteNormalizada.replace(
                      /\s+/g,
                      ''
                    )

                    const queries = [
                      query(
                        collection(db, 'timeline'),
                        where('plateNumber', '==', patenteNormalizada)
                      ),
                      query(
                        collection(db, 'timeline'),
                        where('plateNumber', '==', patenteSinEspacios)
                      ),
                    ]

                    const queryResults = await Promise.all(
                      queries.map(q => getDocs(q))
                    )

                    const allDocs: QueryDocumentSnapshot<DocumentData>[] = []
                    for (const querySnapshot of queryResults) {
                      querySnapshot.forEach(doc => {
                        if (
                          !allDocs.some(
                            existingDoc => existingDoc.id === doc.id
                          )
                        ) {
                          allDocs.push(doc)
                        }
                      })
                    }

                    const serviceCount = allDocs.length + 1

                    const timelineDocId = `${vehicle.plateNumber}_servicio_${serviceCount}`

                    const vehicleData = {
                      ...vehicleWithFreshSteps,
                      finalizedAt: new Date(),
                      serviceNumber: serviceCount,
                    }

                    await setDoc(
                      doc(db, 'timeline', timelineDocId),
                      vehicleData
                    )

                    await deleteDoc(doc(db, 'vehicles', vehicle.id))

                    alert(
                      `Servicio finalizado correctamente. Número de servicio: ${serviceCount}`
                    )

                    await onVehicleFinalized()
                  } catch (error) {
                    console.error('Error finalizando servicio:', error)
                    alert('Error al finalizar el servicio')
                  }
                }
              }}
              className='px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors'
            >
              ✅ Finalizar Servicio
            </button>
          </div>
        </div>
      </div>

      <div className='border-t border-gray-700 pt-4 sm:pt-6'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2'>
          <h4 className='text-base sm:text-lg font-semibold text-white'>
            Trabajos Realizados
          </h4>
          {totalSteps > 0 && (
            <div className='text-xs sm:text-sm text-gray-400'>
              {totalSteps} trabajo{totalSteps !== 1 ? 's' : ''} registrado
              {totalSteps !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          <div className='bg-gray-700/50 p-3 sm:p-4 rounded-lg'>
            <h5 className='text-white font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base'>
              🔧 Lista de Trabajos
            </h5>

            {vehicle.steps.length === 0 ? (
              <div className='text-center py-6 sm:py-8 bg-gray-800 rounded border-2 border-dashed border-gray-600'>
                <p className='text-gray-400 mb-2'>📋</p>
                <p className='text-gray-400 text-xs sm:text-sm'>
                  No hay trabajos registrados
                </p>
                <p className='text-gray-500 text-xs mt-1'>
                  Usa &apos;Seguimiento&apos; para agregar trabajos
                </p>
              </div>
            ) : (
              <div className='space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto'>
                {vehicle.steps
                  .sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : new Date()
                    const dateB = b.date instanceof Date ? b.date : new Date()
                    return dateA.getTime() - dateB.getTime()
                  })
                  .map((step, index) => {
                    const stepFiles = step.files || []
                    const stepDate =
                      step.date instanceof Date ? step.date : new Date()

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='bg-gray-800 p-2 sm:p-3 rounded border border-gray-600'
                      >
                        <div className='flex items-start justify-between mb-1 sm:mb-2'>
                          <div className='flex items-center gap-1 sm:gap-2 flex-1 min-w-0'>
                            <span className='text-sm sm:text-lg'>✅</span>
                            <div className='flex-1 min-w-0'>
                              <h6 className='text-white font-medium text-xs sm:text-sm truncate'>
                                {step.title}
                              </h6>
                            </div>
                          </div>
                          <div className='flex items-center gap-1 sm:gap-2 ml-2'>
                            {stepFiles.length > 0 && (
                              <div className='flex items-center gap-1 text-xs'>
                                <div className='flex items-center gap-1 bg-gray-700 px-1 sm:px-2 py-1 rounded'>
                                  <span className='text-blue-400'>📎</span>
                                  <span className='text-white'>
                                    {stepFiles.length}
                                  </span>
                                  {stepFiles.some(f => f.type === 'image') && (
                                    <span className='text-green-400'>📷</span>
                                  )}
                                  {stepFiles.some(f => f.type === 'video') && (
                                    <span className='text-purple-400'>🎥</span>
                                  )}
                                </div>
                              </div>
                            )}
                            <span className='text-gray-400 text-xs'>
                              {stepDate.toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>

                        <div className='mt-2'>
                          <StepFileDisplay files={stepFiles} />
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            )}
          </div>

          <div className='space-y-3 sm:space-y-4'>
            <div className='bg-purple-900/30 p-3 sm:p-4 rounded-lg border border-purple-500/30'>
              <h5 className='text-purple-300 font-medium mb-2 text-xs sm:text-sm'>
                🕒 Fecha Estimada de Finalización
              </h5>
              <div className='text-white font-medium text-xs sm:text-base'>
                {vehicle.estimatedCompletionDate
                  ? vehicle.estimatedCompletionDate.toLocaleDateString(
                      'es-AR',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'No definida'}
              </div>
            </div>

            <div className='bg-blue-100/80 p-3 sm:p-4 rounded-lg border border-blue-300/70'>
              <h5 className='text-blue-700 font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm'>
                <span>🔜</span> Próximo paso
              </h5>
              <div className='text-blue-900 font-medium text-xs sm:text-base min-h-[1.5em]'>
                {vehicle.nextStep && vehicle.nextStep.trim() ? (
                  vehicle.nextStep
                ) : (
                  <span className='text-blue-400 italic'>No definido</span>
                )}
              </div>
            </div>

            <div className='bg-green-900/30 p-3 sm:p-4 rounded border border-green-500/30 text-center'>
              <div className='text-green-300 font-bold text-xl sm:text-2xl'>
                {totalSteps}
              </div>
              <div className='text-green-200 text-xs sm:text-sm'>
                Trabajo{totalSteps !== 1 ? 's' : ''} Realizado
                {totalSteps !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {vehicle.notes && vehicle.notes.trim() && (
          <div className='mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-900/20 rounded-lg border border-blue-500/30'>
            <h5 className='text-blue-300 font-medium mb-2 text-xs sm:text-sm'>
              📄 Notas Adicionales
            </h5>
            <div className='text-blue-100 text-xs sm:text-sm whitespace-pre-wrap'>
              {vehicle.notes}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
