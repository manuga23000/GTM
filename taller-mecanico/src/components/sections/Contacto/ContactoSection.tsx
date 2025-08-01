'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'

export default function ContactoSection() {
  const contactRef = useRef(null)
  const isContactInView = useInView(contactRef, { once: true, margin: '-50px' })

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
      className='relative w-full min-h-[450px] flex flex-col items-center justify-center py-16'
      style={{
        backgroundImage: "url('/images/home/cajaautomatica.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      ref={contactRef}
    >
      <div className='absolute inset-0 bg-black/60 z-0'></div>
      <motion.div
        variants={staggerContainer}
        initial='hidden'
        animate={isContactInView ? 'visible' : 'hidden'}
        className='relative z-10 w-full max-w-3xl mx-auto text-center px-4'
      >
        <motion.p
          variants={fadeInUp}
          className='text-white text-sm mb-2 italic'
        >
          Confiá en los expertos para mantener tu vehículo en óptimas
          condiciones.
        </motion.p>

        <motion.h2
          variants={fadeInUp}
          className='text-4xl md:text-5xl font-extrabold mb-6 text-white'
        >
          CONTÁCTANOS{' '}
          <motion.span
            className='text-red-600'
            whileHover={{
              textShadow: '0px 0px 8px rgb(239, 68, 68)',
              transition: { duration: 0.3 },
            }}
          >
            HOY
          </motion.span>{' '}
          MISMO
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          whileHover={{
            scale: 1.05,
            y: -5,
            transition: { duration: 0.3 },
          }}
          className='flex justify-center mb-8'
        >
          <Image
            src='/images/home/atf.png'
            alt='Máquina ATF'
            width={400}
            height={440}
            className='h-110 object-contain drop-shadow-xl'
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Link href='/contacto'>
            <Button variant='primary' size='lg'>
              Contacto
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
