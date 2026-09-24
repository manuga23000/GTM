'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaWrench, FaCog } from 'react-icons/fa'
import { TbEngine } from 'react-icons/tb'
import SeguimientoHeader from '@/components/sections/Seguimiento/SeguimientoHeader'
import EstadoActual from '@/components/sections/Seguimiento/EstadoActual'
import FluidLevels from '@/components/sections/Seguimiento/FluidLevels'
import Navbar from '@/components/layout/Navbar'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { SeguimientoData, TrabajoRealizado } from '@/actions/seguimiento'
import FileViewer from '@/components/sections/Seguimiento/FileViewer'
import ServiceDataInfo from '@/components/sections/Seguimiento/ServiceDataInfo'
import { getReparacionesTitulo, getServiceTitulo } from '@/components/sections/Admin/ServiceDataForm'

type SectionType = 'reparaciones' | 'motor' | 'caja'

const sectionConfig: Record<SectionType, { label: string; shortLabel: string; icon: React.ReactNode; activeGradient: string }> = {
  reparaciones: {
    label: 'Reparaciones',
    shortLabel: 'Reparaciones',
    icon: <FaWrench className='w-3.5 h-3.5' />,
    activeGradient: 'from-red-600 to-red-700',
  },
  motor: {
    label: 'Servicio Motor',
    shortLabel: 'Motor',
    icon: <TbEngine className='w-4 h-4' />,
    activeGradient: 'from-blue-600 to-blue-700',
  },
  caja: {
    label: 'Servicio Caja',
    shortLabel: 'Caja',
    icon: <FaCog className='w-3.5 h-3.5' />,
    activeGradient: 'from-orange-600 to-orange-700',
  },
}

