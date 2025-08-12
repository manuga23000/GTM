// components/sections/Seguimiento/EstadoActual.tsx
'use client'
import { motion } from 'framer-motion'
import { FaTools, FaClock, FaCheckCircle, FaArrowRight } from 'react-icons/fa'

interface EstadoActualProps {
  data: {
    estadoActual: string
    proximoPaso: string
    fechaEstimadaEntrega: string
    trabajosRealizados: string[]
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
    >
      {/* Header del estado */}
      <div className='bg-gradient-to-r from-red-600 to-red-700 text-white p-6'>
        <div className='flex items-center justify-between'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='flex items-center'
          >
            <div
              className={`w-4 h-4 rounded-full ${getEstadoColor(
                data.estadoActual
              )} mr-3 animate-pulse`}
            />
            <div>
              <h2 className='text-2xl font-bold'>Estado Actual</h2>
              <p className='text-red-100'>Última actualización</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-right'
          >
            <div className='text-3xl font-bold'>{data.estadoActual}</div>
            <div className='text-red-100 text-sm'>
              <FaClock className='inline mr-1' />
              Hoy, 14:30
            </div>
          </motion.div>
        </div>
      </div>

      <div className='p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Trabajos realizados */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
              <FaCheckCircle className='text-green-500 mr-2' />
              Trabajos Realizados
            </h3>
            <div className='space-y-3'>
              {data.trabajosRealizados.map((trabajo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className='flex items-start bg-green-50 p-3 rounded-lg border-l-4 border-green-500'
                >
                  <FaCheckCircle className='text-green-500 mt-1 mr-3 flex-shrink-0' />
                  <span className='text-gray-700'>{trabajo}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Próximo paso y entrega */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className='space-y-6'
          >
            {/* Próximo paso */}
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <FaArrowRight className='text-blue-500 mr-2' />
                Próximo Paso
              </h3>
              <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
                <div className='flex items-start'>
                  <FaTools className='text-blue-500 mt-1 mr-3 flex-shrink-0' />
                  <span className='text-gray-700 font-medium'>
                    {data.proximoPaso}
                  </span>
                </div>
              </div>
            </div>

            {/* Fecha estimada de entrega */}
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                <FaClock className='text-purple-500 mr-2' />
                Entrega Estimada
              </h3>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center'
              >
                <div className='text-2xl font-bold mb-1'>
                  {formatearFecha(data.fechaEstimadaEntrega)}
                </div>
                <div className='text-purple-100 text-sm'>
                  Fecha estimada de finalización
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Nota informativa */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className='mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200'
        >
          <p className='text-gray-600 text-sm text-center'>
            <strong>Nota:</strong> Las fechas son estimativas y pueden variar
            según la disponibilidad de repuestos y la complejidad de los
            trabajos. Te notificaremos ante cualquier cambio.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
