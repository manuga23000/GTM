import { motion, useInView } from 'framer-motion'
import { animations } from '@/lib/animations'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const specializedServices = [
  'CAPACITACIÓN TÉCNICA\nPROFESIONAL',
  'DIAGNÓSTICO AUTOMOTRIZ\nAVANZADO',
  'SERVICIO ESPECIALIZADO DE\nCAJAS AUTOMÁTICAS',
]

export default function ServiciosEspecializados() {
  const specializedRef = useRef(null)
  const isSpecializedInView = useInView(specializedRef, {
    once: true,
    margin: '-100px',
  })

  return (
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
          className='flex flex-col md:flex-row justify-center items-center gap-6 mb-10'
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
              className='border-2 border-red-600 rounded-lg px-6 py-4 text-white font-bold text-lg tracking-wide text-center w-full max-w-[280px] cursor-pointer hover:border-red-400 hover:bg-red-600/10 transition-all duration-300'
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
  )
}
