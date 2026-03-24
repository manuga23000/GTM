'use client'
import { Turno } from '@/actions/types/types'
import {
  ListChecks,
  Clock3,
  CheckCircle2,
  CalendarRange,
  TrendingUp,
  BarChart3,
  CircleDot,
} from 'lucide-react'

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

    return { total, pending, cancelled, completed, reprogrammed, serviceStats, monthlyStats, thisWeek, thisMonth }
  }

  const stats = getStats()

  const topStatCards = [
    {
      value: stats.total,
      label: 'Total turnos',
      Icon: ListChecks,
      gradient: 'from-zinc-800/80 to-zinc-900/60',
      border: 'border-zinc-700/60',
      iconBg: 'bg-zinc-700/60',
      iconColor: 'text-zinc-300',
      valueColor: 'text-white',
    },
    {
      value: stats.pending,
      label: 'Pendientes',
      Icon: Clock3,
      gradient: 'from-amber-600/25 to-amber-800/15',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-300',
    },
    {
      value: stats.completed,
      label: 'Completados',
      Icon: CheckCircle2,
      gradient: 'from-emerald-600/25 to-emerald-800/15',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-300',
    },
    {
      value: stats.thisWeek,
      label: 'Esta semana',
      Icon: CalendarRange,
      gradient: 'from-orange-600/25 to-orange-800/15',
      border: 'border-orange-500/30',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      valueColor: 'text-orange-300',
    },
  ]

  const statusItems = [
    { value: stats.pending,      label: 'Pendientes',    color: 'text-amber-400',   dot: 'bg-amber-400',   ring: 'ring-amber-400/20'   },
    { value: stats.cancelled,    label: 'Cancelados',    color: 'text-red-400',     dot: 'bg-red-400',     ring: 'ring-red-400/20'     },
    { value: stats.completed,    label: 'Completados',   color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'ring-emerald-400/20' },
    { value: stats.reprogrammed, label: 'Reprogramados', color: 'text-orange-400',  dot: 'bg-orange-400',  ring: 'ring-orange-400/20'  },
  ]

  return (
    <div className='space-y-5'>

      {/* ── Top stat cards ── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
        {topStatCards.map(({ value, label, Icon, gradient, border, iconBg, iconColor, valueColor }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} border ${border} p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-md`}
          >
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.8} />
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>{value}</div>
              <div className='text-zinc-500 text-xs mt-0.5'>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

        {/* Popular services */}
        <div className='bg-zinc-900/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-md'>
          <div className='flex items-center gap-2 mb-5'>
            <div className='w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center'>
              <TrendingUp className='w-3.5 h-3.5 text-amber-400' strokeWidth={2.2} />
            </div>
            <h3 className='text-sm sm:text-base font-bold text-white'>Servicios más populares</h3>
          </div>
          <div className='space-y-3'>
            {Object.entries(stats.serviceStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([service, count], i) => (
                <div key={service} className='flex justify-between items-center gap-3'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='text-xs text-zinc-600 font-mono w-4 shrink-0'>{i + 1}</span>
                    <span className='text-zinc-300 text-sm truncate'>{service}</span>
                  </div>
                  <div className='flex items-center gap-3 shrink-0'>
                    <div className='w-20 sm:w-28 bg-zinc-800 rounded-full h-1.5'>
                      <div
                        className='bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-700'
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className='text-white font-semibold text-sm w-5 text-right'>{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(stats.serviceStats).length === 0 && (
              <p className='text-zinc-600 text-sm text-center py-4'>Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Monthly */}
        <div className='bg-zinc-900/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-md'>
          <div className='flex items-center gap-2 mb-5'>
            <div className='w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center'>
              <BarChart3 className='w-3.5 h-3.5 text-emerald-400' strokeWidth={2.2} />
            </div>
            <h3 className='text-sm sm:text-base font-bold text-white'>Turnos por mes</h3>
          </div>
          <div className='space-y-3'>
            {Object.entries(stats.monthlyStats)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .slice(-6)
              .map(([month, count]) => (
                <div key={month} className='flex justify-between items-center gap-3'>
                  <span className='text-zinc-300 capitalize text-sm'>{month}</span>
                  <div className='flex items-center gap-3 shrink-0'>
                    <div className='w-20 sm:w-28 bg-zinc-800 rounded-full h-1.5'>
                      <div
                        className='bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-700'
                        style={{ width: `${(count / Math.max(...Object.values(stats.monthlyStats))) * 100}%` }}
                      />
                    </div>
                    <span className='text-white font-semibold text-sm w-5 text-right'>{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(stats.monthlyStats).length === 0 && (
              <p className='text-zinc-600 text-sm text-center py-4'>Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Status breakdown ── */}
      <div className='bg-zinc-900/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-md'>
        <div className='flex items-center gap-2 mb-5'>
          <div className='w-6 h-6 rounded-lg bg-zinc-700/60 flex items-center justify-center'>
            <CircleDot className='w-3.5 h-3.5 text-zinc-400' strokeWidth={2} />
          </div>
          <h3 className='text-sm sm:text-base font-bold text-white'>Estado de los turnos</h3>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {statusItems.map(({ value, label, color, dot, ring }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 ring-1 ${ring}`}
            >
              <div className={`w-2 h-2 rounded-full ${dot} shadow-sm`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className='text-zinc-500 text-xs text-center'>{label}</div>
              <div className='text-xs text-zinc-600 font-mono'>
                {stats.total > 0 ? `${((value / stats.total) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
