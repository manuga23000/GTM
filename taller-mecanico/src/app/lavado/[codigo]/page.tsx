'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, XCircle, MapPin, Phone, Sparkles } from 'lucide-react'
import {
  escucharLavado,
  descripcionVehiculo,
  estadoEfectivo,
  formatearCodigo,
  formatearFecha,
  formatearFechaHora,
  Lavado,
  LAVADERO,
} from '@/actions/lavados'

type Vista =
  | { tipo: 'cargando' }
  | { tipo: 'invalido' }
  | { tipo: 'lavado'; lavado: Lavado }

export default function LavadoPage() {
  const params = useParams<{ codigo: string }>()
  const codigo = decodeURIComponent(params.codigo || '')
  const [vista, setVista] = useState<Vista>({ tipo: 'cargando' })
  const [ahora, setAhora] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = escucharLavado(
      codigo,
      lavado =>
        setVista(lavado ? { tipo: 'lavado', lavado } : { tipo: 'invalido' }),
      () => setVista({ tipo: 'invalido' })
    )
    return () => unsubscribe()
  }, [codigo])

  useEffect(() => {
    setAhora(new Date())
    const intervalo = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  let estado: { verde: boolean; titulo: string; detalle: string } | null =
    null
  if (vista.tipo === 'invalido') {
    estado = {
      verde: false,
      titulo: 'LINK INVÁLIDO',
      detalle: 'No lavar',
    }
  } else if (vista.tipo === 'lavado') {
    const { lavado } = vista
    const efectivo = estadoEfectivo(lavado, ahora ?? new Date())
    if (efectivo === 'emitido') {
      estado = { verde: true, titulo: 'VÁLIDO', detalle: 'Se puede lavar' }
    } else if (efectivo === 'anulado') {
      estado = { verde: false, titulo: 'ANULADO', detalle: 'No lavar' }
    } else if (efectivo === 'vencido') {
      estado = {
        verde: false,
        titulo: 'VENCIDO',
        detalle: `Venció el ${formatearFecha(lavado.venceAt)} · No lavar`,
      }
    } else {
      estado = {
        verde: false,
        titulo: 'YA USADO',
        detalle: lavado.usadoAt
          ? `Usado el ${formatearFecha(lavado.usadoAt)} · No lavar`
          : 'No lavar',
      }
    }
  }

  const datos =
    vista.tipo === 'lavado'
      ? [
          { label: 'Patente', value: vista.lavado.patente },
          ...(descripcionVehiculo(vista.lavado)
            ? [{ label: 'Vehículo', value: descripcionVehiculo(vista.lavado) }]
            : []),
          {
            label: 'Cliente',
            value: vista.lavado.clienteNombre.trim().split(/\s+/)[0] || '—',
          },
          { label: 'Incluye', value: 'Lavado completo' },
          { label: 'Vence', value: formatearFecha(vista.lavado.venceAt) },
        ]
      : []

  return (
    <main className='min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0f172a_60%)] text-zinc-900 flex flex-col items-center px-4 pt-5 pb-24'>
      <div className='w-full max-w-sm'>
        {/* Encabezado */}
        <div className='flex items-center gap-3 mb-4 px-1'>
          <div className='w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 ring-2 ring-amber-500/70'>
            <Image
              src='/images/header/LOGO GTM.png'
              alt='GTM'
              width={48}
              height={48}
              className='w-full h-full object-cover'
              priority
            />
          </div>
          <div className='leading-tight'>
            <p className='text-white font-extrabold text-lg tracking-tight'>
              GTM · Lavado de regalo
            </p>
            <p className='text-slate-400 text-xs font-medium'>
              Grandoli Taller Mecánico
            </p>
          </div>
        </div>

        {vista.tipo === 'cargando' || !estado ? (
          <div className='flex items-center justify-center py-32'>
            <span className='w-10 h-10 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin' />
          </div>
        ) : (
          <div className='bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/40'>
            {/* Estado */}
            <section
              className={`select-none text-white text-center px-5 pt-8 pb-9 ${
                estado.verde
                  ? 'bg-gradient-to-b from-emerald-500 to-green-600'
                  : 'bg-gradient-to-b from-red-500 to-red-700'
              }`}
            >
              <div className='mx-auto mb-3 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center'>
                {estado.verde ? (
                  <CheckCircle2 className='w-10 h-10' strokeWidth={2.4} />
                ) : (
                  <XCircle className='w-10 h-10' strokeWidth={2.4} />
                )}
              </div>
              <p className='text-[2.6rem] sm:text-5xl font-black tracking-tight leading-none uppercase'>
                {estado.titulo}
              </p>
              <p className='mt-3 text-base sm:text-lg font-semibold text-white/95'>
                {estado.detalle}
              </p>
            </section>

            {vista.tipo === 'lavado' && (
              <>
                {/* Código */}
                <div className='px-5 pt-5 pb-4 text-center'>
                  <p className='text-[11px] font-bold tracking-[0.25em] text-zinc-400 uppercase'>
                    Código
                  </p>
                  <p className='mt-1 font-mono text-3xl font-bold tracking-[0.18em] text-slate-900'>
                    {formatearCodigo(vista.lavado.codigo)}
                  </p>
                </div>

                {/* Corte de cupón */}
                <div className='relative h-6 flex items-center'>
                  <span className='absolute -left-3 w-6 h-6 rounded-full bg-slate-900' />
                  <span className='absolute -right-3 w-6 h-6 rounded-full bg-slate-900' />
                  <span className='w-full mx-5 border-t-2 border-dashed border-zinc-200' />
                </div>

                {/* Datos */}
                <dl className='px-5 pt-2 pb-3'>
                  {datos.map(({ label, value }) => (
                    <div
                      key={label}
                      className='flex justify-between items-baseline gap-4 py-2.5 border-b border-zinc-100 last:border-0'
                    >
                      <dt className='text-zinc-500 text-sm font-medium'>
                        {label}
                      </dt>
                      <dd className='font-bold text-[15px] text-slate-900 text-right break-words'>
                        {label === 'Incluye' ? (
                          <span className='inline-flex items-center gap-1.5'>
                            <Sparkles className='w-4 h-4 text-amber-500' strokeWidth={2.2} />
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Lavadero */}
                <div className='bg-slate-50 border-t border-zinc-100 px-5 py-4'>
                  <p className='text-[11px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-3'>
                    Dónde usarlo
                  </p>
                  <div className='space-y-2'>
                    <a
                      href={LAVADERO.mapsUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-200 active:bg-zinc-50'
                    >
                      <span className='w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0'>
                        <MapPin className='w-5 h-5 text-amber-600' strokeWidth={2.2} />
                      </span>
                      <span className='leading-tight'>
                        <span className='block font-bold text-slate-900 text-[15px]'>
                          {LAVADERO.direccion}
                        </span>
                        <span className='block text-zinc-500 text-xs mt-0.5'>
                          {LAVADERO.referencia}
                        </span>
                      </span>
                    </a>
                    <a
                      href={`tel:+54${LAVADERO.telefono}`}
                      className='flex items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-200 active:bg-zinc-50'
                    >
                      <span className='w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0'>
                        <Phone className='w-5 h-5 text-amber-600' strokeWidth={2.2} />
                      </span>
                      <span className='font-bold text-slate-900 text-[15px] tabular-nums'>
                        {LAVADERO.telefonoVisible}
                      </span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hora en vivo: delata capturas de pantalla viejas */}
      <footer className='fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur border-t border-white/10 px-4 py-3 flex items-center justify-center gap-2.5 select-none'>
        <span className='relative flex w-3 h-3'>
          <span className='absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping' />
          <span className='relative inline-flex w-3 h-3 rounded-full bg-red-500' />
        </span>
        <span className='text-red-400 font-extrabold text-xs tracking-widest'>
          EN VIVO
        </span>
        <span className='text-white font-bold text-base font-mono tabular-nums'>
          {ahora ? formatearFechaHora(ahora) : '--/--/---- --:--:--'}
        </span>
      </footer>
    </main>
  )
}
