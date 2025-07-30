'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function TurnosFormulario() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    vehiculo: '',
    servicio: '',
    fecha: '',
    hora: '',
    comentarios: '',
  })

  const servicios = [
    'Diagnóstico General',
    'Cambio de Aceite',
    'Frenos',
    'Suspensión',
    'Motor',
    'Transmisión',
    'Electricidad',
    'Aire Acondicionado',
    'Otro',
  ]

  const horas = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Datos del turno:', formData)
    alert('Turno reservado exitosamente. Te contactaremos para confirmar.')
  }

  const isFormValid =
    formData.nombre &&
    formData.telefono &&
    formData.servicio &&
    formData.fecha &&
    formData.hora

  return (
    <section className='py-20 bg-gray-900'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700'
        >
          <h2 className='text-3xl font-bold text-center mb-8 text-white'>
            Formulario de Reserva
          </h2>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Información Personal */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Nombre Completo *
                </label>
                <input
                  type='text'
                  name='nombre'
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                  placeholder='Tu nombre completo'
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Teléfono *
                </label>
                <input
                  type='tel'
                  name='telefono'
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                  placeholder='Tu número de teléfono'
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                  placeholder='tu@email.com'
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Vehículo
                </label>
                <input
                  type='text'
                  name='vehiculo'
                  value={formData.vehiculo}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                  placeholder='Marca, modelo y año'
                />
              </motion.div>
            </div>

            {/* Servicio y Fecha/Hora */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Servicio *
                </label>
                <select
                  name='servicio'
                  value={formData.servicio}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                >
                  <option value=''>Selecciona un servicio</option>
                  {servicios.map((servicio, index) => (
                    <option key={index} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Fecha *
                </label>
                <input
                  type='date'
                  name='fecha'
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Hora *
                </label>
                <select
                  name='hora'
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300'
                >
                  <option value=''>Selecciona una hora</option>
                  {horas.map((hora, index) => (
                    <option key={index} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Comentarios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Comentarios Adicionales
              </label>
              <textarea
                name='comentarios'
                value={formData.comentarios}
                onChange={handleInputChange}
                rows={4}
                className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none'
                placeholder='Describe el problema o especifica detalles adicionales...'
              />
            </motion.div>

            {/* Botón de Envío */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className='text-center pt-6'
            >
              <Button
                type='submit'
                variant='primary'
                size='xl'
                disabled={!isFormValid}
                className={`w-full md:w-auto ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                RESERVAR TURNO
              </Button>
            </motion.div>
          </form>

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className='mt-8 p-6 bg-gray-700 rounded-lg border border-gray-600'
          >
            <h3 className='text-lg font-semibold text-white mb-3'>
              📋 Información Importante
            </h3>
            <ul className='text-gray-300 space-y-2 text-sm'>
              <li>• Los turnos se confirman dentro de las 24 horas</li>
              <li>• Llega 10 minutos antes de tu cita</li>
              <li>• Trae documentación del vehículo</li>
              <li>• Para cancelaciones, avisa con 24 horas de anticipación</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
