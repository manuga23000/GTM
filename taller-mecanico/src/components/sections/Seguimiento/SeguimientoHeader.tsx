// components/sections/Seguimiento/SeguimientoHeader.tsx
'use client'
import { motion } from 'framer-motion'
import { FaCar, FaCalendarAlt, FaUser } from 'react-icons/fa'

interface SeguimientoHeaderProps {
  data: {
    patente: string
    modelo: string
    marca: string
    año: string
    cliente: string
    fechaIngreso: string
  }
}

export default function SeguimientoHeader({ data }: SeguimientoHeaderProps) {
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatearFechaCompleta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden'
    >
      {/* Patrón de fondo */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className='relative max-w-7xl mx-auto px-4 py-3 md:py-6'>
        <div className='mb-3 mt-3 md:mb-4'>
          <h1 className='text-xl text-center md:text-2xl lg:text-3xl font-bold'>
            Seguimiento de Vehículo
          </h1>
        </div>

        {/* Info principal del vehículo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20'
        >
          {/* Layout mobile: patente centrada arriba */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className='text-center mb-3 md:hidden'
          >
            <div className='inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-xl font-bold tracking-wider'>
              <FaCar className='mr-2 text-lg' />
              {data.patente}
            </div>
          </motion.div>

          {/* Layout desktop: grid de 3 columnas */}
          <div className='hidden md:grid md:grid-cols-3 gap-4 items-center'>
            {/* Patente */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className='text-center md:text-left'
            >
              <div className='inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg text-2xl font-bold tracking-wider'>
                <FaCar className='mr-3 text-xl' />
                {data.patente}
              </div>
            </motion.div>

            {/* Info del vehículo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='text-center'
            >
              <h3 className='text-xl font-bold mb-1'>
                {data.marca} {data.modelo}
              </h3>
              <p className='text-gray-300 text-base mb-2'>Año {data.año}</p>
              <div className='flex items-center justify-center text-gray-300'>
                <FaUser className='mr-2 text-sm' />
                <span className='font-medium text-base'>{data.cliente}</span>
              </div>
            </motion.div>

            {/* Fecha de ingreso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='text-center md:text-right'
            >
              <div className='inline-flex items-center bg-gray-700 text-white px-4 py-3 rounded-lg'>
                <FaCalendarAlt className='mr-3 text-base' />
                <div>
                  <div className='text-sm text-gray-300 mb-1'>
                    Fecha de Ingreso
                  </div>
                  <div className='font-bold text-base'>
                    {formatearFecha(data.fechaIngreso)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Layout mobile: info del vehículo y fecha */}
          <div className='grid grid-cols-1 gap-3 md:hidden'>
            {/* Info del vehículo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='text-center'
            >
              <h3 className='text-lg font-bold mb-1'>
                {data.marca} {data.modelo}
              </h3>
              <p className='text-gray-300 text-sm mb-2'>Año {data.año}</p>
              <div className='flex items-center justify-center text-gray-300'>
                <FaUser className='mr-2 text-sm' />
                <span className='font-medium text-sm'>{data.cliente}</span>
              </div>
            </motion.div>

            {/* Fecha de ingreso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='text-center'
            >
              <div className='inline-flex items-center bg-gray-700 text-white px-3 py-2 rounded-lg'>
                <FaCalendarAlt className='mr-2 text-sm' />
                <div>
                  <div className='text-xs text-gray-300 mb-1'>
                    Fecha de Ingreso
                  </div>
                  <div className='font-bold text-sm'>
                    {formatearFecha(data.fechaIngreso)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Barra separadora roja */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className='mt-3 md:mt-4 h-1 bg-gradient-to-r from-red-600 to-red-600 rounded-full'
          />
        </motion.div>

        {/* Indicador de estado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className='flex justify-center mt-1 md:mt-2'
        ></motion.div>
      </div>
    </motion.header>
  )
}
