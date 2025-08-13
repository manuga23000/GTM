// app/seguimiento/[patente]/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SeguimientoHeader from '@/components/sections/Seguimiento/SeguimientoHeader'
import EstadoActual from '@/components/sections/Seguimiento/EstadoActual'
import TimelineProgreso from '@/components/sections/Seguimiento/TimelineProgreso'
import Navbar from '@/components/layout/Navbar'

interface SeguimientoData {
  patente: string
  modelo: string
  marca: string
  año: string
  cliente: string
  fechaIngreso: string
  estadoActual: string
  trabajosRealizados: string[]
  proximoPaso: string
  fechaEstimadaEntrega: string
  timeline: TimelineItem[]
  imagenes: ImagenItem[]
}

interface TimelineItem {
  id: number
  fecha: string
  hora: string
  estado: string
  descripcion: string
  completado: boolean
}

interface ImagenItem {
  id: number
  url: string
  fecha: string
  descripcion: string
  tipo: 'antes' | 'proceso' | 'despues'
}

export default function SeguimientoPage() {
  const params = useParams()
  const patente = params.patente as string
  const [seguimientoData, setSeguimientoData] =
    useState<SeguimientoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null)

        // Intentar cargar datos reales desde backend
        try {
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

            // Generar timeline básico basado en el estado actual
            const generarTimeline = (
              estado: string,
              fechaIngreso: string
            ): TimelineItem[] => {
              const fecha = new Date(fechaIngreso)
              const timeline: TimelineItem[] = [
                {
                  id: 1,
                  fecha: fechaIngreso,
                  hora: '09:00',
                  estado: 'Vehículo recibido',
                  descripcion: 'Recepción del vehículo en el taller',
                  completado: true,
                },
              ]

              if (estado !== 'Vehículo recibido') {
                const fechaDiagnostico = new Date(fecha)
                fechaDiagnostico.setDate(fecha.getDate() + 1)
                timeline.push({
                  id: 2,
                  fecha: fechaDiagnostico.toISOString().split('T')[0],
                  hora: '10:00',
                  estado: 'Diagnóstico iniciado',
                  descripcion: 'Evaluación inicial del vehículo',
                  completado: true,
                })
              }

              return timeline
            }

            const estadoMapeado = mapearEstado(data.estadoActual || 'received')

            setSeguimientoData({
              patente: data.patente,
              modelo: data.modelo,
              marca: data.marca,
              año: data.año,
              cliente: data.cliente,
              fechaIngreso: data.fechaIngreso,
              estadoActual: estadoMapeado,
              trabajosRealizados: [
                'Vehículo ingresado al sistema',
                'Documentación completada',
              ],
              proximoPaso: 'Evaluación técnica inicial',
              fechaEstimadaEntrega: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split('T')[0],
              timeline: generarTimeline(estadoMapeado, data.fechaIngreso),
              imagenes: [],
            })
            setLoading(false)
            return
          } else {
            // No se encontraron datos en Firebase
            setError('not_found')
            setLoading(false)
            return
          }
        } catch (importError) {
          setError('backend_error')
        }

        // Si hay error de backend, usar datos mock para desarrollo
        const mockData: SeguimientoData = {
          patente: patente.toUpperCase(),
          modelo: 'Corolla',
          marca: 'Toyota',
          año: '2018',
          cliente: 'Juan Pérez',
          fechaIngreso: '2025-08-09',
          estadoActual: 'En reparación',
          trabajosRealizados: [
            'Diagnóstico inicial completado',
            'Desmontaje de caja automática',
            'Identificación de válvula solenoide defectuosa',
          ],
          proximoPaso: 'Reemplazo de componentes defectuosos',
          fechaEstimadaEntrega: '2025-08-15',
          timeline: [
            {
              id: 1,
              fecha: '2025-08-09',
              hora: '09:30',
              estado: 'Vehículo recibido',
              descripcion: 'Recepción del vehículo en el taller',
              completado: true,
            },
            {
              id: 2,
              fecha: '2025-08-10',
              hora: '14:30',
              estado: 'Diagnóstico iniciado',
              descripcion: 'Inicio del diagnóstico de caja automática',
              completado: true,
            },
            {
              id: 3,
              fecha: '2025-08-11',
              hora: '10:15',
              estado: 'Diagnóstico completado',
              descripcion:
                'Problema identificado: válvula solenoide defectuosa',
              completado: true,
            },
            {
              id: 4,
              fecha: '2025-08-12',
              hora: '08:00',
              estado: 'Reparación en curso',
              descripcion: 'Inicio de reparación y reemplazo de componentes',
              completado: true,
            },
            {
              id: 5,
              fecha: '2025-08-14',
              hora: '16:00',
              estado: 'Control de calidad',
              descripcion: 'Pruebas finales y verificación del funcionamiento',
              completado: false,
            },
            {
              id: 6,
              fecha: '2025-08-15',
              hora: '10:00',
              estado: 'Listo para entrega',
              descripcion: 'Vehículo listo para ser retirado',
              completado: false,
            },
          ],
          imagenes: [
            {
              id: 1,
              url: '/images/seguimiento/antes1.jpg',
              fecha: '2025-08-10',
              descripcion: 'Estado inicial del vehículo',
              tipo: 'antes',
            },
            {
              id: 2,
              url: '/images/seguimiento/proceso1.jpg',
              fecha: '2025-08-12',
              descripcion: 'Desmontaje de la caja automática',
              tipo: 'proceso',
            },
            {
              id: 3,
              url: '/images/seguimiento/proceso2.jpg',
              fecha: '2025-08-12',
              descripcion: 'Válvula solenoide defectuosa identificada',
              tipo: 'proceso',
            },
          ],
        }

        setSeguimientoData(mockData)
      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('general_error')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [patente])

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className='min-h-screen bg-gray-50 flex items-center justify-center'
          style={{ paddingTop: '120px' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full'
          />
          <span className='ml-4 text-gray-600 text-lg'>
            Cargando seguimiento...
          </span>
        </div>
      </>
    )
  }

  // Error states
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
          <EstadoActual data={seguimientoData} />
          <TimelineProgreso timeline={seguimientoData.timeline} />
        </div>
      </main>
    </>
  )
}
