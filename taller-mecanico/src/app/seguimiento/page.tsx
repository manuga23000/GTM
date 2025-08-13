// app/seguimiento/page.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaCar, FaSearch, FaShieldAlt, FaClock, FaWrench } from 'react-icons/fa'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'

export default function SeguimientoPage() {
  const [patente, setPatente] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patente.trim()) {
      alert('Por favor ingresa una patente')
      return
    }

    setLoading(true)

    // Normalizar patente (remover espacios y convertir a mayúsculas)
    const patenteNormalizada = patente.trim().toUpperCase().replace(/\s+/g, '')

    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 500))

    // Redirigir a la página específica del vehículo
    router.push(`/seguimiento/${patenteNormalizada}`)
  }

  const formatearPatente = (valor: string) => {
    // Remover caracteres no alfanuméricos y convertir a mayúsculas
    const limpio = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    // Limitar a 7 caracteres (formato argentino)
    const limitado = limpio.slice(0, 7)

    // Formatear según patrón argentino (ABC123 o AB123CD)
    if (limitado.length <= 3) {
      return limitado
    } else if (limitado.length <= 6) {
      return `${limitado.slice(0, 3)} ${limitado.slice(3)}`
    } else {
      return `${limitado.slice(0, 2)} ${limitado.slice(2, 5)} ${limitado.slice(
        5
      )}`
    }
  }

  const handlePatenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const formateado = formatearPatente(valor)
    setPatente(formateado)
  }

  return (
    <>
      <Navbar />
      <main className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 pt-16 lg:pt-24'>
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden'
        >
          {/* Patrón de fondo */}
          <div className='absolute inset-0 opacity-10'>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className='relative max-w-7xl mx-auto px-4 py-16 pt-8 text-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='mb-8'
            >
              <Image
                src='/images/header/LOGO GTM.png'
                alt='GTM Logo'
                width={80}
                height={80}
                className='h-20 w-auto mx-auto mb-4'
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='text-4xl md:text-5xl font-bold mb-4'
            >
              Seguimiento de Vehículo
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'
            >
              Ingresa la patente de tu vehículo para conocer el estado actual de
              tu servicio
            </motion.p>

            {/* Formulario de búsqueda */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='max-w-md mx-auto'
            >
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='relative'>
                  <FaCar className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl' />
                  <input
                    type='text'
                    value={patente}
                    onChange={handlePatenteChange}
                    placeholder='Ej: ABC 123 o AB 123 CD'
                    className='w-full pl-12 pr-4 py-4 text-xl font-bold text-center text-gray-800 bg-white rounded-xl border-2 border-transparent focus:border-red-500 focus:outline-none transition-colors tracking-wider'
                    maxLength={9} // Para incluir espacios
                  />
                </div>

                <motion.button
                  type='submit'
                  disabled={loading || !patente.trim()}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className='w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center text-lg'
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className='w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3'
                    />
                  ) : (
                    <FaSearch className='mr-3' />
                  )}
                  {loading ? 'Buscando...' : 'Consultar Estado'}
                </motion.button>
              </form>

              <p className='text-gray-400 text-sm mt-4'>
                La patente debe tener el formato argentino (6 o 7 caracteres)
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Características del servicio */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className='py-16'
        >
          <div className='max-w-6xl mx-auto px-4'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                ¿Qué puedes consultar?
              </h2>
              <p className='text-gray-600 text-lg'>
                Mantente informado sobre el progreso de tu vehículo en tiempo
                real
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* Estado actual */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow'
              >
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto'>
                  <FaShieldAlt className='text-2xl text-blue-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 text-center mb-3'>
                  Estado Actual
                </h3>
                <p className='text-gray-600 text-center'>
                  Conoce en qué etapa se encuentra tu vehículo: recibido, en
                  diagnóstico, en reparación o listo para entrega.
                </p>
              </motion.div>

              {/* Timeline de progreso */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow'
              >
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto'>
                  <FaClock className='text-2xl text-green-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 text-center mb-3'>
                  Timeline Detallado
                </h3>
                <p className='text-gray-600 text-center'>
                  Revisa el historial completo de todas las etapas por las que
                  ha pasado tu vehículo.
                </p>
              </motion.div>

              {/* Trabajos realizados */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow'
              >
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto'>
                  <FaWrench className='text-2xl text-red-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 text-center mb-3'>
                  Trabajos Realizados
                </h3>
                <p className='text-gray-600 text-center'>
                  Lista detallada de todos los trabajos realizados y los
                  próximos pasos a seguir.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Información adicional */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className='bg-gray-800 text-white py-12'
        >
          <div className='max-w-4xl mx-auto px-4 text-center'>
            <h3 className='text-2xl font-bold mb-4'>
              ¿No encuentras tu vehículo?
            </h3>
            <p className='text-gray-300 mb-6'>
              Si tu patente no aparece en el sistema, es posible que tu vehículo
              aún no haya sido ingresado o que la patente sea incorrecta.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a
                href='/contacto'
                className='bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors'
              >
                Contactar al Taller
              </a>
              <a
                href='/turnos'
                className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors'
              >
                Reservar un Turno
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </>
  )
}
