'use client'
import { useState } from 'react'
import { Turno } from '@/actions/types/types'

interface TurnosTableProps {
  turnos: Turno[]
  loading: boolean
  onStatusUpdate: (
    turnoId: string,
    status: 'pending' | 'cancelled' | 'completed' | 'reprogrammed'
  ) => void
  onDelete: (turnoId: string) => void
  onRefresh: () => void
}

export default function TurnosTable({
  turnos,
  loading,
  onStatusUpdate,
  onDelete,
  onRefresh,
}: TurnosTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [turnoToDelete, setTurnoToDelete] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-yellow-900'
      case 'cancelled':
        return 'bg-red-500 text-white'
      case 'completed':
        return 'bg-green-500 text-white'
      case 'reprogrammed':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelado'
      case 'completed':
        return 'Completado'
      case 'reprogrammed':
        return 'Reprogramado'
      default:
        return status
    }
  }

  const filteredTurnos = turnos.filter(turno => {
    const matchesStatus =
      filterStatus === 'all' || turno.status === filterStatus
    const matchesSearch =
      turno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.phone.includes(searchTerm) ||
      turno.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.service.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sin fecha'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDeleteClick = (turnoId: string) => {
    setTurnoToDelete(turnoId)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (turnoToDelete) {
      onDelete(turnoToDelete)
      setShowDeleteModal(false)
      setTurnoToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setTurnoToDelete(null)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <input
            type='text'
            placeholder='Buscar por nombre, email, teléfono, vehículo o servicio...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-text'
          />
        </div>
        <div className='flex gap-2'>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className='p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer'
          >
            <option value='all'>Todos los estados</option>
            <option value='pending'>Pendientes</option>
            <option value='cancelled'>Cancelados</option>
            <option value='completed'>Completados</option>
            <option value='reprogrammed'>Reprogramados</option>
          </select>
          <button
            onClick={onRefresh}
            className='px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer'
          >
            🔄
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-gray-800 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-white'>{turnos.length}</div>
          <div className='text-gray-400 text-sm'>Total turnos</div>
        </div>
        <div className='bg-yellow-600 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-white'>
            {turnos.filter(t => t.status === 'pending').length}
          </div>
          <div className='text-yellow-100 text-sm'>Pendientes</div>
        </div>
        <div className='bg-green-600 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-white'>
            {turnos.filter(t => t.status === 'completed').length}
          </div>
          <div className='text-green-100 text-sm'>Completados</div>
        </div>
        <div className='bg-purple-600 p-4 rounded-lg'>
          <div className='text-2xl font-bold text-white'>
            {turnos.filter(t => t.status === 'reprogrammed').length}
          </div>
          <div className='text-purple-100 text-sm'>Reprogramados</div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full bg-gray-800 rounded-lg overflow-hidden'>
          <thead className='bg-gray-900'>
            <tr>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Cliente
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Contacto
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Vehículo
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Servicio
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Fecha
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Estado
              </th>
              <th className='px-4 py-3 text-left text-white font-medium'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-700'>
            {filteredTurnos.map(turno => (
              <tr
                key={turno.id}
                className='hover:bg-gray-700 transition-colors'
              >
                <td className='px-4 py-3'>
                  <div>
                    <div className='font-medium text-white'>{turno.name}</div>
                    <div className='text-sm text-gray-400'>
                      {new Date(turno.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div>
                    <div className='text-white'>{turno.email}</div>
                    <div className='text-sm text-gray-400'>{turno.phone}</div>
                  </div>
                </td>
                <td className='px-4 py-3 text-white'>{turno.vehicle}</td>
                <td className='px-4 py-3'>
                  <div>
                    <div className='text-white'>{turno.service}</div>
                    {turno.subService && (
                      <div className='text-sm text-gray-400'>
                        {turno.subService}
                      </div>
                    )}
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div className='text-white'>{formatDate(turno.date)}</div>
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      turno.status
                    )}`}
                  >
                    {getStatusText(turno.status)}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex space-x-2'>
                    <select
                      value={turno.status}
                      onChange={e =>
                        onStatusUpdate(turno.id!, e.target.value as any)
                      }
                      className='px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                    >
                      <option value='pending'>Pendiente</option>
                      <option value='cancelled'>Cancelado</option>
                      <option value='completed'>Completado</option>
                      <option value='reprogrammed'>Reprogramado</option>
                    </select>
                    <button
                      onClick={() => handleDeleteClick(turno.id!)}
                      className='px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors cursor-pointer'
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTurnos.length === 0 && (
        <div className='text-center py-8 text-gray-400'>
          No se encontraron turnos que coincidan con los filtros.
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4'>
            <h3 className='text-xl font-bold text-white mb-4'>
              Confirmar eliminación
            </h3>
            <p className='text-gray-300 mb-6'>
              ¿Estás seguro de que quieres eliminar este turno? Esta acción no
              se puede deshacer.
            </p>
            <div className='flex space-x-4'>
              <button
                onClick={handleConfirmDelete}
                className='flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 cursor-pointer'
              >
                Eliminar
              </button>
              <button
                onClick={handleCancelDelete}
                className='flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 cursor-pointer'
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
