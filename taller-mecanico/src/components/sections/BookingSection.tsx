'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function BookingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

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

  // Variantes de animación simplificadas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: custom * 0.15,
      },
    }),
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.6,
      },
    },
  }

  return (
    <section id='reservar-turnos' className='py-20 bg-gray-900' ref={ref}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='space-y-8'
        >
          {/* Título principal */}
          <motion.h2
            variants={fadeInUp}
            className='text-4xl md:text-6xl font-bold text-white'
          >
            RESERVA TU{' '}
            <motion.span
              className='text-red-500'
              whileHover={{
                textShadow: '0px 0px 8px rgb(239, 68, 68)',
                transition: { duration: 0.3 },
              }}
            >
              TURNO
            </motion.span>
          </motion.h2>

          {/* Párrafo descriptivo */}
          <motion.p
            variants={fadeInUp}
            className='text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed'
          >
            Agenda tu cita de manera rápida y sencilla. Selecciona el servicio
            que necesitas, elige la fecha y hora que más te convenga, y deja tu
            vehículo en manos expertas.
          </motion.p>

          {/* Cards de pasos */}
          <motion.div
            variants={containerVariants}
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
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.98 }}
                className='relative bg-gray-800 p-8 rounded-lg text-center max-w-sm cursor-pointer border border-transparent hover:border-red-500/30 hover:bg-gray-700 transition-all duration-300'
              >
                {/* Ícono con animación */}
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, -5, 0],
                    transition: { duration: 0.5 },
                  }}
                  className='text-4xl mb-4 inline-block'
                >
                  {step.icon}
                </motion.div>

                {/* Número de paso */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 0.3 }}
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
          <motion.div variants={buttonVariants} className='mt-12'>
            <Button variant='primary' size='xl'>
              PRÓXIMAMENTE - SISTEMA DE TURNOS
            </Button>

            <motion.p
              variants={fadeInUp}
              className='text-gray-400 mt-4 text-sm'
            >
              Mientras tanto, contáctanos por{' '}
              <Link
                href='https://wa.me/5493364694921'
                target='_blank'
                rel='noopener noreferrer'
              >
                <motion.span
                  whileHover={{
                    color: '#10b981',
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className='text-green-500 font-semibold cursor-pointer'
                >
                  WhatsApp
                </motion.span>
              </Link>{' '}
              para coordinar tu cita
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
