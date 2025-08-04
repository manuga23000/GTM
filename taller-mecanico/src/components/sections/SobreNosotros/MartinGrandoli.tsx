'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function MartinGrandoli() {
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section className='py-20 bg-white' ref={sectionRef}>
      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-4'
      >
        <motion.div variants={animations.fadeInLeft}>
          <motion.h2
            variants={animations.fadeInUp}
            className='text-3xl md:text-4xl font-extrabold mb-2 text-red-600'
          >
            MARTIN GRANDOLI
          </motion.h2>
          <motion.h3
            variants={animations.fadeInUp}
            className='text-gray-700 font-semibold mb-4'
          >
            FUNDADOR DE GTM
          </motion.h3>
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-800 mb-4'
          >
            Martín Grandoli es un profesional con una vasta trayectoria en el
            mundo de la mecánica automotriz, especializado en diagnóstico y
            reparación de vehículos, con un enfoque particular en la reparación
            de cajas automáticas. Con más de 20 años de experiencia en el
            sector, Martín ha trabajado en una amplia variedad de vehículos,
            destacándose por su capacidad de diagnóstico preciso y la calidad de
            sus reparaciones.
          </motion.p>
          <motion.p variants={animations.fadeInUp} className='text-gray-800'>
            A lo largo de su carrera, Martín ha obtenido múltiples
            certificaciones en diversas áreas de la mecánica, que incluyen tanto
            los aspectos fundamentales de la reparación automotriz como
            especializaciones avanzadas. Estas certificaciones le han permitido
            mantenerse a la vanguardia de las innovaciones tecnológicas en el
            campo de la mecánica automotriz, ofreciendo soluciones innovadoras y
            eficaces a sus clientes.
          </motion.p>
        </motion.div>
        <motion.div
          variants={animations.fadeInRight}
          className='flex justify-center items-center h-full'
        >
          <motion.img
            src='/images/sobrenosotros/fotoperfil.png'
            alt='Martín Grandoli'
            className='w-full h-full max-w-[420px] max-h-[420px] object-cover rounded-xl border-4 border-red-600 shadow-lg bg-black'
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
