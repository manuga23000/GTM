'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { Copy, Check, Sparkles, X } from 'lucide-react'
import {
  formatearCodigo,
  formatearFecha,
  mensajeWhatsAppLavado,
  telefonoWhatsApp,
} from '@/actions/lavados'

interface LavadoLinkData {
  codigo: string
  clienteNombre: string
  clienteTelefono: string
  venceAt: Date
}

interface LavadoLinkModalProps {
  lavado: LavadoLinkData | null
  onClose: () => void
}

export function linkLavado(codigo: string): string {
  return `${window.location.origin}/lavado/${formatearCodigo(codigo)}`
}

export function whatsAppLavadoUrl(lavado: LavadoLinkData): string | null {
  const telefono = telefonoWhatsApp(lavado.clienteTelefono)
  if (!telefono) return null
  const mensaje = mensajeWhatsAppLavado(
    lavado.clienteNombre,
    linkLavado(lavado.codigo)
  )
  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
}

export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

export default function LavadoLinkModal({
  lavado,
  onClose,
}: LavadoLinkModalProps) {
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = async () => {
    if (!lavado) return
    const ok = await copiarTexto(linkLavado(lavado.codigo))
    if (ok) {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const waUrl = lavado ? whatsAppLavadoUrl(lavado) : null

  if (typeof document === 'undefined') return null

  // Portal al body: el panel del admin usa backdrop-blur y eso rompe el `fixed`
  return createPortal(
    <AnimatePresence>
      {lavado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className='bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 max-w-md w-full'
          >
            <div className='flex items-start justify-between gap-3 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20'>
                  <Sparkles className='w-5 h-5 text-amber-400' strokeWidth={2} />
                </div>
                <div>
                  <h3 className='text-base font-bold text-white'>
                    Lavado de regalo creado
                  </h3>
                  <p className='text-zinc-400 text-xs mt-0.5'>
                    {lavado.clienteNombre} · Vence el{' '}
                    {formatearFecha(lavado.venceAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors'
                title='Cerrar'
              >
                <X className='w-4 h-4' strokeWidth={2} />
              </button>
            </div>

            <div className='bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 mb-4'>
              <p className='text-zinc-500 text-xs mb-1'>Link</p>
              <p className='text-white text-sm font-medium break-all'>
                {linkLavado(lavado.codigo)}
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={handleCopiar}
                className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-sm font-medium transition-colors border border-zinc-600'
              >
                {copiado ? (
                  <Check className='w-4 h-4 text-emerald-400' strokeWidth={2.2} />
                ) : (
                  <Copy className='w-4 h-4' strokeWidth={2} />
                )}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
              {waUrl && (
                <a
                  href={waUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors border border-green-500/40'
                >
                  <FaWhatsapp className='w-4 h-4' />
                  Enviar por WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
