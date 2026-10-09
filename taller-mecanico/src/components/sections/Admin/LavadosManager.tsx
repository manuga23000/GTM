'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import {
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Ban,
  Banknote,
  Car,
  User,
  CalendarDays,
  Wrench,
} from 'lucide-react'
import {
  listarLavados,
  obtenerLavado,
  marcarLavadoUsado,
  marcarLavadosPagados,
  anularLavado,
  estadoEfectivo,
  formatearCodigo,
  formatearFecha,
  normalizarCodigo,
  esCodigoValido,
  motivoNoValido,
  Lavado,
  EstadoLavadoEfectivo,
} from '@/actions/lavados'
import { linkLavado, whatsAppLavadoUrl, copiarTexto } from './LavadoLinkModal'

type Filtro = 'todos' | EstadoLavadoEfectivo

interface Busqueda {
  codigo: string
  lavado: Lavado | null
  error?: string
  ok?: string
}

const LAVADOS_PER_PAGE = 10

const estadoConfig: Record<
  EstadoLavadoEfectivo,
  { label: string; badge: string; card: string; activo: string }
> = {
  emitido: {
    label: 'Activos',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    card: 'text-emerald-400',
    activo: 'border-emerald-500/60 bg-emerald-500/10',
  },
  usado: {
    label: 'Usados sin pagar',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    card: 'text-amber-400',
    activo: 'border-amber-500/60 bg-amber-500/10',
  },
  pagado: {
    label: 'Pagados',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    card: 'text-sky-400',
    activo: 'border-sky-500/60 bg-sky-500/10',
  },
  vencido: {
    label: 'Vencidos',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    card: 'text-red-400',
    activo: 'border-red-500/60 bg-red-500/10',
  },
}

const estadoLabel: Record<EstadoLavadoEfectivo, string> = {
  emitido: 'Activo',
  usado: 'Usado sin pagar',
  pagado: 'Pagado',
  vencido: 'Vencido',
}

