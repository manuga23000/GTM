'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { animations } from '@/lib/animations'

export default function ServiciosPrincipales() {
  const serviciosRef = useRef(null)
  const isServiciosInView = useInView(serviciosRef, {
    once: true,
    margin: '-100px',
  })

  const servicios = [
    {
      titulo: 'CAJAS AUTOMÁTICAS',
      descripcion:
        'En GTM, somos expertos en diagnosticar y reparar cajas automáticas para vehículos de todas las marcas. Realizamos mantenimiento preventivo y correctivo para asegurar el óptimo desempeño de tu transmisión, prolongando su vida útil. También llevamos a cabo reprogramaciones y ajustes personalizados, utilizando tecnología de punta para garantizar un funcionamiento suave y eficiente.',
      imagen: '/images/servicios/caja.jpg',
      lado: 'izquierda',
    },
    {
      titulo: 'REPARACIÓN DE ECUS',
      descripcion:
        'Nos especializamos en diagnosticar y reparar las ECUs de tu vehículo, corrigiendo problemas electrónicos que afectan el desempeño general. Realizamos reprogramaciones avanzadas para optimizar el rendimiento y la eficiencia, además de sustituir o restaurar ECUs dañadas con soluciones adaptadas a tus necesidades.',
      imagen: '/images/servicios/ecu.jpg',
      lado: 'derecha',
    },
    {
      titulo: 'TRABAJOS DE ELECTRÓNICA',
      descripcion:
        'Nuestra especialidad en electrónica nos permite solucionar fallas en sistemas eléctricos y electrónicos del vehículo, como sensores, iluminación, y paneles de control. También instalamos y configuramos dispositivos electrónicos adicionales para modernizar y personalizar tu auto, asegurándonos de que funcione con precisión.',
      imagen: '/images/servicios/electronica.jpg',
      lado: 'izquierda',
    },
  ]

  return (
    <section className='py-12 md:py-20 bg-white' ref={serviciosRef}>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          variants={animations.fadeInUp}
          initial='hidden'
          animate={isServiciosInView ? 'visible' : 'hidden'}
          className='text-center mb-12 md:mb-16'
        >
          <motion.h2
            variants={animations.fadeInUp}
            className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'
          >
            SERVICIOS{' '}
            <motion.span
              className='text-red-600'
              whileHover={animations.textGlow}
            >
              ESPECIALIZADOS
            </motion.span>
          </motion.h2>
          <motion.p
            variants={animations.fadeInUp}
            className='text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4'
          >
            Nuestras especialidades con tecnología de última generación
          </motion.p>
        </motion.div>

        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isServiciosInView ? 'visible' : 'hidden'}
          className='space-y-12 md:space-y-20'
        >
          {servicios.map((servicio, index) => (
            <motion.div
              key={index}
              variants={animations.fadeInUp}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
              className={`flex flex-col lg:flex-row items-center gap-8 md:gap-12 ${
                servicio.lado === 'derecha' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <motion.div
                className='w-full lg:w-1/2'
                variants={
                  servicio.lado === 'derecha'
                    ? animations.fadeInRight
                    : animations.fadeInLeft
                }
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
              >
                <Image
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  width={600}
                  height={320}
                  className='w-full h-64 md:h-80 object-cover rounded-lg shadow-lg'
                />
              </motion.div>
              <motion.div
                className='w-full lg:w-1/2 text-center lg:text-left'
                variants={
                  servicio.lado === 'derecha'
                    ? animations.fadeInLeft
                    : animations.fadeInRight
                }
              >
                <motion.h3
                  variants={animations.fadeInUp}
                  className='text-2xl md:text-3xl font-bold text-red-600 mb-4 md:mb-6'
                >
                  {servicio.titulo}
                </motion.h3>
                <motion.p
                  variants={animations.fadeInUp}
                  className='text-gray-700 text-base md:text-lg leading-relaxed mb-6 md:mb-8 px-2 md:px-0'
                >
                  {servicio.descripcion}
                </motion.p>
                <Link href='/contacto'>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: '#dc2626',
                      transition: { duration: 0.5, ease: 'easeOut' as const },
                    }}
                    className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 md:px-8 rounded-lg transition-all shadow-lg cursor-pointer w-full md:w-auto'
                  >
                    Solicitar
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
