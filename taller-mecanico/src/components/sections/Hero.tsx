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
      className='relative pt-36 pb-24 sm:pt-28 sm:min-h-screen flex items-start sm:items-center overflow-hidden'
      style={{
        backgroundImage: "url('/images/home/hero-engine.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
      }}
      ref={heroRef}
    >
      {/* Overlay para legibilidad del texto */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50'></div>

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
              className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'
            >
              <Button variant='primary' size='lg' className='w-full sm:w-auto'>
                PROXIMAMENTE - SISTEMA DE TURNOS
              </Button>
              <Link href='/servicios' className='w-full sm:w-auto'>
                <Button variant='outline' size='lg' className='w-full'>
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
            background-image: url('/images/home/hero-enginemobile.jpg') !important;
            background-position: center !important;
            background-size: cover !important;
            background-repeat: no-repeat !important;
          }
        }
      `}</style>
    </section>
  )
}
