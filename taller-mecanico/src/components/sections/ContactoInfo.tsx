'use client'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { animations } from '@/lib/animations'

export default function ContactoInfo() {
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <div
      className='w-full bg-transparent flex flex-col items-center pt-12 pb-8'
      ref={sectionRef}
    >
      <motion.div
        variants={animations.staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center'
      >
        {/* Teléfono */}
        <motion.div
          variants={animations.fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.5, ease: 'easeOut' as const },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          >
            <FaPhone className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={animations.fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            TELÉFONO
          </motion.h3>
          <motion.span
            variants={animations.fadeInUp}
            className='text-base font-medium'
          >
            +54 9 3364 69-4921
          </motion.span>
        </motion.div>
        {/* Email */}
        <motion.div
          variants={animations.fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.5, ease: 'easeOut' as const },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          >
            <FaEnvelope className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={animations.fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            EMAIL
          </motion.h3>
          <motion.span
            variants={animations.fadeInUp}
            className='text-base font-medium break-words text-center'
          >
            contacto@mecanicagrandoli.com
          </motion.span>
        </motion.div>
        {/* Dirección */}
        <motion.div
          variants={animations.fadeInUp}
          className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'
          whileHover={{
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.5, ease: 'easeOut' as const },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
          >
            <FaMapMarkerAlt className='text-red-600 text-3xl mb-2' />
          </motion.div>
          <motion.h3
            variants={animations.fadeInUp}
            className='font-bold text-lg mb-1 text-red-600 tracking-wide'
          >
            DIRECCIÓN
          </motion.h3>
          <motion.span
            variants={animations.fadeInUp}
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
