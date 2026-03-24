'use client'
import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { app } from '@/lib/firebase'
import React from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
  Wrench,
} from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const auth = getAuth(app)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto rounded-2xl shadow-2xl bg-zinc-950/90 backdrop-blur-xl border border-amber-500/15 flex flex-col items-center overflow-hidden'>
      {/* Top accent bar */}
      <div className='w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' />

      <div className='w-full p-7 sm:p-9 flex flex-col items-center'>
        {/* Brand area */}
        <div className='flex flex-col items-center gap-3 mb-7'>
          <div className='relative'>
            <div className='p-4 rounded-2xl bg-amber-500/15 border border-amber-500/25 shadow-xl shadow-amber-900/20'>
              <Wrench
                className='w-9 h-9 sm:w-11 sm:h-11 text-amber-400'
                strokeWidth={1.6}
              />
            </div>
            {/* Spark dots */}
            <span className='absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/60' />
          </div>
          <div className='text-center'>
            <span className='block text-[40px] font-bold text-white uppercase'>
              Panel de Administración
            </span>
            <p className='text-zinc-400 text-xs mt-0.5'>
              GTM · Grandoli Taller Mecánico
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className='w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-7' />

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
          {/* Email */}
          <div className='relative'>
            <Mail
              className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none'
              strokeWidth={1.8}
            />
            <input
              type='email'
              placeholder='correo@ejemplo.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm sm:text-base'
              required
            />
          </div>

          {/* Password */}
          <div className='relative'>
            <Lock
              className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none'
              strokeWidth={1.8}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full pl-10 pr-12 py-3 sm:py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm sm:text-base'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5'
            >
              {showPassword ? (
                <EyeOff className='w-4 h-4' strokeWidth={1.8} />
              ) : (
                <Eye className='w-4 h-4' strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className='flex items-center gap-2.5 text-red-300 text-sm bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-2.5'>
              <AlertTriangle
                className='w-4 h-4 flex-shrink-0 text-red-400'
                strokeWidth={2}
              />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={loading}
            className='mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-zinc-900 font-bold py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/40 border border-amber-400/30'
          >
            {loading ? (
              <>
                <span className='w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin' />
                Entrando…
              </>
            ) : (
              <>
                <LogIn className='w-4 h-4' strokeWidth={2.2} />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
