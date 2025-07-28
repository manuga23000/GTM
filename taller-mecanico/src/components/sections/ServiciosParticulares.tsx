'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function ServiciosParticulares() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  // Animaciones más sutiles
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: 'easeOut',
      },
    }),
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const services = [
    '✓ Trabajos de electrónica',
    '✓ Mecánica en general',
    '✓ Cajas automáticas',
    '✓ Mas Servicios',
  ]

  return (
    <section
      className='relative w-full min-h-[600px] flex items-center justify-center py-20'
      style={{
        backgroundImage: "url('/images/servicios/chevrolet.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'right',
        backgroundAttachment: 'fixed',
      }}
      ref={ref}
    >
      <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='flex flex-col items-start text-left space-y-6'
        >
          <motion.h2
            variants={itemVariants}
            className='text-white font-extrabold text-5xl mb-2'
          >
            SERVICIOS <br />
            <motion.span
              className='relative text-red-600 inline-block'
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              PARTICULARES
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className='text-white text-lg max-w-xl mt-6 mb-8'
          >
            Brindamos atención especializada para tu vehículo con tecnología de
            última generación. Nuestro equipo de técnicos certificados realiza
            diagnósticos precisos y reparaciones profesionales en mecánica
            general, cajas automáticas, sistemas electrónicos y programación de
            módulos.
          </motion.p>

          <motion.ul
            variants={containerVariants}
            className='text-white text-lg font-bold space-y-2 mb-10'
          >
            {services.map((service, index) => (
              <motion.li
                key={index}
                custom={index}
                variants={listItemVariants}
                whileHover={{
                  x: 5,
                  transition: { duration: 0.2 },
                }}
                className='cursor-pointer hover:text-red-400 transition-colors duration-200'
              >
                {service}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={buttonVariants}>
            <Link href='/servicios'>
              <Button variant='primary' size='lg'>
                Ver Más
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Columna derecha vacía para dejar ver la imagen */}
        <div className='hidden lg:block'></div>
      </div>
    </section>
  )
}
