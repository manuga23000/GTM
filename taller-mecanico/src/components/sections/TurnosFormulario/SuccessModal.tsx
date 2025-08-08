'use client'
import { motion } from 'framer-motion'

interface SuccessModalProps {
  isOpen: boolean
  onGoHome: () => void
}

export default function SuccessModal({
  isOpen,
  onGoHome
}: SuccessModalProps) {
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
          {/* Ícono de éxito */}
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

          {/* Título */}
          <h3 className='text-base font-bold text-white mb-1'>
            ¡Turno Creado!
          </h3>

          {/* Mensaje */}
          <p className='text-gray-300 mb-2'>
            Tu turno fue enviado correctamente. Te enviamos un email con los
            detalles.
          </p>

          {/* Datos de pago */}
          <div className='bg-green-900/60 border border-green-400 rounded-lg p-3 mb-4 flex flex-col items-center'>
            <a
              href='https://wa.me/5493364694921?text=Hola%2C%20adjunto%20el%20comprobante%20de%20la%20se%C3%B1a%20para%20mi%20turno.'
              target='_blank'
              rel='noopener noreferrer'
              className='mb-2 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition-colors duration-300 text-xs'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.21-1.61A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.77 0-3.5-.46-5.01-1.33l-.36-.21-3.68.95.98-3.58-.23-.37A9.96 9.96 0 0 1 2 12C2 6.48 6.48 2 12 2c2.54 0 4.93.99 6.73 2.77A9.93 9.93 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.27-7.73c-.27-.13-1.61-.8-1.86-.89-.25-.09-.43-.13-.61.13-.18.26-.7.89-.86 1.07-.16.18-.32.19-.59.06-.27-.13-1.14-.42-2.17-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01s-.51.07-.78.34c-.27.27-1.02 1-.99 2.43.04 1.43 1.05 2.81 1.19 3 .14.19 2.09 3.19 5.08 4.35.71.24 1.26.38 1.69.49.71.18 1.36.16 1.87.1.57-.07 1.61-.66 1.84-1.3.23-.64.23-1.19.16-1.3-.07-.11-.24-.18-.51-.31z' />
              </svg>
              Enviar comprobante por WhatsApp
            </a>
            <div className='w-full bg-gray-900/60 border border-gray-600 rounded-lg p-2 text-gray-100 text-xs text-left'>
              <div className='mb-1'>
                <b>Monto:</b> $50000
              </div>
              <div className='mb-1'>
                <b>Alias:</b> tallergrandoli2
              </div>
              <div>
                <b>Nombre/Razón social:</b> MARTIN HUMBERTO GRANDOLI
              </div>
            </div>
          </div>

          {/* Recordatorio de horario */}
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
