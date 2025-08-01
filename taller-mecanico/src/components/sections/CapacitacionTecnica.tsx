'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function CapacitacionTecnica() {
  const capacitacionRef = useRef(null)
  const isCapacitacionInView = useInView(capacitacionRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section
      className='relative py-12 md:py-20 bg-gray-900 text-white'
      style={{
        backgroundImage: "url('/images/servicios/capacitacion.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      ref={capacitacionRef}
    >
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            background-attachment: scroll !important;
          }
        }
      `}</style>

      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <motion.div
          variants={animations.fadeInUp}
          initial='hidden'
          animate={isCapacitacionInView ? 'visible' : 'hidden'}
          className='bg-black/60 p-6 md:p-12 rounded-lg backdrop-blur-sm'
        >
          <motion.div
            variants={animations.fadeInUp}
            className='text-center mb-8 md:mb-12'
          >
            <motion.h2
              variants={animations.fadeInUp}
              className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6'
            >
              CAPACITACIÓN TÉCNICA{' '}
              <motion.span
                className='text-red-600'
                whileHover={animations.textGlow}
              >
                PROFESIONAL
              </motion.span>
            </motion.h2>
            <motion.div
              variants={animations.fadeInUp}
              className='w-20 md:w-24 h-1 bg-red-600 mx-auto mb-6 md:mb-8'
            ></motion.div>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            className='max-w-4xl mx-auto text-center'
          >
            <motion.p
              variants={animations.fadeInUp}
              className='text-gray-200 text-base md:text-lg leading-relaxed mb-8 px-2 md:px-0'
            >
              Ofrecemos programas de formación especializados para técnicos y
              profesionales del sector automotriz, enfocados en el desarrollo de
              habilidades prácticas y conocimientos teóricos. Nuestras
              capacitaciones abarcan desde conceptos básicos hasta tecnologías
              avanzadas, permitiendo a los participantes dominar las
              herramientas y técnicas necesarias para la reparación y
              mantenimiento de vehículos modernos.
            </motion.p>
            <motion.div
              variants={animations.staggerContainer}
              initial='hidden'
              animate={isCapacitacionInView ? 'visible' : 'hidden'}
              className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12'
            >
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  backgroundColor: 'rgba(55, 65, 81, 0.7)',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                className='bg-gray-800/50 p-4 md:p-6 rounded-lg backdrop-blur-sm'
              >
                <motion.div
                  className='w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4'
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.5, ease: 'easeOut' as const },
                  }}
                >
                  <span className='text-white text-xl md:text-2xl'>🎓</span>
                </motion.div>
                <h3 className='text-lg md:text-xl font-bold mb-2 md:mb-3'>
                  Cursos Teóricos
                </h3>
                <p className='text-gray-300 text-xs md:text-sm'>
                  Fundamentos de mecánica, electrónica automotriz y sistemas
                  modernos
                </p>
              </motion.div>
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  backgroundColor: 'rgba(55, 65, 81, 0.7)',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                className='bg-gray-800/50 p-4 md:p-6 rounded-lg backdrop-blur-sm'
              >
                <motion.div
                  className='w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4'
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.5, ease: 'easeOut' as const },
                  }}
                >
                  <span className='text-white text-xl md:text-2xl'>🔧</span>
                </motion.div>
                <h3 className='text-lg md:text-xl font-bold mb-2 md:mb-3'>
                  Práctica Hands-On
                </h3>
                <p className='text-gray-300 text-xs md:text-sm'>
                  Talleres prácticos con herramientas y equipos profesionales
                </p>
              </motion.div>
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  backgroundColor: 'rgba(55, 65, 81, 0.7)',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                className='bg-gray-800/50 p-4 md:p-6 rounded-lg backdrop-blur-sm'
              >
                <motion.div
                  className='w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4'
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.5, ease: 'easeOut' as const },
                  }}
                >
                  <span className='text-white text-xl md:text-2xl'>📜</span>
                </motion.div>
                <h3 className='text-lg md:text-xl font-bold mb-2 md:mb-3'>
                  Certificación
                </h3>
                <p className='text-gray-300 text-xs md:text-sm'>
                  Certificados oficiales que avalan la capacitación recibida
                </p>
              </motion.div>
            </motion.div>
            <Link href='/contacto'>
              <motion.button
                variants={animations.fadeInUp}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#dc2626',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 md:py-4 px-6 md:px-10 rounded-lg transition-all shadow-lg text-base md:text-lg cursor-pointer w-full md:w-auto'
              >
                Solicitar Información
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
