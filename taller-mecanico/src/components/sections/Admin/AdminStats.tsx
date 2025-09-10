'use client'
import { Turno } from '@/actions/types/types'

interface AdminStatsProps {
  turnos: Turno[]
}

export default function AdminStats({ turnos }: AdminStatsProps) {
  const getStats = () => {
    const total = turnos.length
    const pending = turnos.filter(t => t.status === 'pending').length
    const cancelled = turnos.filter(t => t.status === 'cancelled').length
    const completed = turnos.filter(t => t.status === 'completed').length
    const reprogrammed = turnos.filter(t => t.status === 'reprogrammed').length

    const serviceStats = turnos.reduce((acc, turno) => {
      const service = turno.subService || turno.service
      acc[service] = (acc[service] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const monthlyStats = turnos.reduce((acc, turno) => {
      const month = new Date(turno.createdAt).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const thisWeek = turnos.filter(turno => {
      const turnoDate = new Date(turno.createdAt)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return turnoDate >= weekAgo
    }).length

    const thisMonth = turnos.filter(turno => {
      const turnoDate = new Date(turno.createdAt)
      const now = new Date()
      return (
        turnoDate.getMonth() === now.getMonth() &&
        turnoDate.getFullYear() === now.getFullYear()
      )
    }).length

    return {
      total,
      pending,
      cancelled,
      completed,
      reprogrammed,
      serviceStats,
      monthlyStats,
      thisWeek,
      thisMonth,
    }
  }

  const stats = getStats()

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl'>
          <div className='text-3xl font-bold text-white'>{stats.total}</div>
          <div className='text-blue-100 text-sm'>Total turnos</div>
        </div>
        <div className='bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl'>
          <div className='text-3xl font-bold text-white'>{stats.pending}</div>
          <div className='text-yellow-100 text-sm'>Pendientes</div>
        </div>
        <div className='bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl'>
          <div className='text-3xl font-bold text-white'>{stats.completed}</div>
          <div className='text-green-100 text-sm'>Completados</div>
        </div>
        <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl'>
          <div className='text-3xl font-bold text-white'>{stats.thisWeek}</div>
          <div className='text-purple-100 text-sm'>Esta semana</div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-gray-800 p-6 rounded-xl'>
          <h3 className='text-xl font-bold text-white mb-4'>
            Servicios más populares
          </h3>
          <div className='space-y-3'>
            {Object.entries(stats.serviceStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([service, count]) => (
                <div
                  key={service}
                  className='flex justify-between items-center'
                >
                  <span className='text-gray-300'>{service}</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-32 bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{
                          width: `${(count / stats.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className='text-white font-medium'>{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className='bg-gray-800 p-6 rounded-xl'>
          <h3 className='text-xl font-bold text-white mb-4'>Turnos por mes</h3>
          <div className='space-y-3'>
            {Object.entries(stats.monthlyStats)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .slice(-6)
              .map(([month, count]) => (
                <div key={month} className='flex justify-between items-center'>
                  <span className='text-gray-300 capitalize'>{month}</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-32 bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full'
                        style={{
                          width: `${
                            (count /
                              Math.max(...Object.values(stats.monthlyStats))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className='text-white font-medium'>{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className='bg-gray-800 p-6 rounded-xl'>
        <h3 className='text-xl font-bold text-white mb-4'>
          Estado de los turnos
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-500'>
              {stats.pending}
            </div>
            <div className='text-gray-400 text-sm'>Pendientes</div>
            <div className='text-xs text-gray-500'>
              {stats.total > 0
                ? `${((stats.pending / stats.total) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-500'>
              {stats.cancelled}
            </div>
            <div className='text-gray-400 text-sm'>Cancelados</div>
            <div className='text-xs text-gray-500'>
              {stats.total > 0
                ? `${((stats.cancelled / stats.total) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-500'>
              {stats.completed}
            </div>
            <div className='text-gray-400 text-sm'>Completados</div>
            <div className='text-xs text-gray-500'>
              {stats.total > 0
                ? `${((stats.completed / stats.total) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-500'>
              {stats.reprogrammed}
            </div>
            <div className='text-gray-400 text-sm'>Reprogramados</div>
            <div className='text-xs text-gray-500'>
              {stats.total > 0
                ? `${((stats.reprogrammed / stats.total) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
