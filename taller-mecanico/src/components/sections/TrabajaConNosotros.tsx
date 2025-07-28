'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function TrabajaConNosotros() {
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
    <section className='py-20 bg-black text-white' ref={sectionRef}>
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-7xl mx-auto px-4'
      >
        <motion.h2
          variants={fadeInUp}
          className='text-4xl md:text-5xl font-extrabold text-center mb-12'
        >
          TRABAJA CON{' '}
          <motion.span
            className='text-red-600'
            whileHover={{
              textShadow: '0px 0px 8px rgb(239, 68, 68)',
              transition: { duration: 0.3 },
            }}
          >
            NOSOTROS
          </motion.span>
        </motion.h2>
        <motion.div
          variants={fadeInUp}
          className='grid grid-cols-1 md:grid-cols-2 gap-10'
        >
          <motion.div
            variants={fadeInUp}
            className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'
            whileHover={{
              y: -5,
              transition: { duration: 0.3 },
            }}
          >
            <motion.img
              src='/images/servicios/servicios.png'
              alt='Particulares'
              className='w-full h-56 object-cover'
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            />
            <div className='p-8'>
              <motion.h3
                variants={fadeInUp}
                className='text-2xl font-bold mb-2'
              >
                SERVICIOS A{' '}
                <motion.span
                  className='text-red-600'
                  whileHover={{
                    textShadow: '0px 0px 8px rgb(239, 68, 68)',
                    transition: { duration: 0.3 },
                  }}
                >
                  PARTICULARES
                </motion.span>
              </motion.h3>
              <motion.p variants={fadeInUp} className='text-gray-200'>
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
            variants={fadeInUp}
            className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'
            whileHover={{
              y: -5,
              transition: { duration: 0.3 },
            }}
          >
            <motion.img
              src='/images/servicios/flota.png'
              alt='Empresas'
              className='w-full h-56 object-cover'
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            />
            <div className='p-8'>
              <motion.h3
                variants={fadeInUp}
                className='text-2xl font-bold mb-2'
              >
                SERVICIOS A{' '}
                <motion.span
                  className='text-red-600'
                  whileHover={{
                    textShadow: '0px 0px 8px rgb(239, 68, 68)',
                    transition: { duration: 0.3 },
                  }}
                >
                  EMPRESAS
                </motion.span>
              </motion.h3>
              <motion.p variants={fadeInUp} className='text-gray-200'>
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
