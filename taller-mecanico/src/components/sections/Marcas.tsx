import { motion, useInView } from 'framer-motion'
import { animations } from '@/lib/animations'
import { useRef } from 'react'
import Image from 'next/image'

const brands = [
  { src: '/images/marcas/transtec.png', alt: 'Transtec' },
  { src: '/images/marcas/valvoline.png', alt: 'Valvoline' },
  { src: '/images/marcas/altomadeinusa.png', alt: 'Alto' },
  { src: '/images/marcas/precision.png', alt: 'Precision' },
  { src: '/images/marcas/raybestos.png', alt: 'Raybestos' },
  { src: '/images/marcas/borgwarner.png', alt: 'BorgWarner' },
]

const brandVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
}

export default function Marcas() {
  const brandsRef = useRef(null)
  const isBrandsInView = useInView(brandsRef, {
    once: true,
    margin: '-100px',
  })

  return (
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
          Utilizamos repuestos originales y tecnología avanzada para garantizar
          la máxima calidad y rendimiento en cada servicio.
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
          className='flex flex-col md:flex-row flex-wrap justify-center items-center gap-8'
        >
          {brands.map((brand, index) => (
            <motion.div
              key={index}
              variants={brandVariants}
              whileHover={{
                scale: 1.1,
                y: -5,
                transition: { duration: 0.5, ease: 'easeOut' as const },
              }}
              className='cursor-pointer hover:opacity-80 transition-opacity duration-300'
            >
              <Image
                src={brand.src}
                alt={brand.alt}
                width={150}
                height={80}
                className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
