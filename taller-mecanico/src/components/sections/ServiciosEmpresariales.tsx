'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ServiciosEmpresariales() {
  const mainRef = useRef(null)
  const brandsRef = useRef(null)
  const specializedRef = useRef(null)

  const isMainInView = useInView(mainRef, { once: true, margin: '-100px' })
  const isBrandsInView = useInView(brandsRef, { once: true, margin: '-100px' })
  const isSpecializedInView = useInView(specializedRef, {
    once: true,
    margin: '-100px',
  })

  // Animaciones más suaves para las marcas
  const brandVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  }

  const services = [
    '✓ Mantenimiento Preventivo Programado',
    '✓ Diagnóstico Electrónico de Flota',
    '✓ Gestión Integral de Flotas',
    '✓ Mas Servicios',
  ]

  const brands = [
    { src: '/images/marcas/transtec.png', alt: 'Transtec' },
    { src: '/images/marcas/valvoline.png', alt: 'Valvoline' },
    { src: '/images/marcas/altomadeinusa.png', alt: 'Alto' },
    { src: '/images/marcas/precision.png', alt: 'Precision' },
    { src: '/images/marcas/raybestos.png', alt: 'Raybestos' },
    { src: '/images/marcas/borgwarner.png', alt: 'BorgWarner' },
  ]

  const specializedServices = [
    'CAPACITACIÓN TÉCNICA\nPROFESIONAL',
    'DIAGNÓSTICO AUTOMOTRIZ\nAVANZADO',
    'SERVICIO ESPECIALIZADO DE\nCAJAS AUTOMÁTICAS',
  ]

  return (
    <>
      {/* Sección Principal */}
      <section
        className='relative w-full min-h-[600px] flex items-center justify-center py-20'
        style={{
          backgroundImage: "url('/images/servicios/flota.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left',
          backgroundAttachment: 'fixed',
        }}
        ref={mainRef}
      >
        <div className='absolute inset-0 bg-black/70 z-0'></div>
        <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 relative z-10'>
          <div className='hidden lg:block'></div>

          <motion.div
            variants={animations.staggerContainer}
            initial='hidden'
            animate={isMainInView ? 'visible' : 'hidden'}
            className='flex flex-col items-end text-right space-y-6'
          >
            <motion.h2
              variants={animations.fadeInRight}
              className='text-white font-extrabold text-5xl mb-2'
            >
              SERVICIOS <br />
              <motion.span
                className='relative text-red-600 inline-block'
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                EMPRESARIALES
              </motion.span>
            </motion.h2>

            <motion.p
              variants={animations.fadeInRight}
              className='text-white text-lg max-w-xl mt-6 mb-8'
            >
              Desarrollamos soluciones integrales para el mantenimiento y
              gestión de flotas vehiculares. Ofrecemos planes personalizados que
              incluyen mantenimiento preventivo programado, servicio de
              emergencia móvil, diagnóstico electrónico avanzado y gestión
              completa de documentación.
            </motion.p>

            <motion.ul
              variants={animations.staggerContainer}
              className='text-white text-lg font-bold space-y-2 mb-10'
            >
              {services.map((service, index) => (
                <motion.li
                  key={index}
                  variants={animations.listItemVariants}
                  whileHover={{
                    x: -5,
                    transition: { duration: 0.4, ease: 'easeOut' as const },
                  }}
                  className='cursor-pointer hover:text-red-400 transition-colors duration-200 text-right'
                >
                  {service}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={animations.fadeInRight}>
              <Link href='/servicios'>
                <Button variant='primary' size='lg'>
                  Ver Más
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sección de Marcas */}
      <section className='bg-white py-12' ref={brandsRef}>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <motion.h3
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isBrandsInView ? 'visible' : 'hidden'}
            className='text-red-600 font-bold tracking-widest text-lg mb-6'
          >
            TRABAJANDO SIEMPRE CON LAS PRIMERAS MARCAS
          </motion.h3>

          <motion.p
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isBrandsInView ? 'visible' : 'hidden'}
            className='text-gray-800 text-lg mb-1'
          >
            Utilizamos repuestos originales y tecnología avanzada para
            garantizar la máxima calidad y rendimiento en cada servicio.
          </motion.p>

          <motion.p
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isBrandsInView ? 'visible' : 'hidden'}
            className='text-gray-800 text-lg mb-10'
          >
            Brindamos soluciones confiables y eficientes tanto para vehículos
            particulares como para flotas.
          </motion.p>

          <motion.div
            variants={animations.staggerContainer}
            initial='hidden'
            animate={isBrandsInView ? 'visible' : 'hidden'}
            className='flex flex-wrap justify-center items-center gap-8'
          >
            {brands.map((brand, index) => (
              <motion.img
                key={index}
                variants={brandVariants}
                whileHover={{
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                src={brand.src}
                alt={brand.alt}
                className='max-h-20 max-w-[150px] object-contain p-2 mx-2 cursor-pointer hover:opacity-80 transition-opacity duration-300'
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sección de Servicios Especializados */}
      <section
        className='relative w-full min-h-[500px] flex flex-col items-center justify-center py-20'
        style={{
          backgroundImage: "url('/images/home/revisacion.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
        ref={specializedRef}
      >
        <div className='absolute inset-0 bg-black/80 z-0'></div>
        <div className='relative z-10 w-full max-w-5xl mx-auto text-center px-4'>
          <motion.h2
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isSpecializedInView ? 'visible' : 'hidden'}
            className='text-5xl md:text-6xl font-extrabold mb-6 text-white'
          >
            SERVICIOS{' '}
            <motion.span
              className='text-red-600'
              whileHover={{
                textShadow: '0px 0px 8px rgb(239, 68, 68)',
                transition: { duration: 0.3 },
              }}
            >
              ESPECIALIZADOS
            </motion.span>
          </motion.h2>

          <motion.p
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isSpecializedInView ? 'visible' : 'hidden'}
            className='text-white text-lg mb-10'
          >
            Brindamos atención especializada para tu vehículo con tecnología de
            última generación. Nuestro equipo de técnicos certificados realiza
            diagnósticos precisos y reparaciones profesionales en mecánica
            general, cajas automáticas, sistemas electrónicos y programación de
            módulos.
          </motion.p>

          <motion.div
            variants={animations.staggerContainer}
            initial='hidden'
            animate={isSpecializedInView ? 'visible' : 'hidden'}
            className='flex flex-col md:flex-row justify-center gap-6 mb-10'
          >
            {specializedServices.map((service, index) => (
              <motion.div
                key={index}
                variants={animations.cardVariants}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  transition: { duration: 0.3 },
                }}
                className='border-2 border-red-600 rounded-lg px-6 py-4 text-white font-bold text-lg tracking-wide text-center min-w-[260px] w-72 cursor-pointer hover:border-red-400 hover:bg-red-600/10 transition-all duration-300'
              >
                {service.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>{line}</div>
                ))}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={animations.fadeInUp}
            initial='hidden'
            animate={isSpecializedInView ? 'visible' : 'hidden'}
          >
            <Link href='/servicios'>
              <Button variant='primary' size='lg'>
                Ver Más
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
