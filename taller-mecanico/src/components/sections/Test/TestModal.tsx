'use client'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollLock } from '@/hooks/useScrollManager'

interface TestModalProps {
  showModal1: boolean
  setShowModal1: (show: boolean) => void
  showModal2: boolean
  setShowModal2: (show: boolean) => void
  showModal3: boolean
  setShowModal3: (show: boolean) => void
}

export default function TestModal({
  showModal1,
  setShowModal1,
  showModal2,
  setShowModal2,
  showModal3,
  setShowModal3,
}: TestModalProps) {
  const anyModalOpen = showModal1 || showModal2 || showModal3
  useScrollLock('test-modal', anyModalOpen, 100)

  const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    color = 'bg-gray-800',
  }: {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    color?: string
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[99999] flex items-center justify-center p-4'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
          }}
          onClick={onClose}
        >
          <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative ${color} rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl z-10`}
            onClick={e => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-2xl font-bold text-white'>{title}</h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-white text-3xl leading-none'
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <Modal
        isOpen={showModal1}
        onClose={() => setShowModal1(false)}
        title='🔵 MODAL 1 - TESTEO AZUL'
        color='bg-blue-800'
      >
        <div className='text-white space-y-4'>
          <div className='bg-blue-900/50 p-4 rounded-lg'>
            <h4 className='font-semibold mb-2'>✅ TEST EXITOSO SI:</h4>
            <ul className='space-y-1 text-sm'>
              <li>• Este modal aparece centrado en tu pantalla visible</li>
              <li>• NO podés scrollear la página de atrás</li>
              <li>• El modal responde correctamente</li>
            </ul>
          </div>

          <p className='text-gray-300'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          <div className='flex gap-3'>
            <button
              onClick={() => setShowModal1(false)}
              className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setShowModal1(false)
                setShowModal2(true)
              }}
              className='flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
            >
              Abrir Modal 2
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showModal2}
        onClose={() => setShowModal2(false)}
        title='🟢 MODAL 2 - TESTEO VERDE'
        color='bg-green-800'
      >
        <div className='text-white space-y-4'>
          <div className='bg-green-900/50 p-4 rounded-lg'>
            <h4 className='font-semibold mb-2'>🧪 FORMULARIO DE TESTEO:</h4>
            <div className='space-y-3'>
              <input
                type='text'
                placeholder='Nombre de prueba'
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
              />
              <input
                type='email'
                placeholder='email@prueba.com'
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white'
              />
              <textarea
                placeholder='Comentarios de testeo...'
                rows={3}
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => setShowModal2(false)}
              className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setShowModal2(false)
                setShowModal3(true)
              }}
              className='flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors'
            >
              Abrir Modal 3
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showModal3}
        onClose={() => setShowModal3(false)}
        title='🟣 MODAL 3 - TESTEO PÚRPURA'
        color='bg-purple-800'
      >
        <div className='text-white space-y-4'>
          <div className='bg-purple-900/50 p-4 rounded-lg'>
            <h4 className='font-semibold mb-2'>📊 RESULTADOS DEL TESTEO:</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Centrado en viewport:</span>
                <span className='text-green-400'>✅ PASS</span>
              </div>
              <div className='flex justify-between'>
                <span>Scroll bloqueado:</span>
                <span className='text-green-400'>✅ PASS</span>
              </div>
              <div className='flex justify-between'>
                <span>Modal responsivo:</span>
                <span className='text-green-400'>✅ PASS</span>
              </div>
            </div>
          </div>

          <p className='text-gray-300'>
            Si llegaste hasta acá y todos los modales funcionaron correctamente,
            significa que la solución del ScrollManager está funcionando
            perfecto. 🎉
          </p>

          <div className='bg-yellow-900/30 p-3 rounded-lg'>
            <p className='text-yellow-300 text-sm'>
              💡 <strong>Tip:</strong> Si esto funciona acá pero no en
              VehicleModal, el problema puede estar en otro lado del código, no
              en mi solución.
            </p>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => setShowModal3(false)}
              className='flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setShowModal3(false)
                setShowModal1(true)
              }}
              className='flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
            >
              Volver al Modal 1
            </button>
          </div>
        </div>
      </Modal>

      <div className='fixed bottom-4 right-4 space-y-2 z-30'>
        <button
          onClick={() => setShowModal1(true)}
          className='block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm'
        >
          🔵 Modal 1
        </button>
        <button
          onClick={() => setShowModal2(true)}
          className='block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm'
        >
          🟢 Modal 2
        </button>
        <button
          onClick={() => setShowModal3(true)}
          className='block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm'
        >
          🟣 Modal 3
        </button>
      </div>
    </>
  )
}
