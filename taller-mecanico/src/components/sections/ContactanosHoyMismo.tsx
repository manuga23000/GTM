'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ContactanosHoyMismo() {
  const contactRef = useRef(null)
  const isContactInView = useInView(contactRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section
      className='relative w-full min-h-[450px] flex flex-col items-center justify-center py-16'
      style={{
        backgroundImage: "url('/images/home/cajaautomatica.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      ref={contactRef}
    >
      <div className='absolute inset-0 bg-black/60 z-0'></div>
      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isContactInView ? 'visible' : 'hidden'}
        className='relative z-10 w-full max-w-3xl mx-auto text-center px-4'
      >
        <motion.p
          variants={animations.fadeInUp}
          className='text-white text-sm mb-2 italic'
        >
          Confiá en los expertos para mantener tu vehículo en óptimas
          condiciones.
        </motion.p>

        <motion.h2
          variants={animations.fadeInUp}
          className='text-4xl md:text-5xl font-extrabold mb-6 text-white'
        >
          CONTÁCTANOS{' '}
          <motion.span
            className='text-red-600'
            whileHover={animations.textGlow}
          >
            HOY
          </motion.span>{' '}
          MISMO.
        </motion.h2>

        <motion.div
          variants={animations.fadeInUp}
          whileHover={{
            scale: 1.05,
            y: -5,
            transition: { duration: 0.5, ease: 'easeOut' as const },
          }}
          className='flex justify-center mb-8'
        >
          <img
            src='/images/home/atf.png'
            alt='Máquina ATF'
            className='h-110 object-contain drop-shadow-xl'
          />
        </motion.div>

        <motion.div variants={animations.fadeInUp}>
          <Link href='/contacto'>
            <Button variant='primary' size='lg'>
              Contacto
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
