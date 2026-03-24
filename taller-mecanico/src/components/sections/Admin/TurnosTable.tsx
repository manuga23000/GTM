'use client'
import { useState } from 'react'
import { Turno } from '@/actions/types/types'
import {
  Search,
  RefreshCw,
  Trash2,
  ListChecks,
  Clock3,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  Phone,
  Mail,
  Car,
  Wrench,
  ChevronDown,
} from 'lucide-react'

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

const STATUS_MAP: Record<string, { label: string; pill: string }> = {
  pending:      { label: 'Pendiente',   pill: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'     },
  cancelled:    { label: 'Cancelado',   pill: 'bg-red-500/20 text-red-300 border border-red-500/30'           },
  completed:    { label: 'Completado',  pill: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  reprogrammed: { label: 'Reprogramado',pill: 'bg-orange-500/20 text-orange-300 border border-orange-500/30'  },
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

  const getStatusPill = (status: string) =>
    STATUS_MAP[status]?.pill ?? 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/50'

  const getStatusText = (status: string) =>
    STATUS_MAP[status]?.label ?? status

  const filteredTurnos = turnos.filter(turno => {
    const matchesStatus = filterStatus === 'all' || turno.status === filterStatus
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
    if (window.confirm('¿Estás seguro de que quieres eliminar este turno? Esta acción no se puede deshacer.')) {
      onDelete(turnoId)
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className='flex flex-col justify-center items-center h-64 gap-4'>
        <div className='relative w-12 h-12'>
          <div className='absolute inset-0 border-2 border-zinc-800 rounded-full' />
          <div className='absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin' />
        </div>
        <p className='text-zinc-500 text-sm'>Cargando turnos…</p>
      </div>
    )
  }

  const summaryCards = [
    { value: turnos.length,                                          label: 'Total',         Icon: ListChecks,   bg: 'bg-zinc-800/70',      border: 'border-zinc-700/60',   val: 'text-white'        },
    { value: turnos.filter(t => t.status === 'pending').length,      label: 'Pendientes',    Icon: Clock3,       bg: 'bg-amber-500/10',     border: 'border-amber-500/20',  val: 'text-amber-300'    },
    { value: turnos.filter(t => t.status === 'completed').length,    label: 'Completados',   Icon: CheckCircle2, bg: 'bg-emerald-500/10',   border: 'border-emerald-500/20',val: 'text-emerald-300'  },
    { value: turnos.filter(t => t.status === 'reprogrammed').length, label: 'Reprogramados', Icon: RotateCcw,    bg: 'bg-orange-500/10',    border: 'border-orange-500/20', val: 'text-orange-300'   },
  ]

  return (
    <div className='space-y-5'>

      {/* ── Filters ── */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='flex-1 relative'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none' strokeWidth={2} />
          <input
            type='text'
            placeholder='Buscar por nombre, email, teléfono, vehículo…'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-sm cursor-text'
          />
        </div>

        <div className='flex gap-2'>
          {/* Status filter */}
          <div className='relative'>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className='appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-sm cursor-pointer'
            >
              <option value='all'>Todos</option>
              <option value='pending'>Pendientes</option>
              <option value='cancelled'>Cancelados</option>
              <option value='completed'>Completados</option>
              <option value='reprogrammed'>Reprogramados</option>
            </select>
            <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none' strokeWidth={2} />
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className='px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-900 font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 text-sm shadow-md shadow-amber-900/30 border border-amber-400/30'
          >
            <RefreshCw className='w-4 h-4' strokeWidth={2.2} />
            <span className='hidden sm:inline'>Actualizar</span>
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {summaryCards.map(({ value, label, Icon, bg, border, val }) => (
          <div key={label} className={`${bg} border ${border} p-3.5 sm:p-4 rounded-xl flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${val} opacity-80 shrink-0`} strokeWidth={1.8} />
            <div>
              <div className={`text-xl sm:text-2xl font-bold ${val}`}>{value}</div>
              <div className='text-zinc-500 text-xs'>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile cards ── */}
      <div className='flex flex-col gap-3 sm:hidden'>
        {filteredTurnos.map(turno => (
          <div
            key={turno.id}
            className='bg-zinc-900/80 rounded-xl border border-zinc-700/60 overflow-hidden shadow-md'
          >
            {/* Card top accent */}
            <div className='h-0.5 bg-gradient-to-r from-amber-500/40 via-orange-500/40 to-transparent' />

            <div className='p-4 flex flex-col gap-3'>
              {/* Header */}
              <div className='flex justify-between items-start gap-2'>
                <div className='font-bold text-white text-base leading-tight'>{turno.name}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusPill(turno.status)}`}>
                  {getStatusText(turno.status)}
                </span>
              </div>

              {/* Details */}
              <div className='space-y-1.5 text-sm'>
                <div className='flex items-center gap-2 text-zinc-400'>
                  <CalendarDays className='w-3.5 h-3.5 shrink-0 text-zinc-600' strokeWidth={1.8} />
                  <span>{new Date(turno.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <Mail className='w-3.5 h-3.5 shrink-0 text-zinc-600' strokeWidth={1.8} />
                  <span className='truncate'>{turno.email}</span>
                </div>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <Phone className='w-3.5 h-3.5 shrink-0 text-zinc-600' strokeWidth={1.8} />
                  <span>{turno.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <Car className='w-3.5 h-3.5 shrink-0 text-amber-600/80' strokeWidth={1.8} />
                  <span className='font-medium'>{turno.vehicle}</span>
                </div>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <Wrench className='w-3.5 h-3.5 shrink-0 text-amber-600/80' strokeWidth={1.8} />
                  <span>
                    {turno.service}
                    {turno.subService && <span className='text-zinc-500'> / {turno.subService}</span>}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <CalendarDays className='w-3.5 h-3.5 shrink-0 text-zinc-600' strokeWidth={1.8} />
                  <span>Fecha: <span className='font-medium'>{formatDate(turno.date)}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2 pt-2 border-t border-zinc-800'>
                <div className='relative flex-1'>
                  <select
                    value={turno.status}
                    onChange={e => onStatusUpdate(turno.id!, e.target.value as 'pending' | 'cancelled' | 'completed' | 'reprogrammed')}
                    className='w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer'
                  >
                    <option value='pending'>Pendiente</option>
                    <option value='cancelled'>Cancelado</option>
                    <option value='completed'>Completado</option>
                    <option value='reprogrammed'>Reprogramado</option>
                  </select>
                  <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none' strokeWidth={2} />
                </div>
                <button
                  onClick={() => handleDeleteClick(turno.id!)}
                  className='px-3 py-1.5 bg-red-600/70 hover:bg-red-500 text-white rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-red-500/30'
                  aria-label='Eliminar turno'
                >
                  <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className='overflow-x-auto w-full rounded-xl border border-zinc-800 hidden sm:block shadow-lg'>
        {/* Top accent bar */}
        <div className='h-0.5 bg-gradient-to-r from-amber-500/50 via-orange-500/30 to-transparent' />
        <table className='min-w-full bg-zinc-900/90 text-sm'>
          <thead>
            <tr className='border-b border-zinc-800 bg-zinc-950/50'>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Cliente</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Contacto</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Vehículo</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Servicio</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Fecha</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Estado</th>
              <th className='px-4 py-3.5 text-left text-zinc-400 font-semibold text-xs uppercase tracking-wider'>Acciones</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-800/70'>
            {filteredTurnos.map(turno => (
              <tr key={turno.id} className='hover:bg-zinc-800/40 transition-colors group'>
                <td className='px-4 py-3.5'>
                  <div className='font-semibold text-white'>{turno.name}</div>
                  <div className='text-xs text-zinc-500 mt-0.5'>{new Date(turno.createdAt).toLocaleDateString('es-ES')}</div>
                </td>
                <td className='px-4 py-3.5'>
                  <div className='text-zinc-200'>{turno.email}</div>
                  <div className='text-xs text-zinc-500 mt-0.5'>{turno.phone}</div>
                </td>
                <td className='px-4 py-3.5'>
                  <div className='flex items-center gap-1.5 text-zinc-200'>
                    <Car className='w-3.5 h-3.5 text-amber-500/70 shrink-0' strokeWidth={1.8} />
                    {turno.vehicle}
                  </div>
                </td>
                <td className='px-4 py-3.5'>
                  <div className='text-zinc-200'>{turno.service}</div>
                  {turno.subService && <div className='text-xs text-zinc-500 mt-0.5'>{turno.subService}</div>}
                </td>
                <td className='px-4 py-3.5 text-zinc-200 whitespace-nowrap'>{formatDate(turno.date)}</td>
                <td className='px-4 py-3.5'>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusPill(turno.status)}`}>
                    {getStatusText(turno.status)}
                  </span>
                </td>
                <td className='px-4 py-3.5'>
                  <div className='flex items-center gap-2'>
                    <div className='relative'>
                      <select
                        value={turno.status}
                        onChange={e => onStatusUpdate(turno.id!, e.target.value as 'pending' | 'cancelled' | 'completed' | 'reprogrammed')}
                        className='appearance-none pl-2.5 pr-7 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer'
                      >
                        <option value='pending'>Pendiente</option>
                        <option value='cancelled'>Cancelado</option>
                        <option value='completed'>Completado</option>
                        <option value='reprogrammed'>Reprogramado</option>
                      </select>
                      <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none' strokeWidth={2} />
                    </div>
                    <button
                      onClick={() => handleDeleteClick(turno.id!)}
                      className='p-1.5 bg-red-600/60 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer flex items-center border border-red-500/30'
                      aria-label='Eliminar turno'
                    >
                      <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTurnos.length === 0 && (
        <div className='text-center py-14 text-zinc-600 flex flex-col items-center gap-3'>
          <Wrench className='w-8 h-8 opacity-25' strokeWidth={1.5} />
          <p>No se encontraron turnos que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  )
}
