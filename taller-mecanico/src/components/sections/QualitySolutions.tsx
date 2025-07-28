'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function QualitySolutions() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Animaciones para las imágenes
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotate: 0,
    },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: custom,
      transition: {
        duration: 0.6,
        delay: custom * 0.15, // Entrada escalonada
      },
    }),
  }

  // Animación continua de levitación
  const floatVariants = {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
      },
    },
  }

  // Animaciones para el texto
  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.5,
      },
    },
  }

  const paragraphVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.7 + custom * 0.2,
      },
    }),
  }

  // Datos de las imágenes con sus rotaciones
  const images = [
    {
      src: '/images/soluciones/motor1.jpg',
      alt: 'Motor principal GTM',
      rotate: 1,
    },
    {
      src: '/images/soluciones/motor2.jpg',
      alt: 'Componentes del motor',
      rotate: -1,
    },
    {
      src: '/images/soluciones/motor3.jpg',
      alt: 'Transmisión GTM',
      rotate: -1,
    },
    {
      src: '/images/soluciones/motor4.jpg',
      alt: 'Detalle motor GTM',
      rotate: 1,
    },
  ]

  return (
    <section className='py-20 bg-white text-black' ref={ref}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Grid de 4 imágenes 2x2 - ANIMADO */}
          <div className='grid grid-cols-2 gap-4'>
            {images.map((image, index) => (
              <motion.div
                key={index}
                custom={image.rotate}
                variants={imageVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:border-red-400 transition-colors duration-300'
              >
                <motion.div
                  variants={floatVariants}
                  animate='animate'
                  whileHover={{
                    scale: 1.05,
                    rotate: image.rotate * 2,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className='w-full h-full'
                  style={{ transform: `rotate(${image.rotate}deg)` }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className='object-cover transition-transform duration-300'
                  />

                  {/* Overlay que aparece en hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{
                      opacity: 1,
                      transition: { duration: 0.3 },
                    }}
                    className='absolute inset-0 bg-red-500/20 flex items-center justify-center'
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{
                        scale: 1,
                        transition: { delay: 0.1, duration: 0.2 },
                      }}
                      className='bg-white/90 rounded-full p-3'
                    >
                      <svg
                        className='w-6 h-6 text-red-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Contenido de texto - ANIMADO */}
          <div className='space-y-6'>
            <div>
              <motion.p
                variants={textVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                className='text-gray-600 text-lg font-medium italic mb-4'
              >
                Tu Aliado En Soluciones Automotrices
              </motion.p>

              <motion.h2
                variants={titleVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                className='text-4xl md:text-5xl font-bold leading-tight mb-6'
              >
                SOLUCIONES CON
                <br />
                <motion.span
                  className='text-red-500'
                  whileHover={{
                    textShadow: '0px 0px 8px rgb(239, 68, 68)',
                    transition: { duration: 0.3 },
                  }}
                >
                  CALIDAD
                </motion.span>
              </motion.h2>
            </div>

            <motion.div
              variants={paragraphVariants}
              custom={0}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              className='space-y-4'
            >
              <p className='text-gray-700 text-lg leading-relaxed'>
                En GTM, nos especializamos en brindar soluciones integrales para
                tu vehículo. Nuestro equipo de técnicos certificados utiliza
                tecnología de última generación para diagnosticar y reparar
                cualquier problema que pueda tener tu automóvil.
              </p>

              <p className='text-gray-700 text-lg leading-relaxed'>
                Desde trabajos de mecánica general hasta reparaciones complejas
                de cajas automáticas y sistemas electrónicos, garantizamos
                resultados duraderos y un servicio de excelencia que supera las
                expectativas de nuestros clientes.
              </p>
            </motion.div>

            <motion.div
              variants={paragraphVariants}
              custom={1}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              className='flex flex-col sm:flex-row gap-4 pt-4'
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                className='bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300'
              >
                CONOCER SERVICIOS
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                className='border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors duration-300'
              >
                CONTACTAR
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
