'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function Hero() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' })

  return (
    <section
      className='relative pt-36 pb-24 sm:pt-28 lg:pt-48 sm:min-h-screen flex items-start sm:items-center overflow-hidden'
      style={{
        backgroundImage: "url('/images/sobrenosotros/combinadoflex.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
      }}
      ref={heroRef}
    >
      {/* Overlay para legibilidad del texto - Más claro en móvil */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 mobile-overlay'></div>

      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isHeroInView ? 'visible' : 'hidden'}
        className='relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-8 text-center lg:text-left'>
            <motion.div variants={animations.fadeInUp} className='space-y-4'>
              <motion.p
                className='text-white text-md font-medium italic'
                whileHover={animations.textGlow}
              >
                Tu Aliado En Soluciones Automotrices
              </motion.p>
              <motion.h1
                className='text-5xl md:text-7xl font-bold leading-tight break-words'
                variants={animations.fadeInUp}
              >
                MANTENIMIENTO
                <br />
                Y REPARACIÓN
                <br />
                CON
                <br />
                <motion.span
                  className='text-red-500 relative inline-block w-full pb-2'
                  whileHover={animations.textGlow}
                >
                  EXPERIENCIA
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.div
              variants={animations.fadeInUp}
              className='flex flex-col sm:flex-row lg:flex-row gap-4 justify-center lg:justify-start'
            >
              <Button
                variant='primary'
                size='lg'
                className='w-full sm:w-auto lg:w-auto'
              >
                PROXIMAMENTE - SISTEMA DE TURNOS
              </Button>
              <Link href='/servicios' className='w-full sm:w-auto lg:w-auto'>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full lg:w-auto'
                >
                  CONOCER MÁS
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Content - Hidden on mobile, visible on large screens */}
          <div className='hidden lg:block'></div>
        </div>
      </motion.div>

      <style jsx>{`
        @media (max-width: 640px) {
          section {
            background-image: url('/images/sobrenosotros/combinadoflexmobile.png') !important;
            background-position: center !important;
            background-size: cover !important;
            background-repeat: no-repeat !important;
          }
          
          /* Overlay más claro en móvil para que la imagen se vea mejor */
          .mobile-overlay {
            background: linear-gradient(
              to right, 
              rgba(0, 0, 0, 0.6), 
              rgba(0, 0, 0, 0.4), 
              rgba(0, 0, 0, 0.3)
            ) !important;
          }
        }

        @media (min-width: 641px) {
          /* Overlay normal en desktop */
          .mobile-overlay {
            background: linear-gradient(
              to right, 
              rgba(0, 0, 0, 0.9), 
              rgba(0, 0, 0, 0.7), 
              rgba(0, 0, 0, 0.5)
            ) !important;
          }
        }
      `}</style>
    </section>
  )
}