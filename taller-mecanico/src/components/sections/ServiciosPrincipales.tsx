'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export default function ServiciosPrincipales() {
  const serviciosRef = useRef(null)
  const isServiciosInView = useInView(serviciosRef, {
    once: true,
    margin: '-50px',
  })

  // Animaciones simplificadas
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }
  const servicios = [
    {
      titulo: 'CAJAS AUTOMÁTICAS',
      descripcion:
        'En Mecánica Grandoli, somos expertos en diagnosticar y reparar cajas automáticas para vehículos de todas las marcas. Realizamos mantenimiento preventivo y correctivo para asegurar el óptimo desempeño de tu transmisión, prolongando su vida útil. También llevamos a cabo reprogramaciones y ajustes personalizados, utilizando tecnología de punta para garantizar un funcionamiento suave y eficiente.',
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
    <section className='py-20 bg-white' ref={serviciosRef}>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          variants={fadeInUp}
          initial='hidden'
          animate={isServiciosInView ? 'visible' : 'hidden'}
          className='text-center mb-16'
        >
          <motion.h2
            variants={fadeInUp}
            className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'
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
            variants={fadeInUp}
            className='text-gray-600 text-lg max-w-2xl mx-auto'
          >
            Nuestras especialidades con tecnología de última generación
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate={isServiciosInView ? 'visible' : 'hidden'}
          className='space-y-20'
        >
          {servicios.map((servicio, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                servicio.lado === 'derecha' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <motion.div
                className='lg:w-1/2'
                variants={
                  servicio.lado === 'derecha' ? fadeInRight : fadeInLeft
                }
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <img
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  className='w-full h-80 object-cover rounded-lg shadow-lg'
                />
              </motion.div>
              <motion.div
                className='lg:w-1/2'
                variants={
                  servicio.lado === 'derecha' ? fadeInLeft : fadeInRight
                }
              >
                <motion.h3
                  variants={fadeInUp}
                  className='text-3xl font-bold text-red-600 mb-6'
                >
                  {servicio.titulo}
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  className='text-gray-700 text-lg leading-relaxed mb-8'
                >
                  {servicio.descripcion}
                </motion.p>
                <Link href='/contacto'>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: '#dc2626',
                      transition: { duration: 0.3 },
                    }}
                    className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg cursor-pointer'
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
