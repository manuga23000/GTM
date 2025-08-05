'use client'
import { getAuth, signOut, User } from 'firebase/auth'
import { app } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import { Turno } from '@/actions/types/types'
import { getAllTurnos, updateTurnoStatus, deleteTurno } from '@/actions/turnos'
import TurnosTable from './TurnosTable'
import AdminStats from './AdminStats'
import ServiceConfig from './ServiceConfig'

interface AdminDashboardProps {
  user: User
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
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
        await loadTurnos() // Recargar turnos
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error al actualizar el turno')
    }
  }

  const handleDeleteTurno = async (turnoId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
      try {
        const result = await deleteTurno(turnoId)
        if (result.success) {
          setMessage(result.message)
          await loadTurnos() // Recargar turnos
          setTimeout(() => setMessage(''), 3000)
        } else {
          setMessage(result.message)
        }
      } catch (error) {
        setMessage('Error al eliminar el turno')
      }
    }
  }

  useEffect(() => {
    loadTurnos()
  }, [])

  return (
    <div className='w-full max-w-7xl mx-auto p-8 rounded-xl shadow-2xl bg-black/70 backdrop-blur-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-4xl font-extrabold text-white drop-shadow-lg'>
          Panel de Administración
        </h1>
        <button
          onClick={handleLogout}
          className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer'
        >
          Cerrar sesión
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className='mb-6 p-4 bg-blue-600 text-white rounded-lg'>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className='flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1'>
        <button
          onClick={() => setActiveTab('turnos')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'turnos'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          📋 Turnos
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          📊 Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          ⚙️ Configuración
        </button>
      </div>

      {/* Content */}
      <div className='min-h-[600px]'>
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
      </div>
    </div>
  )
}
