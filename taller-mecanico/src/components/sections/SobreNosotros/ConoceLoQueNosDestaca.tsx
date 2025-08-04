'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function ConoceLoQueNosDestaca() {
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section className='pt-12 md:pt-20 pb-5 bg-white' ref={sectionRef}>
      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-7xl mx-auto px-4'
      >
        <motion.h2
          variants={animations.fadeInUp}
          className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 md:mb-10 text-black'
        >
          CONOCE LO QUE NOS{' '}
          <motion.span
            className='text-red-600'
            whileHover={animations.textGlow}
          >
            DESTACA
          </motion.span>
        </motion.h2>
        <motion.div
          variants={animations.fadeInUp}
          className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8'
        >
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-800 text-base md:text-lg leading-relaxed'
          >
            En GTM, con más de 20 años de experiencia en el rubro, nos
            especializamos en la reparación y mantenimiento de vehículos.
            Ubicados en Luis Viale 291, San Nicolás de los Arroyos, ofrecemos
            una amplia gama de servicios para satisfacer las necesidades de
            nuestros clientes.
          </motion.p>
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-800 text-base md:text-lg leading-relaxed'
          >
            Contamos con un equipo de especialistas comprometidos con brindar
            atención de calidad y soluciones rápidas y efectivas a demás de las
            herramientas más avanzadas del momento. Nuestra reputación se basa
            en cumplir con los plazos establecidos y ofrecer servicios variados
            y avanzados en la zona.
          </motion.p>
        </motion.div>
        <motion.div
          variants={animations.fadeInUp}
          className='flex justify-center'
        >
          <motion.img
            src='/images/sobrenosotros/camioneta.jpg'
            alt='Camioneta destacada'
            className='w-full h-auto object-contain px-4 md:px-0'
            style={{ maxWidth: '700px' }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
