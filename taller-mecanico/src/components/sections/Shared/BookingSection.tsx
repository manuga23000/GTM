'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function BookingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    {
      icon: '🔧',
      title: 'Selecciona tu Servicio',
      description: 'Elige entre nuestros servicios especializados',
    },
    {
      icon: '📅',
      title: 'Elige Fecha y Hora',
      description: 'Selecciona el momento que mejor te convenga',
    },
    {
      icon: '✅',
      title: 'Confirma tu Cita',
      description: 'Recibe la confirmación y detalles del servicio',
    },
  ]

  // Animaciones más suaves para las tarjetas
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.0, // Más lento
        delay: custom * 0.3, // Más espaciado
        ease: 'easeOut' as const,
      },
    }),
  }

  return (
    <section id='reservar-turnos' className='py-20 bg-gray-900' ref={ref}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='space-y-8'
        >
          {/* Título principal */}
          <motion.h2
            variants={animations.fadeInUp}
            className='text-4xl md:text-6xl font-bold text-white'
          >
            RESERVA TU{' '}
            <motion.span
              className='text-red-500'
              whileHover={animations.textGlow}
            >
              TURNO
            </motion.span>
          </motion.h2>

          {/* Párrafo descriptivo */}
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed'
          >
            Agenda tu cita de manera rápida y sencilla. Selecciona el servicio
            que necesitas, elige la fecha y hora que más te convenga, y deja tu
            vehículo en manos expertas.
          </motion.p>

          {/* Cards de pasos */}
          <motion.div
            variants={animations.staggerContainer}
            className='flex flex-col sm:flex-row gap-6 justify-center items-center'
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                whileTap={{ scale: 0.98 }}
                className='relative bg-gray-800 p-8 rounded-lg text-center max-w-sm cursor-pointer border border-transparent hover:border-red-500/30 hover:bg-gray-700 transition-all duration-300'
              >
                {/* Ícono con animación */}
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, -5, 0],
                    transition: { duration: 0.8, ease: 'easeOut' as const },
                  }}
                  className='text-4xl mb-4 inline-block'
                >
                  {step.icon}
                </motion.div>

                {/* Número de paso */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.3,
                    duration: 0.5,
                    ease: 'easeOut' as const,
                  }}
                  className='absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'
                >
                  {index + 1}
                </motion.div>

                <h3 className='text-xl font-semibold mb-2 text-white'>
                  {step.title}
                </h3>
                <p className='text-gray-400 leading-relaxed'>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Botón y texto adicional */}
          <motion.div variants={animations.fadeInUp} className='mt-12'>
            <Button variant='primary' size='xl'>
              RESERVAR TURNO
            </Button>

            <motion.p
              variants={animations.fadeInUp}
              className='text-gray-400 mt-4 text-sm'
            >
              Ya podés reservar tu turno online desde el sistema. Si tenés dudas, también podés contactarnos por{' '}
              <Link
                href='https://wa.me/5493364694921'
                target='_blank'
                rel='noopener noreferrer'
              >
                WhatsApp
              </Link>
              .
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Líneas conectoras entre las cards (opcional, para desktop) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className='hidden sm:block absolute inset-0 pointer-events-none'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center'>
          <div className='flex items-center justify-center space-x-6 mt-20'>
            {/* Línea 1 */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '100px' } : { width: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className='h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent'
            />
            {/* Línea 2 */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '100px' } : { width: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className='h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent'
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
