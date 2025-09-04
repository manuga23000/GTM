// app/seguimiento/[patente]/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SeguimientoHeader from '@/components/sections/Seguimiento/SeguimientoHeader'
import EstadoActual from '@/components/sections/Seguimiento/EstadoActual'
//import TimelineProgreso from '@/components/sections/Seguimiento/TimelineProgreso'
import Navbar from '@/components/layout/Navbar'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { SeguimientoData } from '@/actions/seguimiento'
import { getFirestore } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export default function SeguimientoPage() {
  const params = useParams()
  const patente = params.patente as string
  const [seguimientoData, setSeguimientoData] =
    useState<SeguimientoData | null>(null)
  const [historialCompleto, setHistorialCompleto] = useState<SeguimientoData[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [loadingHistorial, setLoadingHistorial] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [servicioExpandido, setServicioExpandido] = useState<number | null>(
    null
  )

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null)

        const { getSeguimientoByPatente } = await import(
          '@/actions/seguimiento'
        )
        const data = await getSeguimientoByPatente(patente)

        if (data) {
          // Mapear el estado de Firebase a un estado más descriptivo
          const mapearEstado = (status: string) => {
            switch (status?.toLowerCase()) {
              case 'received':
                return 'Vehículo recibido'
              case 'diagnosis':
                return 'En diagnóstico'
              case 'repair':
                return 'En reparación'
              case 'quality_control':
                return 'Control de calidad'
              case 'ready':
                return 'Listo para entrega'
              default:
                return 'Vehículo recibido'
            }
          }

          const estadoMapeado = mapearEstado(data.estadoActual || 'received')

          // ACTUALIZADO: Usar los datos tal como vienen, ya incluyen archivos
          setSeguimientoData({
            ...data,
            estadoActual: estadoMapeado,
            // Asegurar que trabajosRealizados tenga la estructura correcta
            trabajosRealizados:
              data.trabajosRealizados && data.trabajosRealizados.length > 0
                ? data.trabajosRealizados
                : [],
            proximoPaso: data.proximoPaso || 'Sin información',
            timeline:
              data.timeline && data.timeline.length > 0 ? data.timeline : [],
            imagenes:
              data.imagenes && data.imagenes.length > 0 ? data.imagenes : [],
          })
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('general_error')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [patente])

  // NUEVO: Cargar historial completo independientemente del servicio activo
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const { buscarHistorialCompleto } = await import(
          '@/actions/seguimiento'
        )
        const historial = await buscarHistorialCompleto(patente)

        setHistorialCompleto(historial)
      } catch (error) {
        console.error('Error cargando historial:', error)
      } finally {
        setLoadingHistorial(false)
      }
    }

    cargarHistorial()
  }, [patente])

  // Loading state con LoadingScreen de la home
  if (loading) {
    return (
      <>
        <Navbar />
        <div className='fixed inset-0 bg-black z-50 flex items-center justify-center'>
          <LoadingScreen onLoadingComplete={() => {}} duration={1200} />
        </div>
      </>
    )
  }

  // ACTUALIZADO: Lógica de error mejorada
  // Solo mostrar "not_found" si no hay servicio activo Y no hay historial
  if (
    error === 'not_found' &&
    !seguimientoData &&
    historialCompleto.length === 0
  ) {
    return (
      <>
        <Navbar />
        <div
          className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center'
          style={{ paddingTop: '120px', paddingBottom: '60px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center'
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5'
            >
              <svg
                className='w-8 h-8 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </motion.div>

            <h1 className='text-sm font-bold text-gray-800 mb-3'>
              Vehículo no ingresado aún
            </h1>

            <p className='text-gray-600 mb-5 text-sm'>
              La patente <strong className='text-red-600'>{patente}</strong> no
              se encuentra registrada en nuestro sistema.
            </p>

            <button
              onClick={() => window.history.back()}
              className='w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
            >
              Volver atrás
            </button>
          </motion.div>
        </div>
      </>
    )
  }

  // Error general del sistema
  if (error === 'general_error') {
    return (
      <>
        <Navbar />
        <div
          className='min-h-screen bg-gray-50 flex items-center justify-center'
          style={{ paddingTop: '120px' }}
        >
          <div className='text-center bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4'>
            <h1 className='text-xl font-bold text-gray-800 mb-4'>
              Error del sistema
            </h1>
            <p className='text-gray-600 mb-6 text-sm'>
              Ocurrió un error al cargar la información del vehículo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mr-4'
            >
              Reintentar
            </button>
            <button
              onClick={() => window.history.back()}
              className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Volver atrás
            </button>
          </div>
        </div>
      </>
    )
  }

  // ACTUALIZADO: Determinar qué mostrar basado en la nueva lógica
  const tieneServicioActivo = !!seguimientoData
  const tieneHistorial = historialCompleto.length > 0

  // Si no tiene servicio activo Y no tiene historial, mostrar mensaje
  if (
    !tieneServicioActivo &&
    !tieneHistorial &&
    !loading &&
    !loadingHistorial
  ) {
    return (
      <>
        <Navbar />
        <div
          className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center'
          style={{ paddingTop: '120px', paddingBottom: '60px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center'
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5'
            >
              <svg
                className='w-8 h-8 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </motion.div>

            <h1 className='text-sm font-bold text-gray-800 mb-3'>
              Vehículo no ingresado aún
            </h1>

            <p className='text-gray-600 mb-5 text-sm'>
              La patente <strong className='text-red-600'>{patente}</strong> no
              se encuentra registrada en nuestro sistema.
            </p>

            <button
              onClick={() => window.history.back()}
              className='w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
            >
              Volver atrás
            </button>
          </motion.div>
        </div>
      </>
    )
  }

  // NUEVO: Usar datos del primer servicio histórico para el header si no hay servicio activo
  const datosParaHeader =
    seguimientoData ||
    (historialCompleto.length > 0 ? historialCompleto[0] : null)

  if (!datosParaHeader) {
    return (
      <>
        <Navbar />
        <div>No hay datos para mostrar</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 pt-16 lg:pt-24'>
        <SeguimientoHeader
          data={{
            patente: datosParaHeader.patente,
            modelo: datosParaHeader.modelo,
            marca: datosParaHeader.marca,
            año: datosParaHeader.año,
            cliente: datosParaHeader.cliente,
            fechaIngreso: datosParaHeader.fechaIngreso,
          }}
        />
        <div className='max-w-5xl mx-auto px-4 pt-4 space-y-8'>
          {/* CONDICIONAL: Solo mostrar EstadoActual si hay servicio activo */}
          {tieneServicioActivo && seguimientoData && (
            <EstadoActual
              data={{
                estadoActual: seguimientoData.estadoActual || 'Sin estado',
                proximoPaso: seguimientoData.proximoPaso || 'Sin información',
                fechaEstimadaEntrega:
                  seguimientoData.fechaEstimadaEntrega || '',
                trabajosRealizados: seguimientoData.trabajosRealizados || [],
                updatedAt: seguimientoData.updatedAt,
                tipoServicio: seguimientoData.tipoServicio,
              }}
            />
          )}

          {/* NUEVO: Timeline Histórico Completo */}
          <div className='bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-blue-50 rounded-lg'>
                <svg
                  className='w-5 h-5 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-800'>
                Historial de Servicios
                {historialCompleto.length > 0 && (
                  <span className='ml-2 text-sm font-normal text-gray-500'>
                    ({historialCompleto.length} servicio
                    {historialCompleto.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h3>
            </div>

            {loadingHistorial ? (
              <div className='flex justify-center py-4'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              </div>
            ) : historialCompleto.length > 0 ? (
              <div className='space-y-4'>
                {historialCompleto.map((servicio, index) => (
                  <motion.div
                    key={`servicio-${servicio.serviceNumber}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='border border-gray-200 rounded-lg p-5 bg-gray-50'
                  >
                    {/* Header del servicio MEJORADO */}
                    <div className='flex justify-between items-center mb-3'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='flex-shrink-0 w-3 h-3 rounded-full bg-green-500'></div>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 text-lg'>
                            {servicio.tipoServicio || 'Servicio general'}
                          </h4>
                          <div className='text-sm text-gray-500 mt-1'>
                            Finalizado:{' '}
                            {new Date(
                              servicio.fechaFinalizado || ''
                            ).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              // REMOVIDO: hour y minute para quitar la hora
                            })}
                          </div>
                        </div>
                      </div>

                      {/* NUEVO: Kilometraje grande a la derecha */}
                      {servicio.km && (
                        <div className='text-right mr-4'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {servicio.km.toLocaleString()} KM
                          </div>
                        </div>
                      )}

                      {/* NUEVO: Botón Ver más */}
                      <button
                        onClick={() => {
                          setServicioExpandido(
                            servicioExpandido === servicio.serviceNumber
                              ? null
                              : servicio.serviceNumber || 0
                          )
                        }}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
                      >
                        {servicioExpandido === servicio.serviceNumber
                          ? '👁️ Ver menos'
                          : '👁️ Ver más'}
                      </button>
                    </div>

                    {/* NUEVO: Trabajos expandibles */}
                    {servicioExpandido === servicio.serviceNumber &&
                      servicio.trabajosRealizados &&
                      servicio.trabajosRealizados.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className='mt-4 border-t border-gray-200 pt-4'
                        >
                          <h5 className='font-medium text-gray-800 mb-4 flex items-center gap-2'>
                            <span className='text-green-600'>🔧</span>
                            Pasos realizados en este servicio
                          </h5>

                          <div className='space-y-4'>
                            {servicio.trabajosRealizados.map(
                              (trabajo, trabajoIndex) => (
                                <motion.div
                                  key={trabajo.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: trabajoIndex * 0.1 }}
                                  className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'
                                >
                                  <div className='flex justify-between items-start mb-2'>
                                    <div className='flex items-center gap-2 flex-1'>
                                      <span className='text-lg'>✅</span>
                                      <h6 className='font-medium text-gray-900'>
                                        {trabajo.titulo}
                                      </h6>
                                    </div>
                                    <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                                      {new Date(
                                        trabajo.fecha
                                      ).toLocaleDateString('es-AR')}
                                    </span>
                                  </div>

                                  {trabajo.descripcion && (
                                    <p className='text-gray-600 text-sm mb-3 ml-7'>
                                      {trabajo.descripcion}
                                    </p>
                                  )}

                                  {/* Archivos del trabajo */}
                                  {trabajo.archivos &&
                                    trabajo.archivos.length > 0 && (
                                      <div className='mt-3 ml-7'>
                                        <div className='flex items-center gap-2 mb-2'>
                                          <span className='text-xs text-gray-500'>
                                            Archivos:
                                          </span>
                                          <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'>
                                            {trabajo.archivos.length} archivo
                                            {trabajo.archivos.length !== 1
                                              ? 's'
                                              : ''}
                                          </span>
                                        </div>
                                        <div className='flex gap-2 flex-wrap'>
                                          {trabajo.archivos.map(archivo => (
                                            <div
                                              key={archivo.id}
                                              className='relative group cursor-pointer'
                                              onClick={() => {
                                                // Abrir archivo en modal
                                                const modal =
                                                  document.createElement('div')
                                                modal.className =
                                                  'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[99999] cursor-pointer'
                                                modal.onclick = () =>
                                                  document.body.removeChild(
                                                    modal
                                                  )

                                                const container =
                                                  document.createElement('div')
                                                container.className =
                                                  'relative max-w-full max-h-full p-4'

                                                if (archivo.type === 'image') {
                                                  const img =
                                                    document.createElement(
                                                      'img'
                                                    )
                                                  img.src = archivo.url
                                                  img.className =
                                                    'max-w-full max-h-full object-contain'
                                                  img.alt = archivo.fileName
                                                  container.appendChild(img)
                                                } else {
                                                  const video =
                                                    document.createElement(
                                                      'video'
                                                    )
                                                  video.src = archivo.url
                                                  video.controls = true
                                                  video.className =
                                                    'max-w-full max-h-full'
                                                  container.appendChild(video)
                                                }

                                                const closeButton =
                                                  document.createElement(
                                                    'button'
                                                  )
                                                closeButton.innerHTML = '✕'
                                                closeButton.className =
                                                  'absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 hover:bg-opacity-75 flex items-center justify-center'
                                                closeButton.onclick = e => {
                                                  e.stopPropagation()
                                                  document.body.removeChild(
                                                    modal
                                                  )
                                                }

                                                modal.appendChild(container)
                                                modal.appendChild(closeButton)
                                                document.body.appendChild(modal)
                                              }}
                                            >
                                              {archivo.type === 'image' ? (
                                                <img
                                                  src={
                                                    archivo.thumbnailUrl ||
                                                    archivo.url
                                                  }
                                                  alt={archivo.fileName}
                                                  className='w-16 h-16 object-cover rounded border border-gray-300 hover:border-blue-400 transition-colors'
                                                />
                                              ) : (
                                                <video
                                                  src={archivo.url}
                                                  className='w-16 h-16 object-cover rounded border border-gray-300 hover:border-blue-400 transition-colors'
                                                />
                                              )}

                                              {/* Tipo de archivo */}
                                              <div className='absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl'>
                                                {archivo.type === 'image'
                                                  ? '📷'
                                                  : '🎥'}
                                              </div>

                                              {/* Info en hover */}
                                              <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-end'>
                                                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 w-full'>
                                                  <div className='bg-black bg-opacity-70 text-white text-xs p-1 rounded text-center'>
                                                    <div className='truncate font-medium'>
                                                      {archivo.fileName}
                                                    </div>
                                                    <div className='text-gray-300'>
                                                      {(
                                                        archivo.size /
                                                        1024 /
                                                        1024
                                                      ).toFixed(1)}
                                                      MB
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </motion.div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-3'>📋</div>
                <p className='text-lg font-medium mb-2'>
                  Sin historial de servicios
                </p>
                <p className='text-sm'>
                  {tieneServicioActivo
                    ? 'Este es el primer servicio registrado para este vehículo.'
                    : 'No hay servicios registrados para esta patente.'}
                </p>
              </div>
            )}
          </div>

          {/* Separador blanco visual entre timeline y footer */}
          <div className='h-8 md:h-12 w-full' />
        </div>
      </main>
    </>
  )
}
