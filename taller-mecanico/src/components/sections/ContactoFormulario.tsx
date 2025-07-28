'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { initEmailJS, sendEmail } from '@/lib/emailjs'

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
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Intenta nuevamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className='max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
      {/* Columna izquierda: Datos y mapa */}
      <div>
        <p className='text-gray-300 text-base mb-8 max-w-2xl'>
          Si necesitás más información sobre nuestros servicios, tenés preguntas
          específicas o simplemente querés saber cómo podemos ayudarte, no dudes
          en ponerte en contacto con nosotros. ¡Estamos para ayudarte!
        </p>

        {/* Mapa */}
        <div className='rounded-lg overflow-hidden shadow-lg'>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.393964479836!2d-60.22222268480001!3d-33.3372229807827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b75a0e2e2e2e2e%3A0x2e2e2e2e2e2e2e2e!2sLuis%20Viale%20291%2C%20San%20Nicol%C3%A1s%20de%20Los%20Arroyos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1680000000000!5m2!1ses-419!2sar'
            width='100%'
            height='220'
            style={{ border: 0 }}
            allowFullScreen={true}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='Mapa ubicación GTM'
          ></iframe>
        </div>
      </div>

      {/* Columna derecha: Formulario */}
      <div className='bg-black/80 rounded-lg shadow-lg p-10 flex flex-col justify-center'>
        <form onSubmit={handleSubmit} className='space-y-7'>
          <div>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Nombre'
              className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2'
              required
            />
          </div>
          <div>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Email'
              className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2'
              required
            />
          </div>
          <div>
            <textarea
              name='message'
              value={formData.message}
              onChange={handleChange}
              placeholder='Mensaje'
              className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] mb-2'
              required
            ></textarea>
          </div>

          {/* Mensaje de estado */}
          {status.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {status.message}
            </div>
          )}

          <Button
            type='submit'
            variant='primary'
            size='xl'
            className='w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </form>
      </div>
    </main>
  )
}
