'use client'
import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { app } from '@/lib/firebase'
import React from 'react'

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
    <div className='w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl bg-black/70 backdrop-blur-md flex flex-col items-center min-h-[400px] sm:min-h-[500px]'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 md:mb-6 text-white drop-shadow-lg text-center leading-tight'>
        PANEL DE
        <br className='sm:hidden' />
        <span className='sm:ml-2'>ADMINISTRACIÓN</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md'
      >
        <input
          type='email'
          placeholder='gtmsn291@gmail.com'
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='p-3 sm:p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base'
          required
        />

        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='••••••••'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='p-3 sm:p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full pr-12 text-sm sm:text-base'
            required
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1'
          >
            {showPassword ? (
              <svg
                className='w-3 h-3 sm:w-5 sm:h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                />
              </svg>
            ) : (
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <span className='text-red-400 text-sm text-center py-1'>{error}</span>
        )}

        <button
          type='submit'
          className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors duration-200 cursor-pointer text-sm sm:text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
