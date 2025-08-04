'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function HeroSobreNosotros() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' })

  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/sobrenosotros/sobrenosotros.jpg')",
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
          SOBRE{' '}
          <motion.span
            className='text-red-600'
            whileHover={animations.textGlow}
          >
            NOSOTROS
          </motion.span>
        </motion.h1>
        <motion.p
          variants={animations.fadeInUp}
          className='text-white text-lg mb-8 max-w-2xl mx-auto'
        >
          Conocé nuestra historia, valores y lo que nos hace únicos en el rubro
          automotriz.
        </motion.p>
      </motion.div>
    </section>
  )
}
