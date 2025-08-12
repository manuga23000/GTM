// components/sections/Seguimiento/ContactoTaller.tsx
'use client'
import { motion } from 'framer-motion'
import {
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaHeadset,
} from 'react-icons/fa'

export default function ContactoTaller() {
  const abrirWhatsApp = () => {
    const mensaje = encodeURIComponent(
      'Hola! Estoy consultando sobre el seguimiento de mi vehículo.'
    )
    window.open(`https://wa.me/5493364123456?text=${mensaje}`, '_blank')
  }

  const llamarTaller = () => {
    window.open('tel:+5493364123456', '_self')
  }

  const abrirMaps = () => {
    window.open('https://maps.google.com/?q=GTM+Taller+San+Nicolas', '_blank')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-red-600 to-red-700 text-white p-6'>
        <h2 className='text-xl font-bold flex items-center'>
          <FaHeadset className='mr-3' />
          Contacto del Taller
        </h2>
        <p className='text-red-100 mt-1 text-sm'>
          ¿Tenés alguna consulta? Estamos aquí para ayudarte
        </p>
      </div>

      <div className='p-6 space-y-6'>
        {/* Botones de contacto rápido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className='grid grid-cols-1 gap-3'
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={abrirWhatsApp}
            className='flex items-center justify-center bg-green-500 text-white py-4 px-4 rounded-lg hover:bg-green-600 transition-colors shadow-lg'
          >
            <FaWhatsapp className='mr-3 text-lg' />
            <div className='text-left'>
              <div className='font-semibold'>WhatsApp</div>
              <div className='text-sm opacity-90'>Respuesta inmediata</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={llamarTaller}
            className='flex items-center justify-center bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 transition-colors shadow-lg'
          >
            <FaPhone className='mr-3 text-lg' />
            <div className='text-left'>
              <div className='font-semibold'>Llamar al Taller</div>
              <div className='text-sm opacity-90'>+54 9 336 412-3456</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Información de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className='space-y-4'
        >
          <h3 className='font-semibold text-gray-800 mb-3'>
            Información de Contacto
          </h3>

          <div className='space-y-3'>
            <div className='flex items-start p-3 bg-gray-50 rounded-lg'>
              <FaMapMarkerAlt className='text-red-500 mt-1 mr-3 flex-shrink-0' />
              <div className='flex-1'>
                <div className='text-sm text-gray-500'>Dirección</div>
                <div className='font-medium text-gray-800'>
                  Av. San Martín 1234
                  <br />
                  San Nicolás de los Arroyos, BA
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={abrirMaps}
                  className='text-blue-600 text-sm mt-1 hover:underline'
                >
                  Ver en Google Maps →
                </motion.button>
              </div>
            </div>

            <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
              <FaPhone className='text-blue-500 mr-3' />
              <div className='flex-1'>
                <div className='text-sm text-gray-500'>Teléfono</div>
                <div className='font-medium text-gray-800'>
                  +54 9 336 412-3456
                </div>
              </div>
            </div>

            <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
              <FaEnvelope className='text-green-500 mr-3' />
              <div className='flex-1'>
                <div className='text-sm text-gray-500'>Email</div>
                <div className='font-medium text-gray-800'>
                  info@gtmtaller.com
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Horarios de atención */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className='space-y-3'
        >
          <h3 className='font-semibold text-gray-800 flex items-center'>
            <FaClock className='mr-2 text-purple-500' />
            Horarios de Atención
          </h3>

          <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Lunes a Viernes:</span>
                <span className='font-medium text-gray-800'>8:00 - 18:00</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Sábados:</span>
                <span className='font-medium text-gray-800'>8:00 - 13:00</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Domingos:</span>
                <span className='font-medium text-red-600'>Cerrado</span>
              </div>
            </div>
          </div>

          <div className='bg-amber-50 p-3 rounded-lg border border-amber-200'>
            <p className='text-amber-700 text-sm text-center'>
              <strong>📞 Atención WhatsApp:</strong> Respondemos consultas las
              24hs los 7 días de la semana
            </p>
          </div>
        </motion.div>

        {/* Separador */}
        <div className='border-t border-gray-200' />

        {/* Servicios de emergencia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className='text-center'
        >
          <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
            <h4 className='font-semibold text-red-800 mb-2'>
              🚨 Servicio de Emergencia
            </h4>
            <p className='text-red-700 text-sm mb-3'>
              Si tu vehículo presenta algún problema urgente, contactanos
              inmediatamente
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={abrirWhatsApp}
              className='bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors'
            >
              Contactar por Emergencia
            </motion.button>
          </div>
        </motion.div>

        {/* Nota final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className='bg-gray-50 p-4 rounded-lg text-center'
        >
          <p className='text-gray-600 text-sm'>
            <strong>💼 GTM - Tu aliado automotriz</strong>
            <br />
            Más de 15 años de experiencia en reparación de cajas automáticas y
            mecánica general
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
