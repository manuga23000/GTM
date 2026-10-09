'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllTimelineVehicles, deleteTimelineVehicle, TimelineVehicle } from '@/actions/timeline'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  History,
  ArrowUpDown,
  Car,
  User,
  Phone,
  Wrench,
  CalendarDays,
  CheckCircle2,
  Gauge,
  Loader2,
  Hash,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

type SortField = 'plateNumber' | 'finalizedAt' | 'clientName'
type SortDirection = 'asc' | 'desc'

const VEHICLES_PER_PAGE = 10

export default function VehicleHistory() {
  const [vehicles, setVehicles] = useState<TimelineVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('finalizedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortField, sortDirection])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const data = await getAllTimelineVehicles()
      setVehicles(data)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const result = await deleteTimelineVehicle(id)
      if (result.success) {
        setVehicles(prev => {
          const updated = prev.filter(v => v.id !== id)
          const newTotalPages = Math.ceil(updated.length / VEHICLES_PER_PAGE)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }
          return updated
        })
      }
    } catch (error) {
      console.error('Error eliminando:', error)
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let result = vehicles

    if (term) {
      result = result.filter(
        v =>
          v.plateNumber.toLowerCase().includes(term) ||
          v.clientName.toLowerCase().includes(term) ||
          (v.clientPhone && v.clientPhone.toLowerCase().includes(term)) ||
          (v.brand && v.brand.toLowerCase().includes(term)) ||
          (v.model && v.model.toLowerCase().includes(term)) ||
          (v.serviceType && v.serviceType.toLowerCase().includes(term))
      )
    }

    result = [...result].sort((a, b) => {
      if (sortField === 'plateNumber') {
        const cmp = a.plateNumber.localeCompare(b.plateNumber)
        return sortDirection === 'asc' ? cmp : -cmp
      }
      if (sortField === 'clientName') {
        const cmp = a.clientName.localeCompare(b.clientName)
        return sortDirection === 'asc' ? cmp : -cmp
      }
      const dateA = a.finalizedAt.getTime()
      const dateB = b.finalizedAt.getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    })

    return result
  }, [vehicles, searchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / VEHICLES_PER_PAGE)

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * VEHICLES_PER_PAGE
    return filteredAndSorted.slice(start, start + VEHICLES_PER_PAGE)
  }, [filteredAndSorted, currentPage])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'finalizedAt' ? 'desc' : 'asc')
    }
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center'>
              <History className='w-4.5 h-4.5 text-emerald-400' strokeWidth={2} />
            </div>
            <div>
              <h2 className='text-lg sm:text-xl font-bold text-white'>Historial de Finalizados</h2>
              <p className='text-zinc-500 text-xs sm:text-sm mt-0.5'>
                {filteredAndSorted.length} servicio{filteredAndSorted.length !== 1 ? 's' : ''} finalizado{filteredAndSorted.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className='relative w-full sm:max-w-sm'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none' strokeWidth={2} />
            <input
              type='text'
              placeholder='Buscar por nombre, patente, teléfono, marca, modelo, servicio…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-9 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5'
              >
                <X className='w-3.5 h-3.5' strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {/* Sort buttons */}
        <div className='flex flex-wrap gap-2 mt-4'>
          <button
            onClick={() => toggleSort('plateNumber')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortField === 'plateNumber'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <ArrowUpDown className='w-3 h-3' strokeWidth={2} />
            Patente {sortField === 'plateNumber' && (sortDirection === 'asc' ? 'A→Z' : 'Z→A')}
          </button>
          <button
            onClick={() => toggleSort('clientName')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortField === 'clientName'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <ArrowUpDown className='w-3 h-3' strokeWidth={2} />
            Cliente {sortField === 'clientName' && (sortDirection === 'asc' ? 'A→Z' : 'Z→A')}
          </button>
          <button
            onClick={() => toggleSort('finalizedAt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortField === 'finalizedAt'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <ArrowUpDown className='w-3 h-3' strokeWidth={2} />
            Fecha {sortField === 'finalizedAt' && (sortDirection === 'desc' ? 'Recientes' : 'Antiguos')}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className='bg-zinc-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2.5 rounded-xl bg-red-500/15 border border-red-500/20'>
                  <AlertTriangle className='w-5 h-5 text-red-400' strokeWidth={2} />
                </div>
                <div>
                  <h3 className='text-base font-bold text-white'>Eliminar del historial</h3>
                  <p className='text-zinc-400 text-xs mt-0.5'>
                    {(() => {
                      const v = vehicles.find(v => v.id === deleteConfirm)
                      return v ? `${v.plateNumber} — ${v.clientName}` : ''
                    })()}
                  </p>
                </div>
              </div>
              <p className='text-zinc-400 text-sm mb-5'>
                Esta acción es permanente y no se puede deshacer. Se eliminará este registro del historial.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className='flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50'
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className='flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  {deleting ? (
                    <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  ) : (
                    <>
                      <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <Loader2 className='w-8 h-8 text-emerald-400 animate-spin mb-3' strokeWidth={2} />
          <p className='text-zinc-500 text-sm'>Cargando historial…</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className='bg-zinc-900/70 border border-zinc-800 rounded-2xl p-10 text-center'>
          <History className='w-12 h-12 text-zinc-700 mx-auto mb-3' strokeWidth={1.5} />
          <p className='text-zinc-500 text-sm'>
            {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay vehículos finalizados en el historial'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className='hidden md:block bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Patente</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Cliente</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Teléfono</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Vehículo</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Servicio</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Finalizado</th>
                  <th className='text-center px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>#</th>
                  <th className='text-center px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>Trabajos</th>
                  <th className='text-center px-2 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-10'></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedVehicles.map((vehicle, idx) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors'
                    >
                      <td className='px-4 py-3'>
                        <span className='font-bold text-white text-sm tracking-wide'>{vehicle.plateNumber}</span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <User className='w-3.5 h-3.5 text-zinc-500 shrink-0' strokeWidth={2} />
                          <span className='text-zinc-300 text-sm truncate max-w-[160px]'>{vehicle.clientName}</span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <Phone className='w-3.5 h-3.5 text-zinc-500 shrink-0' strokeWidth={2} />
                          <span className='text-zinc-400 text-sm'>{vehicle.clientPhone || '-'}</span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='text-zinc-400 text-sm'>
                          {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <Wrench className='w-3.5 h-3.5 text-zinc-500 shrink-0' strokeWidth={2} />
                          <span className='text-zinc-400 text-sm truncate max-w-[140px]'>{vehicle.serviceType || '-'}</span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <CalendarDays className='w-3.5 h-3.5 text-emerald-400 shrink-0' strokeWidth={2} />
                          <span className='text-emerald-400 text-sm font-medium'>
                            {vehicle.finalizedAt.toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded-md text-xs text-zinc-300 font-medium'>
                          <Hash className='w-3 h-3' strokeWidth={2} />
                          {vehicle.serviceNumber}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-md text-xs text-emerald-400 font-medium'>
                          <CheckCircle2 className='w-3 h-3' strokeWidth={2} />
                          {vehicle.stepsCount}
                        </span>
                      </td>
                      <td className='px-2 py-3 text-center'>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.id)}
                          className='p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all'
                          title='Eliminar del historial'
                        >
                          <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className='md:hidden space-y-3'>
            <AnimatePresence>
              {paginatedVehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className='bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden'
                >
                  <div className='h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500' />
                  <div className='p-4 space-y-2.5'>
                    {/* Plate + service number + delete */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Car className='w-4 h-4 text-emerald-400' strokeWidth={2} />
                        <span className='font-bold text-white text-sm tracking-wide'>{vehicle.plateNumber}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded-md text-xs text-zinc-300 font-medium'>
                          <Hash className='w-3 h-3' strokeWidth={2} />
                          Servicio {vehicle.serviceNumber}
                        </span>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.id)}
                          className='p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all'
                          title='Eliminar del historial'
                        >
                          <Trash2 className='w-3.5 h-3.5' strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Vehicle info */}
                    {(vehicle.brand || vehicle.model) && (
                      <p className='text-zinc-500 text-xs'>
                        {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                      </p>
                    )}

                    {/* Client */}
                    <div className='flex items-center gap-2'>
                      <User className='w-3 h-3 text-zinc-500 shrink-0' strokeWidth={2} />
                      <span className='text-zinc-300 text-sm'>{vehicle.clientName}</span>
                    </div>

                    {/* Phone */}
                    {vehicle.clientPhone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='w-3 h-3 text-zinc-500 shrink-0' strokeWidth={2} />
                        <span className='text-zinc-400 text-sm'>{vehicle.clientPhone}</span>
                      </div>
                    )}

                    {/* Service type */}
                    {vehicle.serviceType && (
                      <div className='flex items-center gap-2'>
                        <Wrench className='w-3 h-3 text-zinc-500 shrink-0' strokeWidth={2} />
                        <span className='text-zinc-400 text-sm'>{vehicle.serviceType}</span>
                      </div>
                    )}

                    {/* Footer row */}
                    <div className='flex items-center justify-between pt-2 border-t border-zinc-800'>
                      <div className='flex items-center gap-1.5'>
                        <CalendarDays className='w-3 h-3 text-emerald-400' strokeWidth={2} />
                        <span className='text-emerald-400 text-xs font-medium'>
                          {vehicle.finalizedAt.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        {vehicle.km && (
                          <div className='flex items-center gap-1'>
                            <Gauge className='w-3 h-3 text-zinc-500' strokeWidth={2} />
                            <span className='text-zinc-400 text-xs'>{vehicle.km.toLocaleString()} km</span>
                          </div>
                        )}
                        <div className='flex items-center gap-1'>
                          <CheckCircle2 className='w-3 h-3 text-emerald-400' strokeWidth={2} />
                          <span className='text-emerald-400 text-xs font-medium'>{vehicle.stepsCount} trabajo{vehicle.stepsCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-1.5 mt-4'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
              >
                <ChevronLeft className='w-4 h-4' strokeWidth={2} />
              </button>

              <div className='flex gap-1'>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg transition-all text-xs font-semibold ${
                        currentPage === page
                          ? 'bg-emerald-500 text-zinc-900 shadow-sm'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
              >
                <ChevronRight className='w-4 h-4' strokeWidth={2} />
              </button>

              <span className='ml-2 text-xs text-zinc-500'>
                Página {currentPage} de {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
