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
import VehicleConfig from './VehicleConfig'
import ExpenseManager from './ExpenseManager'
import Link from 'next/link'
import {
  CalendarDays,
  BarChart2,
  Settings2,
  Car,
  Wallet,
  Calculator,
  LogOut,
  CheckCircle2,
  Wrench,
} from 'lucide-react'

const tabs = [
  { id: 'turnos',   label: 'Turnos',  Icon: CalendarDays },
  { id: 'stats',    label: 'Stats',   Icon: BarChart2    },
  { id: 'config',   label: 'Config',  Icon: Settings2    },
  { id: 'vehicles', label: 'Autos',   Icon: Car          },
  { id: 'expenses', label: 'Gastos',  Icon: Wallet       },
] as const

type TabId = (typeof tabs)[number]['id']

export default function AdminDashboard() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('turnos')
  const [message, setMessage] = useState('')

  const handleLogout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
  }

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const loadTurnos = async () => {
    try {
      setLoading(true)
      const turnosData = await getAllTurnos()
      setTurnos(turnosData)
    } catch (error) {
      console.error('Error loading turnos:', error)
      showMessage('Error al cargar los turnos')
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
        showMessage(result.message)
        await loadTurnos()
      } else {
        showMessage(result.message)
      }
    } catch {
      showMessage('Error al actualizar el turno')
    }
  }

  const handleDeleteTurno = async (turnoId: string) => {
    try {
      const result = await deleteTurno(turnoId)
      if (result.success) {
        showMessage(result.message)
        await loadTurnos()
      } else {
        showMessage(result.message)
      }
    } catch {
      showMessage('Error al eliminar el turno')
    }
  }

  useEffect(() => {
    loadTurnos()
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] } },
  }

  const tabContentVariants: Variants = {
    hidden:  { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.4, 0.0, 0.2, 1] } },
    exit:    { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.2, ease: [0.4, 0.0, 1, 1] } },
  }

  const messageVariants: Variants = {
    hidden:  { opacity: 0, y: -24, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    exit:    { opacity: 0, y: -24, scale: 0.92, transition: { duration: 0.25 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='w-full max-w-7xl mx-auto p-3 sm:p-5 md:p-8 rounded-2xl shadow-2xl bg-zinc-950/90 backdrop-blur-xl border border-amber-500/10'
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 sm:mb-8 gap-3'
      >
        <div className='flex items-center gap-3'>
          {/* Logo badge */}
          <div className='relative p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 shadow-lg shadow-amber-900/20'>
            <Wrench className='w-5 h-5 sm:w-6 sm:h-6 text-amber-400' strokeWidth={1.8} />
            {/* Glow dot */}
            <span className='absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400'/>
          </div>
          <div>
            <h1 className='text-base sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight'>
              Panel de Administración
            </h1>
            <p className='text-xs text-zinc-500 hidden sm:block'>GTM · Grandoli Taller Mecánico</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex items-center gap-2 sm:gap-3'>
          <Link href='/admin/presupuesto'>
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.95 }}
              aria-label='Calculadora de Presupuestos'
              title='Calculadora de Presupuestos'
              className='bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold p-2.5 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg shadow-amber-900/40 border border-amber-400/40'
            >
              <Calculator className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2.2} />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            aria-label='Cerrar sesión'
            className='bg-red-600/80 hover:bg-red-500 text-white p-2.5 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg shadow-red-900/40 border border-red-500/30'
          >
            <LogOut className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2} />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Divider with accent ── */}
      <div className='h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-5 sm:mb-7' />

      {/* ── Toast message ── */}
      <AnimatePresence>
        {message && (
          <motion.div
            variants={messageVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='mb-4 sm:mb-5 p-3 sm:p-4 bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-xl shadow-lg flex items-center gap-3 text-sm sm:text-base'
          >
            <CheckCircle2 className='w-4 h-4 text-amber-400 flex-shrink-0' strokeWidth={2} />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='flex flex-col sm:flex-row mb-6 sm:mb-8 bg-zinc-900/80 rounded-xl p-1.5 shadow-inner gap-1 sm:gap-1 border border-zinc-800'
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-lg font-semibold text-center transition-all duration-300 relative overflow-hidden text-xs sm:text-sm ${
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-zinc-900 shadow-lg shadow-amber-900/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.02, y: isActive ? 0 : -1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.07, type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Shimmer on active */}
              {isActive && (
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: [0.4, 0.0, 0.2, 1] }}
                />
              )}

              {isActive && (
                <motion.div
                  layoutId='activeTabIndicator'
                  className='absolute bottom-0 left-3 right-3 h-0.5 bg-zinc-900/50 rounded-full'
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <span className='relative z-10 flex items-center justify-center gap-1.5 sm:gap-2'>
                <motion.span animate={{ scale: isActive ? 1.15 : 1 }} transition={{ duration: 0.25 }}>
                  <tab.Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                </motion.span>
                <span>{tab.label}</span>
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* ── Tab content ── */}
      <div className='min-h-[300px] sm:min-h-[600px]'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            {activeTab === 'turnos'   && <TurnosTable turnos={turnos} loading={loading} onStatusUpdate={handleStatusUpdate} onDelete={handleDeleteTurno} onRefresh={loadTurnos} />}
            {activeTab === 'stats'    && <AdminStats turnos={turnos} />}
            {activeTab === 'config'   && <ServiceConfig />}
            {activeTab === 'vehicles' && <VehicleConfig />}
            {activeTab === 'expenses' && <ExpenseManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
