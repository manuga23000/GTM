'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import {
  createFluidChangeStep,
  createInitialFluidInspection,
  hasFluidChanges,
} from '@/actions/vehicle'
import { Droplets, Search, Wrench, Save, RotateCcw, Lightbulb, CheckCircle2, XCircle } from 'lucide-react'

interface FluidLevel {
  aceite: number
  agua: number
  frenos: number
}

interface FluidConfigProps {
  plateNumber: string
  initialLevels?: FluidLevel
  isFirstTime?: boolean
  onSave: (levels: FluidLevel) => Promise<void>
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
      case 'aceite': return 'Aceite Motor'
      case 'agua': return 'Refrigerante'
      case 'frenos': return 'Líq. Frenos'
    }
  }

  const getStatus = () => {
    if (level >= 80) return { text: 'Óptimo', color: 'text-emerald-400' }
    if (level >= 40) return { text: 'Medio', color: 'text-amber-400' }
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
        animate={{ y: isHovered ? -5 : 0, scale: isHovered ? 1.05 : 1 }}
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
        <div className='text-xs sm:text-sm font-semibold text-zinc-200'>
          {getLabel()}
        </div>
      </div>

      {/* Tanque SVG */}
      <div className='relative'>
        <svg width='80' height='120' viewBox='0 0 80 120' className='drop-shadow-md'>
          <rect x='20' y='10' width='40' height='90' rx='5' fill='#27272a' stroke='#52525b' strokeWidth='2' />
          <motion.rect
            x='22'
            width='36'
            rx='3'
            fill={color}
            initial={{ y: 98, height: 0 }}
            animate={{ y: 98 - (86 * level) / 100, height: (86 * level) / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {[75, 50, 25].map(mark => (
            <g key={mark}>
              <line x1='15' y1={12 + 86 - (86 * mark) / 100} x2='20' y2={12 + 86 - (86 * mark) / 100} stroke='#71717a' strokeWidth='1' />
              <line x1='60' y1={12 + 86 - (86 * mark) / 100} x2='65' y2={12 + 86 - (86 * mark) / 100} stroke='#71717a' strokeWidth='1' />
            </g>
          ))}
          <rect x='15' y='5' width='50' height='8' rx='2' fill='#3f3f46' stroke='#27272a' strokeWidth='1' />
        </svg>

        {/* Porcentaje flotante */}
        <motion.div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-950/90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2'
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

      {/* Slider */}
      <div className='mt-4 w-full'>
        <input
          type='range'
          min='0'
          max='100'
          step='5'
          value={level}
          onChange={e => onLevelChange(Number(e.target.value))}
          className='w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider'
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${level}%, #3f3f46 ${level}%, #3f3f46 100%)`,
          }}
        />
        <div className='flex justify-between mt-1 text-xs text-zinc-500'>
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
          className='w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-center font-semibold focus:outline-none focus:border-amber-500/50'
        />
      </div>
    </motion.div>
  )
}

export default function FluidConfig({
  plateNumber,
  initialLevels = { aceite: 100, agua: 100, frenos: 100 },
  isFirstTime = false,
  onSave,
}: FluidConfigProps) {
  const [levels, setLevels] = useState<FluidLevel>(initialLevels)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await onSave(levels)
      setSaveMessage({ type: 'success', text: 'Niveles guardados correctamente' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error al guardar niveles:', error)
      setSaveMessage({ type: 'error', text: 'Error al guardar los cambios' })
      setTimeout(() => setSaveMessage(null), 3000)
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
      className='bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-lg p-4 sm:p-6'
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-amber-500/20 rounded-xl border border-amber-500/30'>
            <Droplets className='w-5 h-5 text-amber-400' strokeWidth={2} />
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold text-white flex items-center gap-2'>
              {isFirstTime ? (
                <><Search className='w-4 h-4 text-amber-400' strokeWidth={2} /> Inspección Inicial de Fluidos</>
              ) : (
                <><Wrench className='w-4 h-4 text-amber-400' strokeWidth={2} /> Actualizar Niveles de Fluidos</>
              )}
            </h3>
            <p className='text-xs text-zinc-500 mt-0.5'>
              {isFirstTime
                ? 'Configura los niveles detectados al ingreso'
                : 'Actualiza los niveles después del servicio'}
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
          onLevelChange={value => setLevels(prev => ({ ...prev, aceite: value }))}
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
          onLevelChange={value => setLevels(prev => ({ ...prev, frenos: value }))}
        />
      </div>

      {/* Mensaje de guardado */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-4 p-3 rounded-xl border flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200'
              : 'bg-red-900/20 border-red-500/30 text-red-200'
          }`}
        >
          {saveMessage.type === 'success'
            ? <CheckCircle2 className='w-4 h-4 text-emerald-400 shrink-0' strokeWidth={2} />
            : <XCircle className='w-4 h-4 text-red-400 shrink-0' strokeWidth={2} />}
          <p className='text-sm'>{saveMessage.text}</p>
        </motion.div>
      )}

      {/* Botones de acción */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className='flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2'
        >
          <RotateCcw className='w-4 h-4' strokeWidth={2} />
          <span>Resetear (100%)</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className='flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-900/20'
        >
          {isSaving ? (
            <>
              <div className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className='w-4 h-4' strokeWidth={2.2} />
              <span>Guardar y Registrar</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Nota informativa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='mt-5 bg-amber-500/8 p-3 rounded-xl border border-amber-500/20'
      >
        <p className='text-xs sm:text-sm text-amber-200 flex items-start gap-2'>
          <Lightbulb className='w-4 h-4 text-amber-400 shrink-0 mt-0.5' strokeWidth={2} />
          <span>
            {isFirstTime
              ? 'Al guardar, se creará automáticamente un registro de inspección inicial en el paso a paso del cliente.'
              : 'Los cambios se registrarán automáticamente en el paso a paso, mostrando el antes y después de los niveles.'}
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
          border: 3px solid #09090b;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #09090b;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </motion.div>
  )
}
