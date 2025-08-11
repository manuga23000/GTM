'use client'
import { getAuth, signOut } from 'firebase/auth'
import { app } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Turno } from '@/actions/types/types'
import { getAllTurnos, updateTurnoStatus, deleteTurno } from '@/actions/turnos'
import TurnosTable from './TurnosTable'
import AdminStats from './AdminStats'
import ServiceConfig from './ServiceConfig'

export default function AdminDashboard() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'turnos' | 'stats' | 'config'>(
    'turnos'
  )
  const [message, setMessage] = useState('')

  const handleLogout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
  }

  const loadTurnos = async () => {
    try {
      setLoading(true)
      const turnosData = await getAllTurnos()
      setTurnos(turnosData)
    } catch (error) {
      console.error('Error loading turnos:', error)
      setMessage('Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (
    turnoId: string,
    status: 'pending' | 'cancelled' | 'completed' | 'reprogrammed'
  ) => {
    try {
      const result = await updateTurnoStatus(turnoId, status)
      if (result.success) {
        setMessage(result.message)
        await loadTurnos()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error al actualizar el turno')
    }
  }

  const handleDeleteTurno = async (turnoId: string) => {
    try {
      const result = await deleteTurno(turnoId)
      if (result.success) {
        setMessage(result.message)
        await loadTurnos()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error al eliminar el turno')
    }
  }

  useEffect(() => {
    loadTurnos()
  }, [])

  // Configuración de animaciones - CORREGIDO
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1], // Bezier curve equivalente a easeInOut
      },
    },
  }

  const tabContentVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1], // Bezier curve equivalente a easeOut
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 1, 1], // Bezier curve equivalente a easeIn
      },
    },
  }

  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='w-full max-w-7xl mx-auto p-8 rounded-xl shadow-2xl bg-black/70 backdrop-blur-md'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='flex justify-between items-center mb-8'
      >
        <h1 className='text-4xl font-extrabold text-white drop-shadow-lg'>
          Panel de Administración
        </h1>
        <motion.button
          whileHover={{
            scale: 1.1,
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          aria-label='Cerrar sesión'
          className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 cursor-pointer flex items-center justify-center shadow-md'
        >
          {/* Icono logout */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='22'
            height='22'
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              fill='currentColor'
              d='M16.3 7.7a1 1 0 0 1 1.4 1.4L16.4 11H21a1 1 0 1 1 0 2h-4.6l1.3 1.9a1 1 0 1 1-1.6 1.2l-3-4.2a1 1 0 0 1 0-1.2l3-4.2ZM13 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V5H7v14h5v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6Z'
            />
          </svg>
        </motion.button>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            variants={messageVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='mb-6 p-4 bg-blue-600 text-white rounded-lg shadow-lg'
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs - ✅ IGUALES EN ANCHO con animaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='flex mb-8 bg-gray-800 rounded-xl p-2 shadow-inner'
      >
        {[
          { id: 'turnos', label: '📋 Turnos', emoji: '📋' },
          { id: 'stats', label: '📊 Estadísticas', emoji: '📊' },
          { id: 'config', label: '⚙️ Configuración', emoji: '⚙️' },
        ].map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as 'turnos' | 'stats' | 'config')
            }
            className={`flex-1 py-4 px-6 rounded-lg font-semibold text-center transition-all duration-300 relative overflow-hidden ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            whileHover={{
              scale: activeTab === tab.id ? 1 : 1.02,
              y: activeTab === tab.id ? 0 : -2,
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.3 + index * 0.1,
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            {/* Efecto de brillo cuando está activo */}
            {activeTab === tab.id && (
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              />
            )}

            {/* Indicador activo */}
            {activeTab === tab.id && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full'
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            <span className='relative z-10 flex items-center justify-center gap-2'>
              <motion.span
                animate={{
                  scale: activeTab === tab.id ? 1.2 : 1,
                  rotate: activeTab === tab.id ? [0, 10, -10, 0] : 0,
                }}
                transition={{
                  duration: 0.3,
                  rotate: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] },
                }}
              >
                {tab.emoji}
              </motion.span>
              <span className='hidden sm:inline'>
                {tab.label.replace(tab.emoji + ' ', '')}
              </span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <div className='min-h-[600px]'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            {activeTab === 'turnos' && (
              <TurnosTable
                turnos={turnos}
                loading={loading}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteTurno}
                onRefresh={loadTurnos}
              />
            )}
            {activeTab === 'stats' && <AdminStats turnos={turnos} />}
            {activeTab === 'config' && <ServiceConfig />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
