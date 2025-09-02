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
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'

// Type for timeline data from Firestore
interface TimelineHistoryData {
  id: string
  serviceType?: string
  km?: number
  finalizedAt?: {
    seconds: number
    nanoseconds: number
  }
}

export default function SeguimientoPage() {
  const params = useParams()
  const patente = params.patente as string
  const [seguimientoData, setSeguimientoData] =
    useState<SeguimientoData | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineHistoryData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [loadingTimeline, setLoadingTimeline] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null)

        const { getSeguimientoByPatente } = await import(
          '@/actions/seguimiento'
        )
        const data = await getSeguimientoByPatente(patente)

        if (!data) {
          setError('not_found')
          setLoading(false)
          return
        }

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
      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('general_error')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()

    // Cargar datos del timeline1
    const cargarTimeline = async () => {
      try {
        const db = getFirestore(app)
        const timelineDoc = await getDoc(doc(db, 'timeline1', patente))

        if (timelineDoc.exists()) {
          const docData = timelineDoc.data()
          setTimelineData({
            id: timelineDoc.id,
            serviceType: docData?.serviceType,
            km: docData?.km,
            finalizedAt: docData?.finalizedAt,
          })
        }
      } catch (error) {
        console.error('Error cargando timeline:', error)
      } finally {
        setLoadingTimeline(false)
      }
    }

    cargarTimeline()
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

  // Error: Patente no encontrada
  if (error === 'not_found') {
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

  // Main render - solo se ejecuta si seguimientoData existe
  if (!seguimientoData) {
    return (
      <>
        <Navbar />
        <div>No hay datos</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 pt-16 lg:pt-24'>
        <SeguimientoHeader
          data={{
            patente: seguimientoData.patente,
            modelo: seguimientoData.modelo,
            marca: seguimientoData.marca,
            año: seguimientoData.año,
            cliente: seguimientoData.cliente,
            fechaIngreso: seguimientoData.fechaIngreso,
          }}
        />
        <div className='max-w-5xl mx-auto px-4 pt-4 space-y-8'>
          <EstadoActual
            data={{
              estadoActual: seguimientoData.estadoActual || 'Sin estado',
              proximoPaso: seguimientoData.proximoPaso || 'Sin información',
              fechaEstimadaEntrega: seguimientoData.fechaEstimadaEntrega || '',
              trabajosRealizados: seguimientoData.trabajosRealizados || [],
              updatedAt: seguimientoData.updatedAt,
              tipoServicio: seguimientoData.tipoServicio,
            }}
          />

          {/* Timeline Histórico */}
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
              </h3>
            </div>

            {loadingTimeline ? (
              <div className='flex justify-center py-4'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              </div>
            ) : timelineData ? (
              <div className='space-y-4'>
                <div className='flex gap-4 pb-4 border-b border-gray-100'>
                  <div className='flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-blue-500'></div>
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <h4 className='font-medium text-gray-900'>
                        {timelineData.serviceType || 'Servicio anterior'}
                      </h4>
                      {timelineData.km && (
                        <span className='text-sm font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full'>
                          {timelineData.km.toLocaleString()} km
                        </span>
                      )}
                    </div>
                    {timelineData.finalizedAt && (
                      <p className='mt-1 text-sm text-gray-500'>
                        Finalizado el:{' '}
                        {new Date(
                          timelineData.finalizedAt.seconds * 1000
                        ).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-4 text-gray-500'>
                No hay registros de servicios anteriores
              </div>
            )}
          </div>

          {/*
          <TimelineProgreso timeline={seguimientoData.timeline || []} />
          */}
          {/* Separador blanco visual entre timeline y footer */}
          <div className='h-8 md:h-12 w-full' />
        </div>
      </main>
    </>
  )
}