export default function LavadosManager() {
  const [lavados, setLavados] = useState<Lavado[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [codigoInput, setCodigoInput] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [marcando, setMarcando] = useState(false)
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null)

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  const [pagoCodigos, setPagoCodigos] = useState<string[] | null>(null)
  const [montoInput, setMontoInput] = useState('')
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    loadLavados()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtro])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const loadLavados = async () => {
    setLoading(true)
    const data = await listarLavados()
    setLavados(data)
    setSeleccionados(prev =>
      prev.filter(c => data.some(l => l.codigo === c && l.estado === 'usado'))
    )
    setLoading(false)
  }

  // ── Registrar lavado (código de la foto) ──
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    const codigo = normalizarCodigo(codigoInput)
    if (!codigo) return
    if (!esCodigoValido(codigo)) {
      setBusqueda({
        codigo,
        lavado: null,
        error: 'El código no es válido (son 8 caracteres, ej: 7K4P-X9MR)',
      })
      return
    }
    setBuscando(true)
    const lavado = await obtenerLavado(codigo)
    setBuscando(false)
    setBusqueda({
      codigo,
      lavado,
      error: lavado
        ? (motivoNoValido(lavado) ?? undefined)
        : 'El link no existe',
    })
  }

  const handleMarcarUsado = async () => {
    if (!busqueda?.lavado) return
    setMarcando(true)
    const result = await marcarLavadoUsado(busqueda.codigo)
    setMarcando(false)
    setBusqueda({
      codigo: busqueda.codigo,
      lavado: result.lavado ?? busqueda.lavado,
      ...(result.success ? { ok: result.message } : { error: result.message }),
    })
    if (result.success) await loadLavados()
  }

  // ── Acciones de la lista ──
  const handleCopiar = async (lavado: Lavado) => {
    const ok = await copiarTexto(linkLavado(lavado.codigo))
    showMessage(ok ? 'Link copiado' : 'No se pudo copiar el link')
  }

  const handleAnular = async (lavado: Lavado) => {
    if (
      !confirm(
        `¿Anular el link ${formatearCodigo(lavado.codigo)} de ${lavado.clienteNombre}? El cliente ya no lo va a poder usar.`
      )
    )
      return
    const result = await anularLavado(lavado.codigo)
    showMessage(result.message)
    if (result.success) await loadLavados()
  }

  const abrirPago = (codigos: string[]) => {
    setMontoInput('')
    setPagoCodigos(codigos)
  }

  const handleConfirmarPago = async () => {
    if (!pagoCodigos) return
    const monto = montoInput.trim() ? Number(montoInput) : undefined
    if (monto !== undefined && (!Number.isFinite(monto) || monto < 0)) {
      showMessage('El monto no es válido')
      return
    }
    setPagando(true)
    const result = await marcarLavadosPagados(pagoCodigos, monto)
    setPagando(false)
    setPagoCodigos(null)
    setSeleccionados([])
    showMessage(result.error ? `${result.message} (${result.error})` : result.message)
    await loadLavados()
  }

  const toggleSeleccion = (codigo: string) => {
    setSeleccionados(prev =>
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    )
  }

  // ── Datos derivados ──
  const ahora = new Date()
  const conEstado = lavados.map(l => ({ lavado: l, estado: estadoEfectivo(l, ahora) }))

  const contadores = conEstado.reduce<Record<EstadoLavadoEfectivo, number>>(
    (acc, { estado }) => {
      acc[estado]++
      return acc
    },
    { emitido: 0, usado: 0, pagado: 0, vencido: 0 }
  )

  const filtrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    const termCodigo = normalizarCodigo(searchTerm)
    const fecha = new Date()
    return lavados
      .map(l => ({ lavado: l, estado: estadoEfectivo(l, fecha) }))
      .filter(({ estado }) => filtro === 'todos' || estado === filtro)
      .filter(
        ({ lavado }) =>
          !term ||
          lavado.patente.toLowerCase().includes(term.replace(/\s+/g, '')) ||
          lavado.clienteNombre.toLowerCase().includes(term) ||
          (termCodigo !== '' && lavado.codigo.includes(termCodigo))
      )
  }, [lavados, searchTerm, filtro])

  const totalPages = Math.ceil(filtrados.length / LAVADOS_PER_PAGE)

  const paginados = useMemo(() => {
    const start = (currentPage - 1) * LAVADOS_PER_PAGE
    return filtrados.slice(start, start + LAVADOS_PER_PAGE)
  }, [filtrados, currentPage])

  const usadosVisibles = paginados
    .filter(({ estado }) => estado === 'usado')
    .map(({ lavado }) => lavado.codigo)
  const todosVisiblesSeleccionados =
    usadosVisibles.length > 0 &&
    usadosVisibles.every(c => seleccionados.includes(c))

  const toggleTodosVisibles = () => {
    setSeleccionados(prev =>
      todosVisiblesSeleccionados
        ? prev.filter(c => !usadosVisibles.includes(c))
        : [...new Set([...prev, ...usadosVisibles])]
    )
  }

  const busquedaEstado = busqueda?.lavado ? estadoEfectivo(busqueda.lavado) : null

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='p-3 sm:p-4 bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-xl flex items-center gap-3 text-sm'
          >
            <CheckCircle2 className='w-4 h-4 text-amber-400 shrink-0' strokeWidth={2} />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Registrar lavado ── */}
      <div className='bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center'>
            <Sparkles className='w-4.5 h-4.5 text-amber-400' strokeWidth={2} />
          </div>
          <div>
            <h2 className='text-lg sm:text-xl font-bold text-white'>Registrar lavado</h2>
            <p className='text-zinc-500 text-xs sm:text-sm mt-0.5'>
              Escribí el código que aparece en la foto que manda el lavadero
            </p>
          </div>
        </div>

        <form onSubmit={handleBuscar} className='flex flex-col sm:flex-row gap-2'>
          <input
            type='text'
            inputMode='text'
            autoCapitalize='characters'
            autoComplete='off'
            spellCheck={false}
            placeholder='XXXX-XXXX'
            value={codigoInput}
            onChange={e => {
              setCodigoInput(e.target.value)
              setBusqueda(null)
            }}
            className='flex-1 px-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-center sm:text-left'
          />
          <button
            type='submit'
            disabled={buscando || !codigoInput.trim()}
            className='flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-xl text-sm sm:text-base transition-all border border-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {buscando ? (
              <Loader2 className='w-4 h-4 animate-spin' strokeWidth={2.2} />
            ) : (
              <Search className='w-4 h-4' strokeWidth={2.2} />
            )}
            Buscar
          </button>
        </form>

        {busqueda && (
          <div className='mt-4 space-y-3'>
            {busqueda.lavado && busquedaEstado && (
              <div className='bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 sm:p-4'>
                <div className='flex flex-wrap items-center justify-between gap-2 mb-3'>
                  <span className='text-white font-extrabold text-lg tracking-wider'>
                    {formatearCodigo(busqueda.lavado.codigo)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${estadoConfig[busquedaEstado].badge}`}
                  >
                    {estadoLabel[busquedaEstado]}
                  </span>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm'>
                  {[
                    { label: 'Patente', value: busqueda.lavado.patente },
                    { label: 'Cliente', value: busqueda.lavado.clienteNombre },
                    {
                      label: 'Vehículo',
                      value:
                        `${busqueda.lavado.marca} ${busqueda.lavado.modelo}`.trim() || '—',
                    },
                    { label: 'Vence', value: formatearFecha(busqueda.lavado.venceAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className='bg-zinc-900/60 rounded-lg p-2'>
                      <p className='text-zinc-500 text-xs'>{label}</p>
                      <p className='text-white font-medium truncate'>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {busqueda.error && (
              <div className='flex items-center gap-2.5 text-red-300 text-sm sm:text-base font-semibold bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3'>
                <XCircle className='w-5 h-5 shrink-0 text-red-400' strokeWidth={2} />
                {busqueda.error}
              </div>
            )}

            {busqueda.ok && (
              <div className='flex items-center gap-2.5 text-emerald-300 text-sm sm:text-base font-semibold bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3'>
                <CheckCircle2 className='w-5 h-5 shrink-0 text-emerald-400' strokeWidth={2} />
                {busqueda.ok}
              </div>
            )}

            {busqueda.lavado && busquedaEstado === 'emitido' && !busqueda.error && (
              <button
                onClick={handleMarcarUsado}
                disabled={marcando}
                className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm sm:text-base transition-all border border-emerald-500/40 disabled:opacity-50'
              >
                {marcando ? (
                  <Loader2 className='w-4 h-4 animate-spin' strokeWidth={2.2} />
                ) : (
                  <CheckCircle2 className='w-4 h-4' strokeWidth={2.2} />
                )}
                Marcar como usado
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Contadores (también filtran) ── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3'>
        {(Object.keys(estadoConfig) as EstadoLavadoEfectivo[]).map(estado => (
          <button
            key={estado}
            onClick={() => setFiltro(filtro === estado ? 'todos' : estado)}
            className={`text-left bg-zinc-900/70 border rounded-2xl p-3 sm:p-4 transition-all ${
              filtro === estado
                ? estadoConfig[estado].activo
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className={`text-2xl sm:text-3xl font-extrabold ${estadoConfig[estado].card}`}>
              {contadores[estado]}
            </div>
            <div className='text-zinc-400 text-xs sm:text-sm mt-0.5'>
              {estadoConfig[estado].label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      <div className='bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {(['todos', 'emitido', 'usado', 'pagado', 'vencido'] as Filtro[]).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filtro === f
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                {f === 'todos' ? 'Todos' : estadoConfig[f].label}
              </button>
            ))}
          </div>

          <div className='relative w-full sm:max-w-xs'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none' strokeWidth={2} />
            <input
              type='text'
              placeholder='Buscar por patente, cliente o código…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-9 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all text-sm'
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

        {/* Selección múltiple */}
        {(usadosVisibles.length > 0 || seleccionados.length > 0) && (
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl'>
            <label className='flex items-center gap-2 text-sm text-zinc-300 cursor-pointer'>
              <input
                type='checkbox'
                checked={todosVisiblesSeleccionados}
                onChange={toggleTodosVisibles}
                disabled={usadosVisibles.length === 0}
                className='w-4 h-4 accent-amber-500'
              />
              Seleccionar usados de esta página
            </label>
            <button
              onClick={() => abrirPago(seleccionados)}
              disabled={seleccionados.length === 0}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl text-sm transition-all border border-amber-400/30 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <Banknote className='w-4 h-4' strokeWidth={2} />
              Marcar {seleccionados.length || ''} como pagado{seleccionados.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        <div className='mt-4'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <Loader2 className='w-8 h-8 text-amber-400 animate-spin mb-3' strokeWidth={2} />
              <p className='text-zinc-500 text-sm'>Cargando lavados…</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className='py-10 text-center'>
              <Sparkles className='w-12 h-12 text-zinc-700 mx-auto mb-3' strokeWidth={1.5} />
              <p className='text-zinc-500 text-sm'>
                {searchTerm || filtro !== 'todos'
                  ? 'No hay lavados que coincidan'
                  : 'Todavía no se regaló ningún lavado'}
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {paginados.map(({ lavado, estado }) => (
                <div
                  key={lavado.codigo}
                  className='bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3'
                >
                  <div className='flex items-start gap-3 flex-1 min-w-0'>
                    {estado === 'usado' && (
                      <input
                        type='checkbox'
                        checked={seleccionados.includes(lavado.codigo)}
                        onChange={() => toggleSeleccion(lavado.codigo)}
                        className='w-4 h-4 mt-1 accent-amber-500 shrink-0'
                        aria-label={`Seleccionar ${formatearCodigo(lavado.codigo)}`}
                      />
                    )}
                    <div className='flex-1 min-w-0 space-y-1.5'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-white font-bold tracking-wider'>
                          {formatearCodigo(lavado.codigo)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${estadoConfig[estado].badge}`}
                        >
                          {estadoLabel[estado]}
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-zinc-400'>
                        <span className='flex items-center gap-1.5'>
                          <Car className='w-3.5 h-3.5 text-zinc-500' strokeWidth={2} />
                          <span className='text-zinc-200 font-medium'>{lavado.patente}</span>
                          {(lavado.marca || lavado.modelo) && (
                            <span>
                              {lavado.marca} {lavado.modelo}
                            </span>
                          )}
                        </span>
                        <span className='flex items-center gap-1.5'>
                          <User className='w-3.5 h-3.5 text-zinc-500' strokeWidth={2} />
                          {lavado.clienteNombre}
                        </span>
                        {lavado.servicioOrigen && (
                          <span className='flex items-center gap-1.5'>
                            <Wrench className='w-3.5 h-3.5 text-zinc-500' strokeWidth={2} />
                            {lavado.servicioOrigen}
                          </span>
                        )}
                      </div>
                      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500'>
                        <span className='flex items-center gap-1.5'>
                          <CalendarDays className='w-3 h-3' strokeWidth={2} />
                          Creado {formatearFecha(lavado.creadoAt)}
                        </span>
                        <span>Vence {formatearFecha(lavado.venceAt)}</span>
                        {lavado.usadoAt && <span>Usado {formatearFecha(lavado.usadoAt)}</span>}
                        {lavado.pagadoAt && (
                          <span className='text-sky-400'>
                            Pagado {formatearFecha(lavado.pagadoAt)}
                            {lavado.montoPagado !== undefined &&
                              ` · $${lavado.montoPagado.toLocaleString('es-AR')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {estado === 'emitido' && (
                    <div className='grid grid-cols-3 lg:flex gap-2 shrink-0'>
                      <button
                        onClick={() => handleCopiar(lavado)}
                        className='flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-medium transition-colors border border-zinc-600'
                      >
                        <Copy className='w-3.5 h-3.5' strokeWidth={2} />
                        <span className='hidden sm:inline'>Copiar link</span>
                        <span className='sm:hidden'>Copiar</span>
                      </button>
                      {(() => {
                        const waUrl = whatsAppLavadoUrl(lavado)
                        return waUrl ? (
                          <a
                            href={waUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600/80 hover:bg-green-500 text-white rounded-xl text-xs font-medium transition-colors border border-green-500/30'
                          >
                            <FaWhatsapp className='w-3.5 h-3.5' />
                            <span className='hidden sm:inline'>Reenviar por WhatsApp</span>
                            <span className='sm:hidden'>Reenviar</span>
                          </a>
                        ) : (
                          <span className='flex items-center justify-center px-3 py-2 text-zinc-600 text-xs border border-zinc-800 rounded-xl'>
                            Sin teléfono
                          </span>
                        )
                      })()}
                      <button
                        onClick={() => handleAnular(lavado)}
                        className='flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600/70 hover:bg-red-500 text-white rounded-xl text-xs font-medium transition-colors border border-red-500/30'
                      >
                        <Ban className='w-3.5 h-3.5' strokeWidth={2} />
                        Anular
                      </button>
                    </div>
                  )}

                  {estado === 'usado' && (
                    <button
                      onClick={() => abrirPago([lavado.codigo])}
                      className='flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl text-xs transition-all border border-amber-400/30 shrink-0'
                    >
                      <Banknote className='w-3.5 h-3.5' strokeWidth={2} />
                      Marcar como pagado
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex flex-wrap justify-center items-center gap-1.5 mt-4'>
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
                        ? 'bg-amber-500 text-zinc-900 shadow-sm'
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
      </div>

      {/* Modal de pago (portal: el panel usa backdrop-blur y eso rompe el `fixed`) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {pagoCodigos && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
                onClick={() => !pagando && setPagoCodigos(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className='bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 max-w-sm w-full'
                >
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20'>
                      <Banknote className='w-5 h-5 text-amber-400' strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className='text-base font-bold text-white'>Marcar como pagado</h3>
                      <p className='text-zinc-400 text-xs mt-0.5'>
                        {pagoCodigos.length === 1
                          ? formatearCodigo(pagoCodigos[0])
                          : `${pagoCodigos.length} lavados`}
                      </p>
                    </div>
                  </div>

                  <label className='block text-zinc-400 text-xs mb-1.5'>
                    {pagoCodigos.length === 1 ? 'Monto' : 'Monto por lavado'} (opcional)
                  </label>
                  <input
                    type='number'
                    inputMode='decimal'
                    min={0}
                    placeholder='$'
                    value={montoInput}
                    onChange={e => setMontoInput(e.target.value)}
                    className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30 transition-all text-base mb-5'
                  />

                  <div className='flex gap-3'>
                    <button
                      onClick={() => setPagoCodigos(null)}
                      disabled={pagando}
                      className='flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50'
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmarPago}
                      disabled={pagando}
                      className='flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                    >
                      {pagando ? (
                        <span className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
