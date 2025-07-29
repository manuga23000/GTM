'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ServiciosParticulares() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='flex flex-col items-start text-left space-y-6'
        >
          <motion.h2
            variants={animations.fadeInLeft}
            className='text-white font-extrabold text-5xl mb-2'
          >
            SERVICIOS <br />
            <motion.span
              className='relative text-red-600 inline-block'
              whileHover={animations.buttonHover}
            >
              PARTICULARES
            </motion.span>
          </motion.h2>

          <motion.p
            variants={animations.fadeInLeft}
            className='text-white text-lg max-w-xl mt-6 mb-8'
          >
            Brindamos atención especializada para tu vehículo con tecnología de
            última generación. Nuestro equipo de técnicos certificados realiza
            diagnósticos precisos y reparaciones profesionales en mecánica
            general, cajas automáticas, sistemas electrónicos y programación de
            módulos.
          </motion.p>

          <motion.ul
            variants={animations.staggerContainer}
            className='text-white text-lg font-bold space-y-2 mb-10'
          >
            {services.map((service, index) => (
              <motion.li
                key={index}
                variants={animations.fadeInLeft}
                whileHover={{
                  x: 5,
                  transition: { duration: 0.4, ease: 'easeOut' as const },
                }}
                className='cursor-pointer hover:text-red-400 transition-colors duration-200'
              >
                {service}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={animations.fadeInUp}>
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

      <style jsx>{`
        @media (max-width: 640px) {
          section {
            background-attachment: scroll !important;
            background-position: right center !important;
          }
          section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1;
          }
          section > div {
            z-index: 2;
            position: relative;
          }
        }
      `}</style>
    </section>
  )
}
