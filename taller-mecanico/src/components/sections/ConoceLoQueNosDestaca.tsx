'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function ConoceLoQueNosDestaca() {
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, { once: true, margin: '-50px' })

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
    <section className='pt-20 pb-5 bg-white' ref={sectionRef}>
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-7xl mx-auto px-4'
      >
        <motion.h2
          variants={fadeInUp}
          className='text-4xl md:text-5xl font-extrabold text-center mb-10 text-black'
        >
          CONOCE LO QUE NOS{' '}
          <motion.span
            className='text-red-600'
            whileHover={{
              textShadow: '0px 0px 8px rgb(239, 68, 68)',
              transition: { duration: 0.3 },
            }}
          >
            DESTACA
          </motion.span>
        </motion.h2>
        <motion.div
          variants={fadeInUp}
          className='grid grid-cols-1 md:grid-cols-2 gap-8'
        >
          <motion.p variants={fadeInUp} className='text-gray-800'>
            En GTM, con más de 20 años de experiencia en el rubro, nos
            especializamos en la reparación y mantenimiento de vehículos.
            Ubicados en Luis Viale 291, San Nicolás de los Arroyos, ofrecemos
            una amplia gama de servicios para satisfacer las necesidades de
            nuestros clientes.
          </motion.p>
          <motion.p variants={fadeInUp} className='text-gray-800'>
            Contamos con un equipo de especialistas comprometidos con brindar
            atención de calidad y soluciones rápidas y efectivas a demás de las
            herramientas más avanzadas del momento. Nuestra reputación se basa
            en cumplir con los plazos establecidos y ofrecer servicios variados
            y avanzados en la zona.
          </motion.p>
        </motion.div>
        <motion.div variants={fadeInUp} className='flex justify-center'>
          <motion.img
            src='/images/sobrenosotros/camioneta.jpg'
            alt='Camioneta destacada'
            className='w-full h-auto object-contain'
            style={{ maxWidth: '700px' }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
