'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function TrabajaConNosotros() {
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section className='py-20 bg-black text-white' ref={sectionRef}>
      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-7xl mx-auto px-4'
      >
        <motion.h2
          variants={animations.fadeInUp}
          className='text-4xl md:text-5xl font-extrabold text-center mb-12'
        >
          TRABAJA CON{' '}
          <motion.span
            className='text-red-600'
            whileHover={animations.textGlow}
          >
            NOSOTROS
          </motion.span>
        </motion.h2>
        <motion.div
          variants={animations.fadeInUp}
          className='grid grid-cols-1 md:grid-cols-2 gap-10'
        >
          <motion.div
            variants={animations.fadeInUp}
            className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'
            whileHover={{
              y: -5,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          >
            <motion.img
              src='/images/servicios/servicios.png'
              alt='Particulares'
              className='w-full h-56 object-cover'
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            />
            <div className='p-8'>
              <motion.h3
                variants={animations.fadeInUp}
                className='text-2xl font-bold mb-2'
              >
                SERVICIOS A{' '}
                <motion.span
                  className='text-red-600'
                  whileHover={animations.textGlow}
                >
                  PARTICULARES
                </motion.span>
              </motion.h3>
              <motion.p
                variants={animations.fadeInUp}
                className='text-gray-200'
              >
                Nos especializamos en brindar a los conductores particulares un
                servicio personalizado y de alta calidad. Nuestro equipo de
                mecánicos altamente capacitados brinda atención personalizada,
                asegurándonos de que cada uno de nuestros clientes reciba
                soluciones que se ajusten a sus necesidades específicas.
                Ofrecemos servicios únicos en la zona.
              </motion.p>
            </div>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'
            whileHover={{
              y: -5,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          >
            <motion.img
              src='/images/servicios/flota.png'
              alt='Empresas'
              className='w-full h-56 object-cover'
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            />
            <div className='p-8'>
              <motion.h3
                variants={animations.fadeInUp}
                className='text-2xl font-bold mb-2'
              >
                SERVICIOS A{' '}
                <motion.span
                  className='text-red-600'
                  whileHover={animations.textGlow}
                >
                  EMPRESAS
                </motion.span>
              </motion.h3>
              <motion.p
                variants={animations.fadeInUp}
                className='text-gray-200'
              >
                Entendemos que las empresas necesitan que sus flotas de
                vehículos estén operativas en todo momento. Nuestro servicio
                especializado para empresas ofrece atención rápida y eficaz, con
                planes de mantenimiento preventivo adaptados a las necesidades
                de cada cliente. Ya sea que se trate de una flota pequeña o de
                gran tamaño, trabajamos para asegurar que tu empresa no se vea
                afectada por tiempos de inactividad.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
