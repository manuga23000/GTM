// components/sections/Seguimiento/SeguimientoHeader.tsx
'use client'
import { motion } from 'framer-motion'
import { FaCar, FaCalendarAlt, FaUser } from 'react-icons/fa'
import Image from 'next/image'

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
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
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

      <div className='relative max-w-7xl mx-auto px-4 py-8'>
        <div className='flex items-center mb-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='mr-4'
          >
            <Image
              src='/images/header/LOGO GTM.png'
              alt='GTM Logo'
              width={50}
              height={50}
              className='h-12 w-auto'
            />
          </motion.div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>
              Seguimiento de Vehículo
            </h1>
            <p className='text-gray-300'>GTM - Tu aliado automotriz</p>
          </div>
        </div>

        {/* Info principal del vehículo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'
        >
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Patente destacada */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className='text-center md:text-left'
            >
              <div className='inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-xl font-bold tracking-wider'>
                <FaCar className='mr-2' />
                {data.patente}
              </div>
              <p className='text-gray-300 mt-2 text-sm'>Patente del vehículo</p>
            </motion.div>

            {/* Info del vehículo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='text-center md:text-left'
            >
              <h3 className='text-xl font-semibold mb-1'>
                {data.marca} {data.modelo}
              </h3>
              <p className='text-gray-300 text-sm mb-3'>Año {data.año}</p>
              <div className='flex items-center justify-center md:justify-start text-gray-300 text-sm'>
                <FaUser className='mr-2' />
                {data.cliente}
              </div>
            </motion.div>

            {/* Fecha de ingreso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='text-center md:text-right'
            >
              <div className='inline-flex items-center bg-gray-700 text-white px-4 py-2 rounded-lg'>
                <FaCalendarAlt className='mr-2' />
                <div>
                  <div className='text-sm text-gray-300'>Ingreso</div>
                  <div className='font-semibold'>
                    {formatearFecha(data.fechaIngreso)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}
