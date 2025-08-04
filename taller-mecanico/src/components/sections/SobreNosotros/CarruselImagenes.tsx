'use client'
import React, { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const imagenes = [
  '/images/sobrenosotros/carru1.jpg',
  '/images/sobrenosotros/carru2.jpg',
  '/images/sobrenosotros/carru3.jpg',
  '/images/sobrenosotros/carru4.jpg',
  '/images/sobrenosotros/carru5.jpg',
  '/images/sobrenosotros/carru6.jpg',
  '/images/sobrenosotros/carru7.jpg',
  '/images/sobrenosotros/carru8.jpg',
]

export default function CarruselImagenes() {
  const [actual, setActual] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const total = imagenes.length
  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, { once: true, margin: '-50px' })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const siguiente = () => setActual((actual + 1) % total)
  const anterior = () => setActual((actual - 1 + total) % total)

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
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <section
      className='py-4 md:py-8'
      style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #ffe5e5 100%)',
      }}
      ref={sectionRef}
    >
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isSectionInView ? 'visible' : 'hidden'}
        className='max-w-5xl mx-auto flex flex-col items-center px-4'
      >
        <div className='flex flex-col items-center w-full'>
          <motion.div
            variants={fadeInUp}
            className='flex items-center justify-center gap-2 md:gap-6 mb-4 w-full max-w-sm md:max-w-none'
          >
            <motion.button
              onClick={anterior}
              className='rounded-full bg-white shadow-lg border-2 border-red-200 hover:bg-red-600 hover:text-white text-red-600 text-2xl md:text-3xl font-bold w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 flex-shrink-0'
              aria-label='Anterior'
              style={{ cursor: 'pointer' }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 },
              }}
            >
              &lt;
            </motion.button>
            <div className='flex gap-3 md:gap-6 items-center min-h-[120px] md:min-h-[180px] justify-center flex-1'>
              {imagenes.map((img, idx) => (
                <motion.img
                  key={img}
                  src={img}
                  alt={`Imagen taller ${idx + 1}`}
                  className={`w-64 md:w-72 max-w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border-3 md:border-4 transition-all duration-700 ease-in-out ${
                    idx === actual
                      ? 'border-red-600 scale-105 opacity-100 z-10'
                      : 'border-transparent scale-90 z-0'
                  }`}
                  style={{
                    display: isMobile
                      ? idx === actual
                        ? 'block'
                        : 'none'
                      : Math.abs(idx - actual) <= 1 ||
                        (idx === 0 && actual === total - 1) ||
                        (idx === total - 1 && actual === 0)
                      ? 'block'
                      : 'none',
                  }}
                  whileHover={{
                    scale: idx === actual ? 1.1 : 1.05,
                    transition: { duration: 0.3 },
                  }}
                />
              ))}
            </div>
            <motion.button
              onClick={siguiente}
              className='rounded-full bg-white shadow-lg border-2 border-red-200 hover:bg-red-600 hover:text-white text-red-600 text-2xl md:text-3xl font-bold w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 flex-shrink-0'
              aria-label='Siguiente'
              style={{ cursor: 'pointer' }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 },
              }}
            >
              &gt;
            </motion.button>
          </motion.div>
        </div>
        <motion.div
          variants={fadeInUp}
          className='mt-4 md:mt-6 flex gap-2 md:gap-3'
        >
          {imagenes.map((_, idx) => (
            <motion.span
              key={idx}
              onClick={() => setActual(idx)}
              className={`h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-red-200 transition-all duration-300 cursor-pointer ${
                idx === actual
                  ? 'bg-red-600 scale-110 shadow-lg border-red-600'
                  : 'bg-gray-300 scale-90'
              }`}
              style={{
                boxShadow: idx === actual ? '0 0 10px #dc2626aa' : 'none',
              }}
              whileHover={{
                scale: 1.2,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.9,
                transition: { duration: 0.1 },
              }}
            ></motion.span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
