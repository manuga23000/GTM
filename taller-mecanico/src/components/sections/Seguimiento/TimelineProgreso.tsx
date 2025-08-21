// components/sections/Seguimiento/TimelineProgreso.tsx
'use client'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaClock, FaCircle } from 'react-icons/fa'

interface TimelineItem {
  id: number
  fecha: string
  hora: string
  estado: string
  descripcion: string
  completado: boolean
}

interface TimelineProgresoProps {
  timeline: TimelineItem[]
}

export default function TimelineProgreso({ timeline }: TimelineProgresoProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    })
  }

  const formatearHora = (hora: string) => {
    return hora.slice(0, 5) // HH:MM
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className='bg-white rounded-2xl border border-gray-100 overflow-hidden'
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6'>
        <h2 className='text-2xl font-bold flex items-center'>
          <FaClock className='mr-3' />
          Timeline de Progreso
        </h2>
        <p className='text-gray-300 mt-1'>
          Seguimiento detallado de todas las etapas
        </p>
      </div>

      {/* Timeline */}
      <div className='p-6'>
        <div className='relative'>
          {/* Línea central */}
          <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200' />

          <div className='space-y-8'>
            {timeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className='relative flex items-start'
              >
                {/* Icono del estado */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                    item.completado
                      ? 'bg-green-500 border-green-200 text-white'
                      : index === timeline.findIndex(t => !t.completado)
                      ? 'bg-blue-500 border-blue-200 text-white animate-pulse'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {item.completado ? (
                    <FaCheckCircle className='text-xl' />
                  ) : index === timeline.findIndex(t => !t.completado) ? (
                    <FaClock className='text-xl' />
                  ) : (
                    <FaCircle className='text-xl' />
                  )}
                </motion.div>

                {/* Contenido */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`ml-6 flex-1 pb-8 ${
                    item.completado
                      ? 'opacity-100'
                      : index === timeline.findIndex(t => !t.completado)
                      ? 'opacity-100'
                      : 'opacity-60'
                  }`}
                >
                  {/* Fecha y hora */}
                  <div className='flex items-center mb-2 text-sm text-gray-500'>
                    <span className='bg-gray-100 px-2 py-1 rounded mr-2'>
                      {formatearFecha(item.fecha)}
                    </span>
                    <span className='bg-gray-100 px-2 py-1 rounded'>
                      {formatearHora(item.hora)}
                    </span>
                    {item.completado && (
                      <span className='ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium'>
                        ✓ Completado
                      </span>
                    )}
                    {!item.completado &&
                      index === timeline.findIndex(t => !t.completado) && (
                        <span className='ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium animate-pulse'>
                          ⏳ En proceso
                        </span>
                      )}
                  </div>

                  {/* Estado */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      item.completado
                        ? 'text-gray-800'
                        : index === timeline.findIndex(t => !t.completado)
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.estado}
                  </h3>

                  {/* Descripción */}
                  <p
                    className={`${
                      item.completado
                        ? 'text-gray-600'
                        : index === timeline.findIndex(t => !t.completado)
                        ? 'text-gray-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.descripcion}
                  </p>

                  {/* Línea divisoria sutil */}
                  {index < timeline.length - 1 && (
                    <div className='mt-6 border-b border-gray-100' />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resumen de progreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className='mt-8 bg-gray-50 p-4 rounded-lg'
        >
          <div className='flex items-center justify-between'>
            <span className='text-gray-700 font-medium'>Progreso Total:</span>
            <div className='flex items-center'>
              <div className='w-32 bg-gray-200 rounded-full h-2 mr-3'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      (timeline.filter(item => item.completado).length /
                        timeline.length) *
                      100
                    }%`,
                  }}
                  transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                  className='bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full'
                />
              </div>
              <span className='text-gray-700 font-semibold'>
                {timeline.filter(item => item.completado).length}/
                {timeline.length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
