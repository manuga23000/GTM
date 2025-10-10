'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

interface FluidLevel {
  aceite: number
  agua: number
  frenos: number
}

interface FluidConfigProps {
  initialLevels?: FluidLevel
  onSave: (levels: FluidLevel) => void
}

const FluidIndicatorEdit = ({
  type,
  level,
  imagePath,
  color,
  onLevelChange,
}: {
  type: 'aceite' | 'agua' | 'frenos'
  level: number
  imagePath: string
  color: string
  onLevelChange: (value: number) => void
}) => {
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
    if (level >= 80) return { text: 'Óptimo', color: 'text-green-400' }
    if (level >= 40) return { text: 'Medio', color: 'text-yellow-400' }
    return { text: 'Bajo', color: 'text-red-400' }
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
        <div className='text-xs sm:text-sm font-semibold text-gray-200'>
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
          {/* Fondo del tanque (gris oscuro) */}
          <rect
            x='20'
            y='10'
            width='40'
            height='90'
            rx='5'
            fill='#374151'
            stroke='#6b7280'
            strokeWidth='2'
          />

          {/* Nivel del fluido (animado) */}
          <motion.rect
            x='22'
            width='36'
            rx='3'
            fill={color}
            initial={{ y: 98, height: 0 }}
            animate={{
              y: 98 - (86 * level) / 100,
              height: (86 * level) / 100,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Marcas de nivel */}
          {[75, 50, 25].map(mark => (
            <g key={mark}>
              <line
                x1='15'
                y1={12 + 86 - (86 * mark) / 100}
                x2='20'
                y2={12 + 86 - (86 * mark) / 100}
                stroke='#9ca3af'
                strokeWidth='1'
              />
              <line
                x1='60'
                y1={12 + 86 - (86 * mark) / 100}
                x2='65'
                y2={12 + 86 - (86 * mark) / 100}
                stroke='#9ca3af'
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
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2'
          style={{ borderColor: color }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className='text-sm font-bold text-white'>{level}%</span>
        </motion.div>
      </div>

      {/* Estado */}
      <div className={`text-xs font-semibold mt-2 ${status.color}`}>
        {status.text}
      </div>

      {/* Slider de control */}
      <div className='mt-4 w-full'>
        <input
          type='range'
          min='0'
          max='100'
          step='5'
          value={level}
          onChange={e => onLevelChange(Number(e.target.value))}
          className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider'
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${level}%, #374151 ${level}%, #374151 100%)`,
          }}
        />
        <div className='flex justify-between mt-1 text-xs text-gray-400'>
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Input numérico */}
      <div className='mt-2 w-full'>
        <input
          type='number'
          min='0'
          max='100'
          value={level}
          onChange={e => {
            const val = Math.max(0, Math.min(100, Number(e.target.value)))
            onLevelChange(val)
          }}
          className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-blue-500'
        />
      </div>
    </motion.div>
  )
}

export default function FluidConfig({
  initialLevels = { aceite: 100, agua: 100, frenos: 100 },
  onSave,
}: FluidConfigProps) {
  const [levels, setLevels] = useState<FluidLevel>(initialLevels)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(levels)
      // Aquí podrías mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al guardar niveles:', error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLevels({ aceite: 100, agua: 100, frenos: 100 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className='bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4 sm:p-6'
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-900/30 rounded-lg border border-blue-500/30'>
            <svg
              className='w-5 h-5 text-blue-400'
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
          <div>
            <h3 className='text-lg sm:text-xl font-semibold text-white'>
              Configurar Niveles de Fluidos
            </h3>
            <p className='text-xs text-gray-400 mt-1'>
              Ajusta los niveles para este vehículo
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores editables */}
      <div className='grid grid-cols-3 gap-4 sm:gap-8 mb-6'>
        <FluidIndicatorEdit
          type='aceite'
          level={levels.aceite}
          imagePath='/images/fluids/BOTTLEA.png'
          color='#652e06'
          onLevelChange={value =>
            setLevels(prev => ({ ...prev, aceite: value }))
          }
        />
        <FluidIndicatorEdit
          type='agua'
          level={levels.agua}
          imagePath='/images/fluids/BOTTLEC.png'
          color='#0f89da'
          onLevelChange={value => setLevels(prev => ({ ...prev, agua: value }))}
        />
        <FluidIndicatorEdit
          type='frenos'
          level={levels.frenos}
          imagePath='/images/fluids/BOTTLEB.png'
          color='#ad1869'
          onLevelChange={value =>
            setLevels(prev => ({ ...prev, frenos: value }))
          }
        />
      </div>

      {/* Botones de acción */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className='flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2'
        >
          <span>🔄</span>
          <span>Resetear (100%)</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2'
        >
          {isSaving ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Guardar Cambios</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Nota informativa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='mt-6 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30'
      >
        <p className='text-xs sm:text-sm text-yellow-200 flex items-start gap-2'>
          <span className='text-base'>💡</span>
          <span>
            Los niveles configurados aquí se mostrarán al cliente en su panel de
            seguimiento. Ajústalos según la inspección realizada durante el
            servicio.
          </span>
        </p>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #1f2937;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #1f2937;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </motion.div>
  )
}
