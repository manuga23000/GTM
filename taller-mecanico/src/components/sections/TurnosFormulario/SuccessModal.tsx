'use client'
import { motion } from 'framer-motion'

interface SuccessModalProps {
  isOpen: boolean
  onGoHome: () => void
}

export default function SuccessModal({ isOpen, onGoHome }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='bg-gray-800 rounded-xl p-6 max-w-xs w-[95vw] sm:w-full shadow-xl border border-gray-700'
      >
        <div className='text-center space-y-2 text-sm'>
          <div className='mx-auto w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2'>
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

          <h3 className='text-base font-bold text-white mb-1'>
            ¡Turno Creado!
          </h3>

          <p className='text-gray-300 mb-2'>
            Tu turno fue enviado correctamente. Te enviamos un email con los
            detalles.
          </p>

          <div className='space-y-2'>
            <button
              onClick={onGoHome}
              className='w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer text-sm'
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
