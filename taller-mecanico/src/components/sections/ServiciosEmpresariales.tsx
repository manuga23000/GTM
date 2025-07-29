'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ServiciosEmpresariales() {
  const mainRef = useRef(null)
  const isMainInView = useInView(mainRef, { once: true, margin: '-100px' })

  const services = [
    '✓ Mantenimiento Preventivo Programado',
    '✓ Diagnóstico Electrónico de Flota',
    '✓ Gestión Integral de Flotas',
    '✓ Mas Servicios',
  ]

  return (
    <section
      className='relative w-full min-h-[600px] flex items-center justify-center py-20'
      style={{
        backgroundImage: "url('/images/servicios/flota.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'left',
        backgroundAttachment: 'fixed',
      }}
      ref={mainRef}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 relative z-10'>
        <div className='hidden lg:block'></div>
        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isMainInView ? 'visible' : 'hidden'}
          className='flex flex-col items-end text-right space-y-6'
        >
          <motion.h2
            variants={animations.fadeInRight}
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
              EMPRESARIALES
            </motion.span>
          </motion.h2>

          <motion.p
            variants={animations.fadeInRight}
            className='text-white text-lg max-w-xl mt-6 mb-8'
          >
            Desarrollamos soluciones integrales para el mantenimiento y gestión
            de flotas vehiculares. Ofrecemos planes personalizados que incluyen
            mantenimiento preventivo programado, servicio de emergencia móvil,
            diagnóstico electrónico avanzado y gestión completa de
            documentación.
          </motion.p>

          <motion.ul
            variants={animations.staggerContainer}
            className='text-white text-lg font-bold space-y-2 mb-10'
          >
            {services.map((service, index) => (
              <motion.li
                key={index}
                variants={animations.listItemVariants}
                whileHover={{
                  x: -5,
                  transition: { duration: 0.4, ease: 'easeOut' as const },
                }}
                className='cursor-pointer hover:text-red-400 transition-colors duration-200 text-right'
              >
                {service}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={animations.fadeInRight}>
            <Link href='/servicios'>
              <Button variant='primary' size='lg'>
                Ver Más
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          section {
            background-attachment: scroll !important;
            background-position: left center !important;
            background-size: 200% !important;
            background-repeat: no-repeat !important;
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
