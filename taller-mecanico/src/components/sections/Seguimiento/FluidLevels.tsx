'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

interface FluidIndicatorProps {
  type: 'aceite' | 'agua' | 'frenos'
  level: number
  imagePath: string
  color: string
}

const FluidIndicator = ({
  type,
  level,
  imagePath,
  color,
}: FluidIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getLabel = () => {
    switch (type) {
      case 'aceite':
        return 'Aceite Motor'
      case 'agua':
        return 'Refrigerante'
      case 'frenos':
        return 'Líq. Frenos'
    }
  }

  const getStatus = () => {
    if (level >= 80) return { text: 'Óptimo', color: 'text-green-600' }
    if (level >= 40) return { text: 'Medio', color: 'text-yellow-600' }
    return { text: 'Bajo', color: 'text-red-600' }
  }
  const status = getStatus()

  return (
    <motion.div
      className='relative flex flex-col items-center'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Imagen del producto */}
      <motion.div
        className='mb-3'
        animate={{
          y: isHovered ? -5 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className='relative w-16 h-20 sm:w-20 sm:h-24'>
          <Image
            src={imagePath}
            alt={getLabel()}
            fill
            className='object-contain drop-shadow-lg'
            priority
          />
        </div>
      </motion.div>

      {/* Label */}
      <div className='text-center mb-2'>
        <div className='text-xs sm:text-sm font-semibold text-gray-700'>
          {getLabel()}
        </div>
      </div>

      {/* Contenedor del tanque */}
      <div className='relative'>
        <svg
          width='80'
          height='120'
          viewBox='0 0 80 120'
          className='drop-shadow-md'
        >
          {/* Fondo del tanque (gris) */}
          <rect
            x='20'
            y='10'
            width='40'
            height='90'
            rx='5'
            fill='#e5e7eb'
            stroke='#9ca3af'
            strokeWidth='2'
          />

          {/* Nivel del fluido (animado) */}
          <motion.rect
            x='22'
            y={12 + (86 - (86 * level) / 100)}
            width='36'
            height={(86 * level) / 100}
            rx='3'
            fill={color}
            initial={{ height: 0 }}
            animate={{ height: (86 * level) / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Marcas de nivel */}
          {[75, 50, 25].map(mark => (
            <g key={mark}>
              <line
                x1='15'
                y1={12 + 86 - (86 * mark) / 100}
                x2='20'
                y2={12 + 86 - (86 * mark) / 100}
                stroke='#6b7280'
                strokeWidth='1'
              />
              <line
                x1='60'
                y1={12 + 86 - (86 * mark) / 100}
                x2='65'
                y2={12 + 86 - (86 * mark) / 100}
                stroke='#6b7280'
                strokeWidth='1'
              />
            </g>
          ))}

          {/* Tapa del tanque */}
          <rect
            x='15'
            y='5'
            width='50'
            height='8'
            rx='2'
            fill='#4b5563'
            stroke='#374151'
            strokeWidth='1'
          />
        </svg>

        {/* Porcentaje flotante */}
        <motion.div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2'
          style={{ borderColor: color }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className='text-sm font-bold text-gray-800'>{level}%</span>
        </motion.div>
      </div>

      {/* Estado */}
      <div className={`text-xs font-semibold mt-2 ${status.color}`}>
        {status.text}
      </div>
    </motion.div>
  )
}

interface FluidLevelsProps {
  aceite?: number
  agua?: number
  frenos?: number
}

export default function FluidLevels({
  aceite = 100,
  agua = 100,
  frenos = 100,
}: FluidLevelsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className='bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8'
    >
      {/* Header */}
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
              d='M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
            />
          </svg>
        </div>
        <h3 className='text-lg sm:text-xl font-semibold text-gray-800'>
          Control de Fluidos
        </h3>
      </div>

      {/* Indicadores */}
      <div className='grid grid-cols-3 gap-4 sm:gap-8'>
        <FluidIndicator
          type='aceite'
          level={aceite}
          imagePath='/images/fluids/BOTTLEA.png'
          color='#652e06'
        />
        <FluidIndicator
          type='agua'
          level={agua}
          imagePath='/images/fluids/BOTTLEC.png'
          color='#0f89da'
        />
        <FluidIndicator
          type='frenos'
          level={frenos}
          imagePath='/images/fluids/BOTTLEB.png'
          color='#ad1869'
        />
      </div>

      {/* Nota informativa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className='mt-6 bg-blue-50 p-3 rounded-lg border border-blue-200'
      >
        <p className='text-xs sm:text-sm text-blue-800 flex items-start gap-2'>
          <span className='text-base'>ℹ️</span>
          <span>
            Los niveles de fluidos son verificados durante el servicio. Si algún
            nivel está bajo, nuestro equipo lo completará o te notificará.
          </span>
        </p>
      </motion.div>
    </motion.div>
  )
}
