'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function TurnosHero() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' })

  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/turnos/turnos.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
      ref={heroRef}
    >
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            background-position: right center !important;
            background-attachment: scroll !important;
            min-height: 81vh !important;
            padding-top: 11rem !important;
            padding-bottom: 5rem !important;
            align-items: flex-start !important;
          }

          section > div {
            max-width: 80rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          @media (min-width: 640px) {
            section {
              padding-top: 12rem !important;
            }

            section > div {
              padding-left: 1.5rem !important;
              padding-right: 1.5rem !important;
            }
          }

          @media (min-width: 1024px) {
            section > div {
              padding-left: 2rem !important;
              padding-right: 2rem !important;
            }
          }
        }
      `}</style>

      <div className='absolute inset-0 bg-black/70 z-0'></div>

      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isHeroInView ? 'visible' : 'hidden'}
        className='relative z-10 max-w-4xl mx-auto text-center px-4'
      >
        <motion.h1
          variants={animations.fadeInUp}
          className='text-5xl md:text-6xl font-extrabold mb-6 text-white'
        >
          RESERVA TU{' '}
          <motion.span
            className='text-red-600'
            whileHover={animations.textGlow}
          >
            TURNO
          </motion.span>
        </motion.h1>
        <motion.p
          variants={animations.fadeInUp}
          className='text-white text-lg mb-8 max-w-2xl mx-auto'
        >
          Agenda tu cita de manera rápida y sencilla. Nuestro equipo de expertos
          está listo para atenderte con la mejor calidad y profesionalismo.
        </motion.p>
        <motion.div
          variants={animations.fadeInUp}
          className='flex flex-col sm:flex-row gap-4 justify-center items-center'
        >
          <div className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300'>
            📱 WhatsApp Directo
          </div>
          <div className='bg-gray-700 text-gray-300 px-8 py-4 rounded-lg font-semibold'>
            ⏰ Horarios: Lun-Vie 8:00-16:00
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
