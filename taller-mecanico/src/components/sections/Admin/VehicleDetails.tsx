import { motion } from 'framer-motion'
import Image from 'next/image'

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

// MODIFICADO: Agregamos archivos al step
interface VehicleStep {
  id: string
  title: string
  // ✅ QUITADO: description ya no está en la interface
  status: 'completed' // Siempre completado
  date: Date
  notes?: string
  files?: StepFile[] // NUEVO: archivos del step
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

interface VehicleDetailsProps {
  vehicle: VehicleInTracking
  onClose: () => void
  onEditVehicle: () => void
  onEditTracking: () => void
  onDeleteVehicle: () => void
}

// ACTUALIZADO: Componente para mostrar archivos de un step (solo lectura con thumbnails)
const StepFileDisplay = ({ files }: { files: StepFile[] }) => {
  if (!files || files.length === 0) return null

  return (
    <div className='mt-2 flex gap-2 flex-wrap'>
      {files.map(file => (
        <div key={file.id} className='relative group'>
          {file.type === 'image' ? (
            <Image
              // OPTIMIZADO: Usar thumbnail para vista previa
              src={file.thumbnailUrl || file.url}
              alt={file.fileName}
              width={64}
              height={64}
              className='object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400 transition-colors'
              onClick={() => {
                // MEJORADO: Abrir imagen original en modal fullscreen
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[99999] cursor-pointer'
                modal.onclick = () => document.body.removeChild(modal)

                const container = document.createElement('div')
                container.className = 'relative max-w-full max-h-full p-4'

                // Loading indicator
                const loader = document.createElement('div')
                loader.className = 'text-white text-center'
                loader.innerHTML = '🔄 Cargando imagen original...'
                container.appendChild(loader)

                const img = document.createElement('img')
                img.src = file.url // IMPORTANTE: usar URL original
                img.className = 'max-w-full max-h-full object-contain'
                img.alt = file.fileName

                img.onload = () => {
                  container.removeChild(loader)
                  container.appendChild(img)
                }

                const closeButton = document.createElement('button')
                closeButton.innerHTML = '✕'
                closeButton.className =
                  'absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 hover:bg-opacity-75 flex items-center justify-center'
                closeButton.onclick = e => {
                  e.stopPropagation()
                  document.body.removeChild(modal)
                }

                const infoBar = document.createElement('div')
                infoBar.className =
                  'absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm'
                infoBar.innerHTML = `
                  <div class="font-medium">${file.fileName}</div>
                  <div class="text-xs text-gray-300 flex justify-between">
                    <span>${(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    <span>${new Date(file.uploadedAt).toLocaleDateString(
                      'es-AR'
                    )}</span>
                    ${
                      file.dimensions
                        ? `<span>${file.dimensions.width}x${file.dimensions.height}px</span>`
                        : ''
                    }
                  </div>
                `

                modal.appendChild(container)
                modal.appendChild(closeButton)
                modal.appendChild(infoBar)
                document.body.appendChild(modal)
              }}
            />
          ) : (
            <video
              src={file.url}
              className='w-16 h-16 object-cover rounded border border-gray-500 cursor-pointer hover:border-blue-400 transition-colors'
              onClick={() => {
                // Abrir video en modal fullscreen
                const modal = document.createElement('div')
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[99999]'
                modal.onclick = e => {
                  if (e.target === modal) document.body.removeChild(modal)
                }

                const container = document.createElement('div')
                container.className = 'relative max-w-full max-h-full p-4'

                const video = document.createElement('video')
                video.src = file.url
                video.controls = true
                video.className = 'max-w-full max-h-full'

                const closeButton = document.createElement('button')
                closeButton.innerHTML = '✕'
                closeButton.className =
                  'absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 hover:bg-opacity-75 flex items-center justify-center'
                closeButton.onclick = () => document.body.removeChild(modal)

                const infoBar = document.createElement('div')
                infoBar.className =
                  'absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm'
                infoBar.innerHTML = `
                  <div class="font-medium">${file.fileName}</div>
                  <div class="text-xs text-gray-300 flex justify-between">
                    <span>${(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    <span>${new Date(file.uploadedAt).toLocaleDateString(
                      'es-AR'
                    )}</span>
                  </div>
                `

                container.appendChild(video)
                modal.appendChild(container)
                modal.appendChild(closeButton)
                modal.appendChild(infoBar)
                document.body.appendChild(modal)
              }}
            />
          )}

          {/* Información del archivo en hover MEJORADA */}
          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-end'>
            <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 w-full'>
              <div className='bg-black bg-opacity-70 text-white text-xs p-1 rounded text-center'>
                <div className='truncate font-medium'>{file.fileName}</div>
                <div className='text-gray-300 flex justify-between'>
                  <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  {file.dimensions && (
                    <span>
                      {file.dimensions.width}x{file.dimensions.height}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de tipo MEJORADO */}
          <div className='absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl flex items-center gap-1'>
            {file.type === 'image' ? '📷' : '🎥'}
            {file.thumbnailUrl && file.type === 'image' && (
              <span className='text-green-400' title='Thumbnail optimizado'>
                ⚡
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function VehicleDetails({
  vehicle,
  onClose,
  onEditVehicle,
  onEditTracking,
  onDeleteVehicle,
}: VehicleDetailsProps) {
  const totalSteps = vehicle.steps.length

  // Calcular estadísticas de archivos
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
      className='bg-gray-800 rounded-xl p-6'
    >
      {/* Header con información básica */}
      <div className='flex justify-between items-start mb-6'>
        <div className='flex-1'>
          <h3 className='text-2xl font-bold text-white mb-3'>
            {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
          </h3>

          {/* Información básica del vehículo */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4'>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Cliente:</span>
              <span className='text-white font-medium'>
                {vehicle.clientName}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Teléfono:</span>
              <span className='text-white font-medium'>
                {vehicle.clientPhone || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Servicio:</span>
              <span className='text-white font-medium'>
                {vehicle.serviceType || 'No especificado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Año:</span>
              <span className='text-white font-medium'>{vehicle.year}</span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>Chasis:</span>
              <span className='text-white font-medium'>
                {vehicle.chassisNumber || 'No registrado'}
              </span>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg'>
              <span className='text-gray-400 block'>KM:</span>
              <span className='text-white font-medium'>
                ${vehicle.km?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Fechas importantes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4'>
            <div className='bg-blue-900/30 p-3 rounded-lg border border-blue-500/30'>
              <span className='text-blue-300 block'>Fecha de Ingreso:</span>
              <span className='text-white font-medium'>
                {vehicle.entryDate.toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className='bg-purple-900/30 p-3 rounded-lg border border-purple-500/30'>
              <span className='text-purple-300 block'>Entrega Estimada:</span>
              <span className='text-white font-medium'>
                {vehicle.estimatedCompletionDate
                  ? vehicle.estimatedCompletionDate.toLocaleDateString('es-AR')
                  : 'No definida'}
              </span>
            </div>
          </div>

          {/* NUEVO: Estadísticas de archivos */}
          {totalFiles > 0 && (
            <div className='bg-gray-700/50 p-3 rounded-lg mb-4'>
              <div className='flex items-center gap-4 text-sm'>
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

        {/* Botones de acción */}
        <div className='flex flex-col gap-2 ml-4'>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white text-xl p-1 self-end'
            title='Cerrar'
          >
            ✕
          </button>
          <button
            onClick={onEditVehicle}
            className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap'
          >
            ✎ Datos del Vehículo
          </button>
          <button
            onClick={onEditTracking}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap'
          >
            📋 Seguimiento
          </button>
          <button
            onClick={onDeleteVehicle}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Sección de seguimiento (solo lectura) */}
      <div className='border-t border-gray-700 pt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h4 className='text-lg font-semibold text-white'>
            Trabajos Realizados
          </h4>
          {totalSteps > 0 && (
            <div className='text-sm text-gray-400'>
              {totalSteps} trabajo{totalSteps !== 1 ? 's' : ''} registrado
              {totalSteps !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Lista de trabajos realizados (MODIFICADA para Storage) */}
          <div className='bg-gray-700/50 p-4 rounded-lg'>
            <h5 className='text-white font-medium mb-3 flex items-center'>
              🔧 Lista de Trabajos
            </h5>

            {vehicle.steps.length === 0 ? (
              <div className='text-center py-8 bg-gray-800 rounded border-2 border-dashed border-gray-600'>
                <p className='text-gray-400 mb-2'>📋</p>
                <p className='text-gray-400 text-sm'>
                  No hay trabajos registrados
                </p>
                <p className='text-gray-500 text-xs mt-1'>
                  Usa &apos;Seguimiento&apos; para agregar trabajos
                </p>
              </div>
            ) : (
              <div className='space-y-3 max-h-80 overflow-y-auto'>
                {vehicle.steps
                  .sort((a, b) => {
                    // SEGURO: Validar fechas antes de comparar
                    const dateA = a.date instanceof Date ? a.date : new Date()
                    const dateB = b.date instanceof Date ? b.date : new Date()
                    return dateA.getTime() - dateB.getTime()
                  })
                  .map((step, index) => {
                    const stepFiles = step.files || []
                    // SEGURO: Validar fecha antes de usar
                    const stepDate =
                      step.date instanceof Date ? step.date : new Date()

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='bg-gray-800 p-3 rounded border border-gray-600'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex items-center gap-2 flex-1'>
                            <span className='text-lg'>✅</span>
                            <div className='flex-1'>
                              <h6 className='text-white font-medium text-sm'>
                                {step.title}
                              </h6>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {/* ACTUALIZADO: Mostrar cantidad y tipos de archivos */}
                            {stepFiles.length > 0 && (
                              <div className='flex items-center gap-1 text-xs'>
                                <div className='flex items-center gap-1 bg-gray-700 px-2 py-1 rounded'>
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

                        {/* ✅ QUITADO: Ya no se muestra step.description */}
                        {/* <p className='text-gray-300 text-sm mt-2'>
              {step.description}
            </p> */}

                        {/* ACTUALIZADO: Mostrar archivos del step desde Storage */}
                        <StepFileDisplay files={stepFiles} />
                      </motion.div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className='space-y-4'>
            {/* Fecha estimada */}
            <div className='bg-purple-900/30 p-4 rounded-lg border border-purple-500/30'>
              <h5 className='text-purple-300 font-medium mb-2'>
                🕒 Fecha Estimada de Finalización
              </h5>
              <div className='text-white font-medium'>
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

            {/* Próximo paso */}
            <div className='bg-blue-100/80 p-4 rounded-lg border border-blue-300/70 mb-2'>
              <h5 className='text-blue-700 font-semibold mb-2 flex items-center gap-2'>
                <span>🔜</span> Próximo paso
              </h5>
              <div className='text-blue-900 font-medium text-base min-h-[1.5em]'>
                {vehicle.nextStep && vehicle.nextStep.trim() ? (
                  vehicle.nextStep
                ) : (
                  <span className='text-blue-400 italic'>No definido</span>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div className='bg-green-900/30 p-4 rounded border border-green-500/30 text-center'>
              <div className='text-green-300 font-bold text-2xl'>
                {totalSteps}
              </div>
              <div className='text-green-200 text-sm'>
                Trabajo{totalSteps !== 1 ? 's' : ''} Realizado
                {totalSteps !== 1 ? 's' : ''}
              </div>
            </div>

            {/* NUEVO: Resumen de archivos multimedia */}
            {totalFiles > 0 && (
              <div className='bg-blue-900/30 p-4 rounded border border-blue-500/30'>
                <h5 className='text-blue-300 font-medium mb-3'>
                  📂 Archivos Multimedia
                </h5>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-blue-200'>Total archivos:</span>
                    <span className='text-white font-medium'>{totalFiles}</span>
                  </div>
                  {totalImages > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-blue-200'>Imágenes:</span>
                      <span className='text-white font-medium'>
                        {totalImages}
                      </span>
                    </div>
                  )}
                  {totalVideos > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-blue-200'>Videos:</span>
                      <span className='text-white font-medium'>
                        {totalVideos}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mantener notas legacy si existen */}
        {vehicle.notes && vehicle.notes.trim() && (
          <div className='mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30'>
            <h5 className='text-blue-300 font-medium mb-2'>
              📄 Notas Adicionales
            </h5>
            <div className='text-blue-100 text-sm whitespace-pre-wrap'>
              {vehicle.notes}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
