'use client'
import { useState } from 'react'
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth'
import { app } from '@/lib/firebase'
import React from 'react'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const auth = getAuth(app)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
  }

  return (
    <section
      className='relative min-h-[100vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/turnos/turnos.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            background-position: right center !important;
            background-attachment: scroll !important;
            min-height: 81vh !important;
            padding-top: 11rem !important;
            padding-bottom: 5rem !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
      <div className='absolute inset-0 bg-black/80 z-0'></div>
      <div className='relative z-10 w-full max-w-lg mx-auto p-8 rounded-xl shadow-2xl bg-black/70 backdrop-blur-md flex flex-col items-center'>
        {!user ? (
          <>
            <h1 className='text-4xl font-extrabold mb-6 text-white drop-shadow-lg text-center'>
              Panel de Administración
            </h1>
            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-4 w-full'
            >
              <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
                required
              />
              <input
                type='password'
                placeholder='Contraseña'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='p-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
                required
              />
              {error && (
                <span className='text-red-400 text-sm text-center'>
                  {error}
                </span>
              )}
              <button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors duration-200'
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className='text-4xl font-extrabold mb-6 text-white drop-shadow-lg text-center'>
              Bienvenido al Panel de Administración
            </h1>
            <button
              onClick={handleLogout}
              className='mb-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200'
            >
              Cerrar sesión
            </button>
            <div className='w-full bg-gray-900/80 rounded-lg p-6 shadow-inner text-center'>
              <h2 className='text-2xl font-bold mb-2 text-white'>
                Gestión de Turnos
              </h2>
              <p className='text-gray-300'>
                Sección de administración de turnos (próximamente).
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
