'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ProgramacionModulos() {
  const modulosRef = useRef(null)
  const isModulosInView = useInView(modulosRef, {
    once: true,
    margin: '-100px',
  })

  return (
    <section
      className='py-20 text-white relative'
      style={{
        backgroundImage: "url('/images/sobrenosotros/combinadoflex.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      ref={modulosRef}
    >
      <div
        className='absolute inset-0 bg-gray-900'
        style={{ opacity: 0.6, pointerEvents: 'none' }}
      />
      <div className='relative max-w-7xl mx-auto px-4'>
        <motion.div
          variants={animations.fadeInUp}
          initial='hidden'
          animate={isModulosInView ? 'visible' : 'hidden'}
          className='text-center mb-16'
        >
          <motion.h2
            variants={animations.fadeInUp}
            className='text-4xl md:text-5xl font-bold mb-6'
          >
            PROGRAMACIÓN DE{' '}
            <motion.span
              className='text-red-600'
              whileHover={animations.textGlow}
            >
              MÓDULOS
            </motion.span>
          </motion.h2>
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-300 text-lg max-w-3xl mx-auto'
          >
            Servicios avanzados de programación y reprogramación de ECUs,
            módulos de control y sistemas electrónicos
          </motion.p>
        </motion.div>
        {/* Grid de servicios de programación */}
        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isModulosInView ? 'visible' : 'hidden'}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'
        >
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.05,
              y: -10,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'
          >
            <motion.div
              className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            >
              <span className='text-white text-lg font-bold'>S1</span>
            </motion.div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 1</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación básica para optimizar el rendimiento del motor y
              mejorar la eficiencia de combustible.
            </p>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.05,
              y: -10,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'
          >
            <motion.div
              className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            >
              <span className='text-white text-lg font-bold'>S2</span>
            </motion.div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 2</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación avanzada con modificaciones en hardware para
              maximizar el potencial del vehículo.
            </p>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.05,
              y: -10,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'
          >
            <motion.div
              className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            >
              <span className='text-white text-lg font-bold'>S3</span>
            </motion.div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 3</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación extrema para competición con modificaciones
              integrales del sistema.
            </p>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.05,
              y: -10,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'
          >
            <motion.div
              className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
            >
              <span className='text-white text-lg font-bold'>ECU</span>
            </motion.div>
            <h3 className='text-xl font-bold mb-4'>Programación ECU</h3>
            <p className='text-gray-300 text-sm'>
              Programación completa de ECUs nuevas y reprogramación de módulos
              existentes para todas las marcas.
            </p>
          </motion.div>
        </motion.div>
        {/* Servicios adicionales */}
        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isModulosInView ? 'visible' : 'hidden'}
          className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'
        >
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.02,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg'
          >
            <motion.h4
              variants={animations.fadeInUp}
              className='text-2xl font-bold mb-4 text-red-600'
            >
              Codificación de Módulos
            </motion.h4>
            <motion.p
              variants={animations.fadeInUp}
              className='text-gray-300 mb-4'
            >
              Codificación de módulos nuevos, adaptación de componentes y
              configuración de sistemas específicos para cada vehículo.
            </motion.p>
            <motion.ul
              variants={animations.fadeInUp}
              className='text-gray-300 text-sm space-y-2'
            >
              <li>• Codificación de llaves y sistemas de seguridad</li>
              <li>• Adaptación de componentes nuevos</li>
              <li>• Configuración de sistemas avanzados</li>
            </motion.ul>
          </motion.div>
          <motion.div
            variants={animations.fadeInUp}
            whileHover={{
              scale: 1.02,
              backgroundColor: '#374151',
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-gray-800 p-8 rounded-lg'
          >
            <motion.h4
              variants={animations.fadeInUp}
              className='text-2xl font-bold mb-4 text-red-600'
            >
              Reprogramación Personalizada
            </motion.h4>
            <motion.p
              variants={animations.fadeInUp}
              className='text-gray-300 mb-4'
            >
              Ajustes específicos según las necesidades del cliente, desde
              mejoras de rendimiento hasta corrección de fallas.
            </motion.p>
            <motion.ul
              variants={animations.fadeInUp}
              className='text-gray-300 text-sm space-y-2'
            >
              <li>• Eliminación de FAP/DPF</li>
              <li>• Desactivación de EGR</li>
              <li>• Optimización de mapas de inyección</li>
            </motion.ul>
          </motion.div>
        </motion.div>
        {/* Call to action */}
        <motion.div
          variants={animations.fadeInUp}
          initial='hidden'
          animate={isModulosInView ? 'visible' : 'hidden'}
          className='text-center'
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.5, ease: 'easeOut' as const },
            }}
            className='bg-red-600 p-8 rounded-lg inline-block'
          >
            <motion.h4
              variants={animations.fadeInUp}
              className='text-2xl font-bold mb-4'
            >
              Consulta Especializada
            </motion.h4>
            <motion.p variants={animations.fadeInUp} className='mb-6'>
              Cada vehículo requiere un análisis personalizado. Consultanos
              sobre las posibilidades para tu auto.
            </motion.p>
            <Link href='/contacto'>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#f3f4f6',
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
                className='bg-white text-red-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all cursor-pointer'
              >
                Consultar Ahora
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
