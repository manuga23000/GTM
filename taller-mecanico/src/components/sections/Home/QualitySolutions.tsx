'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function QualitySolutions() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })


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
        duration: 1.2,
        delay: custom * 0.3,
        ease: 'easeOut' as const,
      },
    }),
  }


  const floatVariants = {
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }


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
      src: '/images/soluciones/flex.jpg',
      alt: 'Detalle motor GTM',
      rotate: 1,
    },
  ]

  return (
    <section className='py-20 bg-white text-black' ref={ref}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>

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
                    transition: { duration: 0.5, ease: 'easeOut' as const },
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


          <div className='space-y-6'>
            <div>
              <motion.p
                variants={animations.fadeInLeft}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                className='text-gray-600 text-lg font-medium italic mb-4'
              >
                Tu Aliado En Soluciones Automotrices
              </motion.p>

              <motion.h2
                variants={animations.fadeInUp}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                className='text-4xl md:text-5xl font-bold leading-tight mb-6'
              >
                SOLUCIONES DE
                <br />
                <motion.span
                  className='text-red-500'
                  whileHover={animations.textGlow}
                >
                  CALIDAD
                </motion.span>
              </motion.h2>
            </div>

            <motion.div
              variants={animations.fadeInUp}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              className='space-y-4'
            >
              <p className='text-gray-700 text-lg leading-relaxed'>
                En <strong>GTM</strong> brindamos un servicio integral de
                mantenimiento y reparación, desde cajas automáticas con
                diagnósticos y reprogramaciones avanzadas, hasta mecánica
                general: motores, frenos y suspensión.
              </p>

              <p className='text-gray-700 text-lg leading-relaxed'>
                Con un enfoque tecnológico, resolvemos fallas eléctricas y
                electrónicas, incorporamos dispositivos modernos y usamos
                equipos de diagnóstico de última generación. Reparamos y
                reprogramamos ECUs, módulos y cajas de fusibles.
              </p>

              <p className='text-gray-700 text-lg leading-relaxed'>
                También realizamos{' '}
                <strong>programaciones Stage 1, 2 y 3</strong> para mejorar el
                rendimiento del motor, adaptándolo desde uso urbano hasta alta
                performance.
              </p>
            </motion.div>

            <motion.div
              variants={animations.fadeInUp}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              className='flex flex-col sm:flex-row gap-4 pt-4'
            >
              <Link href='/servicios' className='block'>
                <motion.button
                  whileHover={animations.buttonHover}
                  whileTap={animations.buttonTap}
                  className='w-full bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 cursor-pointer'
                >
                  CONOCER SERVICIOS
                </motion.button>
              </Link>
              <Link href='/contacto' className='block'>
                <motion.button
                  whileHover={animations.buttonHover}
                  whileTap={animations.buttonTap}
                  className='w-full border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors duration-300 cursor-pointer'
                >
                  CONTACTAR
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
