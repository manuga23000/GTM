'use client'
import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Button from '@/components/ui/Button'
import { initEmailJS, sendEmail } from '@/lib/emailjs'
import { animations } from '@/lib/animations'

interface FormData {
  name: string
  email: string
  message: string
}

export default function ContactoFormulario() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const sectionRef = useRef(null)
  const isSectionInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  })

  // Inicializar EmailJS cuando el componente se monta
  useEffect(() => {
    initEmailJS()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: '' })

    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        type: 'error',
        message: 'Por favor, completa todos los campos.',
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await sendEmail(formData)

      if (result.success) {
        setStatus({
          type: 'success',
          message: '¡Mensaje enviado correctamente! Te contactaremos pronto.',
        })
        // Limpiar el formulario
        setFormData({ name: '', email: '', message: '' })
      } else {
        setStatus({
          type: 'error',
          message: result.message,
        })
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Intenta nuevamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.main
      ref={sectionRef}
      variants={animations.staggerContainer}
      initial='hidden'
      animate={isSectionInView ? 'visible' : 'hidden'}
      className='max-w-7xl mx-auto px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start'
    >
      {/* Columna izquierda: Datos y mapa */}
      <motion.div variants={animations.fadeInLeft}>
        <motion.p
          variants={animations.fadeInUp}
          className='text-gray-300 text-sm md:text-base mb-6 md:mb-8 max-w-2xl'
        >
          Si necesitás más información sobre nuestros servicios, tenés preguntas
          específicas o simplemente querés saber cómo podemos ayudarte, no dudes
          en ponerte en contacto con nosotros. ¡Estamos para ayudarte!
        </motion.p>

        {/* Mapa */}
        <motion.div
          variants={animations.fadeInUp}
          className='rounded-lg overflow-hidden shadow-lg'
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.5, ease: 'easeOut' as const },
          }}
        >
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.393964479836!2d-60.22222268480001!3d-33.3372229807827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b75a0e2e2e2e2e%3A0x2e2e2e2e2e2e2e2e!2sLuis%20Viale%20291%2C%20San%20Nicol%C3%A1s%20de%20Los%20Arroyos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1680000000000!5m2!1ses-419!2sar'
            width='100%'
            height='200'
            style={{ border: 0 }}
            allowFullScreen={true}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='Mapa ubicación GTM'
            className='w-full h-48 md:h-56'
          ></iframe>
        </motion.div>
      </motion.div>

      {/* Columna derecha: Formulario */}
      <motion.div
        variants={animations.fadeInRight}
        className='bg-black/80 rounded-lg shadow-lg p-6 md:p-10 flex flex-col justify-center'
        whileHover={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          transition: { duration: 0.5, ease: 'easeOut' as const },
        }}
      >
        <motion.form
          variants={animations.staggerContainer}
          onSubmit={handleSubmit}
          className='space-y-5 md:space-y-7'
        >
          <motion.div variants={animations.fadeInUp}>
            <motion.input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Nombre'
              className='w-full px-3 md:px-4 py-2 md:py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2 text-sm md:text-base'
              required
              whileFocus={{
                scale: 1.02,
                transition: { duration: 0.4, ease: 'easeOut' as const },
              }}
            />
          </motion.div>
          <motion.div variants={animations.fadeInUp}>
            <motion.input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Email'
              className='w-full px-3 md:px-4 py-2 md:py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2 text-sm md:text-base'
              required
              whileFocus={{
                scale: 1.02,
                transition: { duration: 0.4, ease: 'easeOut' as const },
              }}
            />
          </motion.div>
          <motion.div variants={animations.fadeInUp}>
            <motion.textarea
              name='message'
              value={formData.message}
              onChange={handleChange}
              placeholder='Mensaje'
              className='w-full px-3 md:px-4 py-2 md:py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] md:min-h-[120px] mb-2 text-sm md:text-base'
              required
              whileFocus={{
                scale: 1.02,
                transition: { duration: 0.4, ease: 'easeOut' as const },
              }}
            ></motion.textarea>
          </motion.div>

          {/* Mensaje de estado */}
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-xs md:text-sm ${
                status.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {status.message}
            </motion.div>
          )}

          <motion.div variants={animations.fadeInUp}>
            <Button
              type='submit'
              variant='primary'
              size='xl'
              className='w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base'
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.main>
  )
}
