'use client'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function ContactoInfo() {
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
    <div
      className='w-full bg-transparent flex flex-col items-center pt-12 pb-8'
      ref={sectionRef}
    >
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center'
      >
        {/* Teléfono */}
        <motion.div
          variants={fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <FaPhone className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            TELÉFONO
          </motion.h3>
          <motion.span variants={fadeInUp} className='text-base font-medium'>
            +54 9 3364 69-4921
          </motion.span>
        </motion.div>
        {/* Email */}
        <motion.div
          variants={fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <FaEnvelope className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            EMAIL
          </motion.h3>
          <motion.span
            variants={fadeInUp}
            className='text-base font-medium break-words text-center'
          >
            contacto@mecanicagrandoli.com
          </motion.span>
        </motion.div>
        {/* Dirección */}
        <motion.div
          variants={fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <FaMapMarkerAlt className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            DIRECCIÓN
          </motion.h3>
          <motion.span
            variants={fadeInUp}
            className='text-base font-medium text-center'
          >
            Luis Viale 291,
            <br />
            B2900 San Nicolás de Los Arroyos,
            <br />
            Provincia de Buenos Aires.
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  )
}
