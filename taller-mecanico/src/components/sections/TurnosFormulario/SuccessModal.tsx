'use client'
import { motion } from 'framer-motion'

interface SuccessModalProps {
  isOpen: boolean
  onGoHome: () => void
  onNewTurno: () => void
}

export default function SuccessModal({
  isOpen,
  onGoHome,
  onNewTurno,
}: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700'
      >
        <div className='text-center'>
          {/* Ícono de éxito */}
          <div className='mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          {/* Título */}
          <h3 className='text-2xl font-bold text-white mb-4'>
            ¡Turno Creado Exitosamente!
          </h3>

          {/* Mensaje */}
          <p className='text-gray-300 mb-8'>
            Tu solicitud de turno ha sido enviada correctamente. Nos pondremos
            en contacto contigo pronto para confirmar los detalles.
          </p>

          {/* Recordatorio de horario */}
          <div className='bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-8'>
            <p className='text-blue-300 text-sm'>
              <strong>Recordatorio:</strong> El horario para traer el auto es de
              8:00 a 8:30
            </p>
          </div>

          {/* Botones */}
          <div className='space-y-4'>
            <button
              onClick={onGoHome}
              className='w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 cursor-pointer'
            >
              Volver al Inicio
            </button>
            <button
              onClick={onNewTurno}
              className='w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 cursor-pointer'
            >
              Solicitar Otro Turno
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
