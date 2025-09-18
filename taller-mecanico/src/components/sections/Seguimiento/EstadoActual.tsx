'use client'
import { motion } from 'framer-motion'
import {
  FaTools,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaWrench,
} from 'react-icons/fa'
import { TrabajoRealizado } from '@/actions/seguimiento'
import FileViewer from './FileViewer'

interface EstadoActualProps {
  data: {
    estadoActual: string
    proximoPaso: string
    fechaEstimadaEntrega: string
    trabajosRealizados: TrabajoRealizado[]
    updatedAt?: string
    tipoServicio?: string
  }
}

export default function EstadoActual({ data }: EstadoActualProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatearHoraActualizacion = (fecha: string) => {
    if (!fecha) return 'Sin información'

    const date = new Date(fecha)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year}, ${hours}:${minutes}`
  }

  const formatearFechaTrabajo = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'recibido':
        return 'bg-blue-500'
      case 'en diagnóstico':
        return 'bg-yellow-500'
      case 'en reparación':
        return 'bg-orange-500'
      case 'control de calidad':
        return 'bg-purple-500'
      case 'listo para entrega':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const hasFiles =
    data.trabajosRealizados &&
    data.trabajosRealizados.some(
      trabajo => trabajo.archivos && trabajo.archivos.length > 0
    )

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
    >
      <div className='bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6'>
        <div className='block md:hidden'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='text-center space-y-2'
          >
            <div className='flex items-center justify-center'>
              <FaWrench className='mr-2 text-lg' />
              <h2 className='text-lg font-bold'>
                {data.tipoServicio || 'Servicio General'}
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='space-y-1'
            >
              <div className='text-sm text-red-100'>Última actualización:</div>
              <div className='text-sm text-red-100'>
                <FaClock className='inline mr-1' />
                {formatearHoraActualizacion(data.updatedAt || '')}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className='hidden md:flex items-center justify-between'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='flex items-center'
          >
            <FaWrench className='mr-3 text-2xl' />
            <h2 className='text-2xl font-bold'>
              {data.tipoServicio || 'Servicio General'}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-right'
          >
            <div className='text-red-100 text-sm mb-1'>
              Última actualización:
            </div>
            <div className='text-red-100 text-lg flex items-center justify-end'>
              <FaClock className='mr-1' />
              {formatearHoraActualizacion(data.updatedAt || '')}
            </div>
          </motion.div>
        </div>
      </div>

      <div className='p-4 sm:p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
              <FaCheckCircle className='text-green-500 mr-2' />
              Trabajos Realizados
            </h3>
            <div className='space-y-4'>
              {data.trabajosRealizados && data.trabajosRealizados.length > 0 ? (
                data.trabajosRealizados.map((trabajo, index) => (
                  <motion.div
                    key={trabajo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className='bg-green-50 p-4 rounded-lg border-l-4 border-green-500'
                  >
                    <div className='flex items-start'>
                      <FaCheckCircle className='text-green-500 mt-1 mr-3 flex-shrink-0' />
                      <div className='flex-1'>
                        {trabajo.archivos && trabajo.archivos.length > 0 ? (
                          <div>
                            <h4 className='text-gray-800 font-medium text-sm sm:text-base mb-1'>
                              {trabajo.titulo}
                            </h4>
                            {trabajo.descripcion && (
                              <p className='text-gray-600 text-sm mb-2'>
                                {trabajo.descripcion}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className=''>
                            <h4 className='text-gray-800 font-medium text-sm sm:text-base mb-1'>
                              {trabajo.titulo}
                            </h4>
                            {trabajo.descripcion && (
                              <p className='text-gray-600 text-sm mb-2'>
                                {trabajo.descripcion}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {trabajo.archivos && trabajo.archivos.length > 0 && (
                      <FileViewer archivos={trabajo.archivos} />
                    )}
                  </motion.div>
                ))
              ) : (
                <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 text-center'>
                  <div className='flex items-center justify-center text-gray-500'>
                    <FaTools className='mr-2' />
                    <span className='text-sm'>
                      No hay trabajos registrados aún
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className='space-y-6'
          >
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <FaArrowRight className='text-blue-500 mr-2' />
                Próximo Paso
              </h3>
              <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
                <div className='flex items-start'>
                  <FaTools className='text-blue-500 mt-1 mr-3 flex-shrink-0' />
                  <span className='text-gray-700 font-medium text-sm sm:text-base'>
                    {data.proximoPaso || 'Sin información disponible'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <FaClock className='text-purple-500 mr-2' />
                Entrega Estimada
              </h3>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center'
              >
                <div className='text-lg sm:text-2xl font-bold mb-1 leading-tight'>
                  {data.fechaEstimadaEntrega &&
                  !isNaN(new Date(data.fechaEstimadaEntrega).getTime())
                    ? formatearFecha(data.fechaEstimadaEntrega)
                    : 'Todavía no hay fecha estimada de entrega'}
                </div>
                <div className='text-purple-100 text-xs sm:text-sm'>
                  Fecha estimada de finalización
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className='mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200'
        >
          <p className='text-gray-600 text-xs sm:text-sm text-center'>
            <strong>Nota:</strong> Las fechas son estimativas y pueden variar
            según la disponibilidad de repuestos y la complejidad de los
            trabajos. Te notificaremos ante cualquier cambio.
            {hasFiles &&
              ' Los archivos adjuntos se conservan durante 30 días después de la entrega del vehículo.'}
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
