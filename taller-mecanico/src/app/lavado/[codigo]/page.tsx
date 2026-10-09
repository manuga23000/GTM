'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  escucharLavado,
  descripcionVehiculo,
  estadoEfectivo,
  formatearCodigo,
  formatearFecha,
  formatearFechaHora,
  Lavado,
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
          { label: 'Código', value: formatearCodigo(vista.lavado.codigo) },
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
    <main className='min-h-screen bg-zinc-100 text-zinc-900 flex flex-col'>
      <header className='bg-slate-900 text-white text-center py-4 px-4 font-bold text-base sm:text-lg'>
        GTM · Lavado de regalo
      </header>

      {vista.tipo === 'cargando' || !estado ? (
        <div className='flex-1 flex items-center justify-center'>
          <span className='w-10 h-10 border-4 border-zinc-300 border-t-zinc-700 rounded-full animate-spin' />
        </div>
      ) : (
        <div className='flex-1 w-full max-w-md mx-auto flex flex-col pb-20'>
          <section
            className={`select-none text-white text-center px-4 py-10 sm:py-12 ${
              estado.verde ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <h1 className='text-5xl sm:text-6xl font-extrabold tracking-tight leading-none'>
              {estado.titulo}
            </h1>
            <p className='mt-3 text-lg sm:text-xl font-medium'>
              {estado.detalle}
            </p>
          </section>

          {datos.length > 0 && (
            <dl className='bg-white px-5 py-4 divide-y divide-zinc-100'>
              {datos.map(({ label, value }) => (
                <div
                  key={label}
                  className='flex justify-between items-center gap-4 py-3'
                >
                  <dt className='text-zinc-500 text-base'>{label}</dt>
                  <dd className='font-bold text-base text-right break-words'>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <footer className='fixed bottom-0 inset-x-0 bg-zinc-200 border-t border-zinc-300 px-4 py-3 flex items-center justify-center gap-2 select-none'>
        <span className='relative flex w-3 h-3'>
          <span className='absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping' />
          <span className='relative inline-flex w-3 h-3 rounded-full bg-red-600' />
        </span>
        <span className='text-red-600 font-bold text-sm'>EN VIVO</span>
        <span className='font-bold text-sm sm:text-base tabular-nums'>
          {ahora ? formatearFechaHora(ahora) : '--/--/---- --:--:--'}
        </span>
      </footer>
    </main>
  )
}
