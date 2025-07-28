'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { animations } from '@/lib/animations'

export default function ServiciosBasicos() {
  const serviciosRef = useRef(null)
  const isServiciosInView = useInView(serviciosRef, {
    once: true,
    margin: '-100px',
  })

  const servicios = [
    {
      titulo: 'MECÁNICA EN GENERAL',
      descripcion:
        'Diagnóstico moderno, reparación de motores, frenos y suspensión.',
      imagen: '/images/servicios/mecanica.png',
    },
    {
      titulo: 'GESTIÓN DE FLOTAS',
      descripcion:
        'Mantenimiento programado y administración integral para empresas.',
      imagen: '/images/servicios/flotas.png',
    },
    {
      titulo: 'DIAGNÓSTICO AVANZADO',
      descripcion: 'Equipos de última generación para todas las marcas.',
      imagen: '/images/servicios/diagnostico.png',
    },
  ]

  return (
    <section className='py-16 bg-gray-100' ref={serviciosRef}>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          variants={animations.staggerContainer}
          initial='hidden'
          animate={isServiciosInView ? 'visible' : 'hidden'}
          className='grid grid-cols-1 md:grid-cols-3 gap-8'
        >
          {servicios.map((servicio, index) => (
            <motion.div
              key={index}
              variants={animations.fadeInUp}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
              className='bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-all'
            >
              <motion.div
                className='mb-4 flex justify-center'
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.5, ease: 'easeOut' as const },
                }}
              >
                <img
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  className='w-20 h-20 object-cover rounded-md shadow-md'
                />
              </motion.div>
              <motion.h3
                variants={animations.fadeInUp}
                className='text-xl font-bold text-gray-900 mb-4'
              >
                {servicio.titulo}
              </motion.h3>
              <motion.p
                variants={animations.fadeInUp}
                className='text-gray-600 mb-6'
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
                  className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg cursor-pointer'
                >
                  Solicitar
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
