'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function ServiciosHero() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-50px' })

  // Animaciones simplificadas
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }
  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/servicios/servicios.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
      ref={heroRef}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isHeroInView ? 'visible' : 'hidden'}
        className='relative z-10 max-w-4xl mx-auto text-center px-4'
      >
        <motion.h1
          variants={fadeInUp}
          className='text-5xl md:text-6xl font-extrabold mb-6 text-white'
        >
          NUESTROS{' '}
          <motion.span
            className='text-red-600'
            whileHover={{
              textShadow: '0px 0px 8px rgb(239, 68, 68)',
              transition: { duration: 0.3 },
            }}
          >
            SERVICIOS
          </motion.span>
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className='text-white text-lg mb-8 max-w-2xl mx-auto'
        >
          Especialistas en cajas automáticas, mecánica general y programación de
          módulos. Soluciones para particulares y empresas.
        </motion.p>
      </motion.div>
    </section>
  )
}
