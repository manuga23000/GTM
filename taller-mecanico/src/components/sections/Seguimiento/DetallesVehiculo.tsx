// components/sections/Seguimiento/DetallesVehiculo.tsx
'use client'
import { motion } from 'framer-motion'
import {
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaClock,
  FaDownload,
} from 'react-icons/fa'

interface DetallesVehiculoProps {
  data: {
    patente: string
    modelo: string
    marca: string
    año: string
    cliente: string
    fechaIngreso: string
    fechaEstimadaEntrega: string
  }
}

export default function DetallesVehiculo({ data }: DetallesVehiculoProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const calcularDiasEnTaller = () => {
    const fechaIngreso = new Date(data.fechaIngreso)
    const hoy = new Date()
    const diferencia = Math.ceil(
      (hoy.getTime() - fechaIngreso.getTime()) / (1000 * 3600 * 24)
    )
    return diferencia
  }

  const calcularDiasRestantes = () => {
    const fechaEntrega = new Date(data.fechaEstimadaEntrega)
    const hoy = new Date()
    const diferencia = Math.ceil(
      (fechaEntrega.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    )
    return diferencia
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6'>
        <h2 className='text-xl font-bold flex items-center'>
          <FaCar className='mr-3' />
          Detalles del Vehículo
        </h2>
      </div>

      <div className='p-6 space-y-6'>
        {/* Info principal del vehículo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className='space-y-4'
        >
          <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
            <FaIdCard className='text-red-500 mr-3' />
            <div className='flex-1'>
              <div className='text-sm text-gray-500'>Patente</div>
              <div className='font-bold text-lg'>{data.patente}</div>
            </div>
          </div>

          <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
            <FaCar className='text-blue-500 mr-3' />
            <div className='flex-1'>
              <div className='text-sm text-gray-500'>Vehículo</div>
              <div className='font-semibold'>
                {data.marca} {data.modelo}
              </div>
              <div className='text-sm text-gray-600'>Año {data.año}</div>
            </div>
          </div>

          <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
            <FaUser className='text-green-500 mr-3' />
            <div className='flex-1'>
              <div className='text-sm text-gray-500'>Propietario</div>
              <div className='font-semibold'>{data.cliente}</div>
            </div>
          </div>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Fechas importantes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className='space-y-4'
        >
          <h3 className='font-semibold text-gray-800 mb-3'>
            Fechas Importantes
          </h3>

          <div className='flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500'>
            <FaCalendarAlt className='text-blue-500 mr-3' />
            <div className='flex-1'>
              <div className='text-sm text-blue-600'>Fecha de Ingreso</div>
              <div className='font-semibold text-gray-800'>
                {formatearFecha(data.fechaIngreso)}
              </div>
            </div>
          </div>

          <div className='flex items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500'>
            <FaCalendarAlt className='text-purple-500 mr-3' />
            <div className='flex-1'>
              <div className='text-sm text-purple-600'>Entrega Estimada</div>
              <div className='font-semibold text-gray-800'>
                {formatearFecha(data.fechaEstimadaEntrega)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Estadísticas de tiempo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className='space-y-4'
        >
          <h3 className='font-semibold text-gray-800 mb-3'>Tiempo en Taller</h3>

          <div className='grid grid-cols-1 gap-3'>
            <div className='text-center bg-orange-50 p-4 rounded-lg border border-orange-200'>
              <FaClock className='text-orange-500 text-2xl mx-auto mb-2' />
              <div className='text-2xl font-bold text-orange-600'>
                {calcularDiasEnTaller()}
              </div>
              <div className='text-sm text-orange-700'>
                {calcularDiasEnTaller() === 1
                  ? 'día en taller'
                  : 'días en taller'}
              </div>
            </div>

            {calcularDiasRestantes() > 0 && (
              <div className='text-center bg-green-50 p-4 rounded-lg border border-green-200'>
                <FaClock className='text-green-500 text-2xl mx-auto mb-2' />
                <div className='text-2xl font-bold text-green-600'>
                  {calcularDiasRestantes()}
                </div>
                <div className='text-sm text-green-700'>
                  {calcularDiasRestantes() === 1
                    ? 'día restante'
                    : 'días restantes'}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Acciones rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className='space-y-3'
        >
          <h3 className='font-semibold text-gray-800 mb-3'>Acciones</h3>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full flex items-center justify-center bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'
          >
            <FaDownload className='mr-2' />
            Descargar Reporte PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full flex items-center justify-center bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors'
          >
            <FaCar className='mr-2' />
            Compartir Seguimiento
          </motion.button>
        </motion.div>

        {/* Código QR o enlace directo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className='bg-gray-50 p-4 rounded-lg text-center'
        >
          <div className='text-sm text-gray-600 mb-2'>
            Enlace de seguimiento:
          </div>
          <div className='bg-white p-2 rounded border text-xs text-gray-500 break-all'>
            {typeof window !== 'undefined'
              ? window.location.href
              : `gtm.com/seguimiento/${data.patente}`}
          </div>
          <div className='text-xs text-gray-500 mt-2'>
            Guardá este enlace para consultar el estado en cualquier momento
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