function SectionTabBar({
  sections,
  activeSection,
  onSelect,
}: {
  sections: SectionType[]
  activeSection: SectionType
  onSelect: (s: SectionType) => void
}) {
  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50'>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        className='bg-gray-900/90 backdrop-blur-2xl rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10'
      >
        <div className='flex gap-1'>
          {sections.map(section => {
            const cfg = sectionConfig[section]
            const isActive = section === activeSection
            return (
              <button
                key={section}
                onClick={() => onSelect(section)}
                className='relative px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200'
              >
                {isActive && (
                  <motion.div
                    layoutId='activeTab'
                    className={`absolute inset-0 bg-gradient-to-r ${cfg.activeGradient} rounded-xl shadow-lg`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  {cfg.icon}
                  <span className='hidden sm:inline'>{cfg.label}</span>
                  <span className='sm:hidden'>{cfg.shortLabel}</span>
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function HistorialDarkSection({
  title,
  accentColor,
  items,
  renderItem,
  loading,
}: {
  title: string
  accentColor: 'blue' | 'orange'
  items: SeguimientoData[]
  renderItem: (servicio: SeguimientoData, index: number) => React.ReactNode
  loading: boolean
}) {
  const borderColor = accentColor === 'blue' ? 'border-blue-500/20' : 'border-orange-500/20'
  const iconBg = accentColor === 'blue' ? 'bg-blue-500/10' : 'bg-orange-500/10'
  const iconColor = accentColor === 'blue' ? 'text-blue-400' : 'text-orange-400'
  const badgeColor = accentColor === 'blue' ? 'text-blue-300' : 'text-orange-300'

  if (loading) {
    return (
      <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border ${borderColor} p-6`}>
        <h3 className='text-xl font-semibold text-white mb-6'>{title}</h3>
        <div className='flex justify-center py-4'>
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${accentColor === 'blue' ? 'border-blue-500' : 'border-orange-500'}`} />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border ${borderColor} p-6`}>
      <div className='flex items-center gap-3 mb-6'>
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
        </div>
        <h3 className='text-xl font-semibold text-white'>
          {title}
          {items.length > 0 && (
            <span className={`ml-2 text-sm font-normal ${badgeColor}`}>
              ({items.length} servicio{items.length !== 1 ? 's' : ''})
            </span>
          )}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className='space-y-4'>
          {items.map((servicio, index) => renderItem(servicio, index))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='text-4xl mb-3'>📋</div>
          <p className='text-lg font-medium text-zinc-400 mb-2'>Sin historial</p>
          <p className='text-sm text-zinc-500'>No hay servicios anteriores de este tipo.</p>
        </div>
      )}
    </div>
  )
}

function ObservacionesSection({ observaciones, dark }: { observaciones: TrabajoRealizado[]; dark?: boolean }) {
  if (!observaciones || observaciones.length === 0) return null
  return (
    <div className={dark ? 'bg-zinc-950 px-4 pt-6' : ''}>
      <div className={`${dark ? 'max-w-4xl mx-auto bg-zinc-900/70 border border-zinc-800' : 'bg-white shadow-sm border border-gray-100'} rounded-xl p-6`}>
        <div className='flex items-center gap-3 mb-4'>
          <div className={`p-2 rounded-lg ${dark ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
            <svg className={`w-5 h-5 ${dark ? 'text-amber-400' : 'text-amber-600'}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>Observaciones</h3>
        </div>
        <div className='space-y-3'>
          {observaciones.map((obs, idx) => (
            <div key={obs.id || idx} className={`rounded-lg p-4 border ${dark ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-gray-50 border-gray-100'}`}>
              <div className='flex items-start gap-3'>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${dark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <span className={`text-xs font-bold ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{idx + 1}</span>
                </div>
                <div className='flex-1'>
                  <p className={`font-medium text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{obs.titulo}</p>
                  <p className={`text-xs mt-1 ${dark ? 'text-zinc-500' : 'text-gray-500'}`}>
                    {new Date(obs.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {obs.archivos && obs.archivos.length > 0 && (
                    <div className='mt-2'>
                      <FileViewer archivos={obs.archivos} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  const [activeSection, setActiveSection] = useState<SectionType>('reparaciones')
  const [initialSectionSet, setInitialSectionSet] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null)

        const { getSeguimientoByPatente } = await import(
          '@/actions/seguimiento'
        )
        const data = await getSeguimientoByPatente(patente)

        if (data) {
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

          setSeguimientoData({
            ...data,
            estadoActual: estadoMapeado,
            trabajosRealizados:
              data.trabajosRealizados && data.trabajosRealizados.length > 0
                ? data.trabajosRealizados
                : [],
            proximoPaso: data.proximoPaso || 'Sin información',
            timeline:
              data.timeline && data.timeline.length > 0 ? data.timeline : [],
            imagenes:
              data.imagenes && data.imagenes.length > 0 ? data.imagenes : [],
            serviceData: data.serviceData,
            serviceDataMotor: data.serviceDataMotor,
            serviceDataCaja: data.serviceDataCaja,
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

  const hasSteps = (seguimientoData?.trabajosRealizados?.length || 0) > 0 ||
    historialCompleto.some(h => (h.trabajosRealizados?.length || 0) > 0)
  const hasMotor = !!seguimientoData?.serviceDataMotor ||
    historialCompleto.some(h => !!h.serviceDataMotor)
  const hasCaja = !!seguimientoData?.serviceDataCaja ||
    historialCompleto.some(h => !!h.serviceDataCaja)

  const sections = useMemo(() => {
    const s: SectionType[] = []
    if (hasSteps || (!hasMotor && !hasCaja)) s.push('reparaciones')
    if (hasMotor) s.push('motor')
    if (hasCaja) s.push('caja')
    return s
  }, [hasSteps, hasMotor, hasCaja])

  const showTabs = sections.length >= 2

  useEffect(() => {
    if (!initialSectionSet && seguimientoData && sections.length > 0) {
      if (seguimientoData.serviceDataCaja && sections.includes('caja')) {
        setActiveSection('caja')
      } else if (seguimientoData.serviceDataMotor && sections.includes('motor')) {
        setActiveSection('motor')
      } else if (sections.includes('reparaciones')) {
        setActiveSection('reparaciones')
      } else {
        setActiveSection(sections[0])
      }
      setInitialSectionSet(true)
    } else if (sections.length > 0 && !sections.includes(activeSection)) {
      setActiveSection(sections[0])
    }
  }, [sections, activeSection, seguimientoData, initialSectionSet])

  const historialMotor = useMemo(
    () => historialCompleto.filter(h => !!h.serviceDataMotor),
    [historialCompleto]
  )
  const historialCaja = useMemo(
    () => historialCompleto.filter(h => !!h.serviceDataCaja),
    [historialCompleto]
  )

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

  const tieneServicioActivo = !!seguimientoData
  const tieneHistorial = historialCompleto.length > 0

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

  const fotoVehiculo = seguimientoData?.fotoVehiculo || seguimientoData?.serviceDataMotor?.fotoVehiculo || seguimientoData?.serviceDataCaja?.fotoVehiculo
    || datosParaHeader.fotoVehiculo || datosParaHeader.serviceDataMotor?.fotoVehiculo || datosParaHeader.serviceDataCaja?.fotoVehiculo

  const vehiculoInfo = {
    patente: datosParaHeader.patente,
    marca: datosParaHeader.marca,
    modelo: datosParaHeader.modelo,
    año: datosParaHeader.año,
    cliente: datosParaHeader.cliente,
    fechaIngreso: datosParaHeader.fechaIngreso,
    km: seguimientoData?.km || datosParaHeader.km,
    fotoVehiculo,
  }

  const reparacionesTitulo = seguimientoData?.tipoServicio ? getReparacionesTitulo(seguimientoData.tipoServicio) : seguimientoData?.tipoServicio

  // ─── Render helpers for service historial ───────────────

  const renderHistorialServiceItem = (servicio: SeguimientoData, index: number, type: 'motor' | 'caja') => {
    const serviceData = type === 'motor' ? servicio.serviceDataMotor : servicio.serviceDataCaja
    if (!serviceData) return null

    return (
      <motion.div
        key={`servicio-${type}-${servicio.serviceNumber}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`border rounded-2xl overflow-hidden ${type === 'motor' ? 'border-blue-500/20' : 'border-orange-500/20'}`}
      >
        <div className='p-4 bg-white/[0.03]'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-3'>
              <FaCheckCircle className='text-green-500 text-lg flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-white text-lg'>{servicio.tipoServicio ? getServiceTitulo(servicio.tipoServicio, type) : 'Servicio general'}</h4>
                <div className='text-sm text-zinc-400 mt-1'>
                  Finalizado: {new Date(servicio.fechaFinalizado || '').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
            </div>
            {servicio.km ? (
              <div className={`text-xl font-bold ${type === 'motor' ? 'text-blue-400' : 'text-orange-400'}`}>
                {servicio.km.toLocaleString()} KM
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setServicioExpandido(servicioExpandido === servicio.serviceNumber ? null : servicio.serviceNumber || 0)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              type === 'motor'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {servicioExpandido === servicio.serviceNumber ? 'Ver menos' : 'Ver detalles'}
          </button>
        </div>
        {servicioExpandido === servicio.serviceNumber && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
            <ServiceDataInfo
              serviceData={serviceData}
              tipoServicio={servicio.tipoServicio ? getServiceTitulo(servicio.tipoServicio, type) : servicio.tipoServicio}
              km={servicio.km}
              compact
            />
          </motion.div>
        )}
      </motion.div>
    )
  }

  // ─── Original reparaciones view ─────────────────────────

  const ReparacionesView = () => (
    <main className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 pt-16 lg:pt-24'>
      <SeguimientoHeader data={vehiculoInfo} />
      <div className='max-w-5xl mx-auto px-4 pt-4 space-y-8'>
        {tieneServicioActivo && seguimientoData && !seguimientoData.serviceDataMotor && !seguimientoData.serviceDataCaja && (
          <>
            <EstadoActual
              data={{
                estadoActual: seguimientoData.estadoActual || 'Sin estado',
                proximoPaso: seguimientoData.proximoPaso || 'Sin información',
                fechaEstimadaEntrega:
                  seguimientoData.fechaEstimadaEntrega || '',
                trabajosRealizados: seguimientoData.trabajosRealizados || [],
                updatedAt: seguimientoData.updatedAt,
                tipoServicio: reparacionesTitulo,
                fluidLevels: seguimientoData.fluidLevels,
              }}
            />
            {seguimientoData.observaciones && seguimientoData.observaciones.length > 0 && (
              <ObservacionesSection observaciones={seguimientoData.observaciones} />
            )}
            {seguimientoData.fluidLevels && (
              <div id='control-fluidos'>
                <FluidLevels
                  aceite={seguimientoData.fluidLevels.aceite}
                  agua={seguimientoData.fluidLevels.agua}
                  frenos={seguimientoData.fluidLevels.frenos}
                />
              </div>
            )}
          </>
        )}

        <div className='bg-white rounded-xl shadow-sm p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-800'>
              Historial de Servicios
              {historialCompleto.length > 0 && (
                <span className='ml-2 text-sm font-normal text-gray-500 whitespace-nowrap'>
                  ({historialCompleto.length} servicio{historialCompleto.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
          </div>

          {loadingHistorial ? (
            <div className='flex justify-center py-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
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
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <FaCheckCircle className='text-green-500 text-lg flex-shrink-0' />
                      <div className='flex-1'>
                        <h4 className='font-semibold text-gray-900 text-lg'>
                          {servicio.tipoServicio ? getReparacionesTitulo(servicio.tipoServicio) : 'Servicio general'}
                        </h4>
                        <div className='text-sm text-gray-500 mt-1'>
                          Finalizado:{' '}
                          {new Date(servicio.fechaFinalizado || '').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      {servicio.km ? (
                        <div className='text-xl md:text-2xl font-bold text-blue-600'>
                          {servicio.km.toLocaleString()} KM
                        </div>
                      ) : <div />}
                      <button
                        onClick={() => setServicioExpandido(servicioExpandido === servicio.serviceNumber ? null : servicio.serviceNumber || 0)}
                        className='px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0'
                      >
                        {servicioExpandido === servicio.serviceNumber ? '👁️ Ver menos' : '👁️ Ver más'}
                      </button>
                    </div>
                  </div>

                  {servicioExpandido === servicio.serviceNumber && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className='mt-4 border-t border-gray-200 pt-4 space-y-4'
                    >
                      {servicio.trabajosRealizados && servicio.trabajosRealizados.length > 0 && (
                        <div>
                          <h5 className='font-medium text-gray-800 mb-4 flex items-center gap-2'>
                            <span className='text-green-600'>🔧</span>
                            Pasos realizados en este servicio
                          </h5>
                          <div className='space-y-4'>
                            {servicio.trabajosRealizados.map((trabajo, trabajoIndex) => (
                              <motion.div
                                key={trabajo.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: trabajoIndex * 0.1 }}
                                className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'
                              >
                                <div className='flex items-start gap-3 mb-2'>
                                  <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                                  <div>
                                    <h6 className='font-medium text-gray-900 text-base'>{trabajo.titulo}</h6>
                                    {trabajo.descripcion && (
                                      <p className='text-gray-700 text-base mt-1 whitespace-pre-line leading-relaxed'>{trabajo.descripcion}</p>
                                    )}
                                  </div>
                                </div>
                                {trabajo.archivos && trabajo.archivos.length > 0 && (
                                  <div className='ml-7'><FileViewer archivos={trabajo.archivos} /></div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                      {servicio.fluidLevels && (
                        <div className='mt-4'>
                          <h5 className='font-medium text-gray-800 mb-4 flex items-center gap-2'>
                            <span className='text-blue-600'>🧪</span>
                            Estado de fluidos en este servicio
                          </h5>
                          <FluidLevels aceite={servicio.fluidLevels.aceite} agua={servicio.fluidLevels.agua} frenos={servicio.fluidLevels.frenos} showInfoNote={false} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <div className='text-4xl mb-3'>📋</div>
              <p className='text-lg font-medium mb-2'>Sin historial de servicios</p>
              <p className='text-sm'>
                {tieneServicioActivo
                  ? 'Este es el primer servicio registrado para este vehículo.'
                  : 'No hay servicios registrados para esta patente.'}
              </p>
            </div>
          )}
        </div>

        <div className='h-8 md:h-12 w-full' />
      </div>
    </main>
  )

  // ─── Motor Content ───────────────────────────────────────

  const MotorContent = () => (
    <main>
      {tieneServicioActivo && seguimientoData?.serviceDataMotor ? (
        <ServiceDataInfo
          serviceData={seguimientoData.serviceDataMotor}
          tipoServicio={seguimientoData.tipoServicio ? getServiceTitulo(seguimientoData.tipoServicio, 'motor') : seguimientoData.tipoServicio}
          fechaEstimadaEntrega={seguimientoData.fechaEstimadaEntrega}
          proximoPaso={seguimientoData.proximoPaso}
          km={seguimientoData.km}
          vehiculo={vehiculoInfo}
        />
      ) : (
        <div className='min-h-[30vh] bg-zinc-950 flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-5xl mb-4'>🔵</div>
            <h2 className='text-2xl font-bold text-white mb-2'>Servicio de Motor</h2>
            <p className='text-zinc-400'>No hay servicio de motor activo actualmente</p>
          </div>
        </div>
      )}
      {tieneServicioActivo && seguimientoData?.observaciones && seguimientoData.observaciones.length > 0 && (
        <ObservacionesSection observaciones={seguimientoData.observaciones} dark />
      )}
      <div className='bg-zinc-950 px-4 pb-12'>
        <div className='max-w-4xl mx-auto'>
          <HistorialDarkSection
            title='Historial de Servicios de Motor'
            accentColor='blue'
            items={historialMotor}
            loading={loadingHistorial}
            renderItem={(servicio, index) => renderHistorialServiceItem(servicio, index, 'motor')}
          />
        </div>
      </div>
    </main>
  )

  // ─── Caja Content ────────────────────────────────────────

  const CajaContent = () => (
    <main>
      {tieneServicioActivo && seguimientoData?.serviceDataCaja ? (
        <ServiceDataInfo
          serviceData={seguimientoData.serviceDataCaja}
          tipoServicio={seguimientoData.tipoServicio ? getServiceTitulo(seguimientoData.tipoServicio, 'caja') : seguimientoData.tipoServicio}
          fechaEstimadaEntrega={seguimientoData.fechaEstimadaEntrega}
          proximoPaso={seguimientoData.proximoPaso}
          km={seguimientoData.km}
          vehiculo={vehiculoInfo}
        />
      ) : (
        <div className='min-h-[30vh] bg-zinc-950 flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-5xl mb-4'>🟠</div>
            <h2 className='text-2xl font-bold text-white mb-2'>Servicio de Caja</h2>
            <p className='text-zinc-400'>No hay servicio de caja activo actualmente</p>
          </div>
        </div>
      )}
      {tieneServicioActivo && seguimientoData?.observaciones && seguimientoData.observaciones.length > 0 && (
        <ObservacionesSection observaciones={seguimientoData.observaciones} dark />
      )}
      <div className='bg-zinc-950 px-4 pb-12'>
        <div className='max-w-4xl mx-auto'>
          <HistorialDarkSection
            title='Historial de Servicios de Caja'
            accentColor='orange'
            items={historialCaja}
            loading={loadingHistorial}
            renderItem={(servicio, index) => renderHistorialServiceItem(servicio, index, 'caja')}
          />
        </div>
      </div>
    </main>
  )

  // ─── Single section (no tabs) ────────────────────────────

  if (!showTabs) {
    const singleSection = sections[0] || 'reparaciones'

    if (singleSection === 'motor') {
      return (
        <>
          <Navbar />
          <main className='pt-16 lg:pt-24'>
            <MotorContent />
          </main>
        </>
      )
    }

    if (singleSection === 'caja') {
      return (
        <>
          <Navbar />
          <main className='pt-16 lg:pt-24'>
            <CajaContent />
          </main>
        </>
      )
    }

    return (
      <>
        <Navbar />
        <ReparacionesView />
      </>
    )
  }

  // ─── Tabbed view (2+ sections) ───────────────────────────

  return (
    <>
      <Navbar />
      <div className={`pb-20 ${activeSection !== 'reparaciones' ? 'pt-16 lg:pt-24' : ''}`}>
        {activeSection === 'reparaciones' && <ReparacionesView />}
        {activeSection === 'motor' && <MotorContent />}
        {activeSection === 'caja' && <CajaContent />}
        <SectionTabBar
          sections={sections}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />
      </div>
    </>
  )
}
