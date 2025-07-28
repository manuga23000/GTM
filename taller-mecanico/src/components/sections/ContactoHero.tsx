'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function ContactoHero() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' })

  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/contacto/contactos.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
      ref={heroRef}
    >
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
          whileHover={animations.textGlow}
        >
          CONTACTO
        </motion.h1>
      </motion.div>
    </section>
  )
}
