'use client'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
} from 'react-icons/fa'

export default function ContactoPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      {/* HERO */}
      <section
        className='relative min-h-[60vh] flex items-center justify-center'
        style={{
          backgroundImage: "url('/images/sobrenosotros/sobrenosotros.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className='absolute inset-0 bg-black/70 z-0'></div>
        <div className='relative z-10 max-w-4xl mx-auto text-center px-4'>
          <h1 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
            CONTACTO
          </h1>
        </div>
      </section>

      {/* SECCIÓN PRINCIPAL */}
      <main className='max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Columna izquierda: Datos y mapa */}
        <div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {/* Teléfono */}
            <div className='bg-white text-black rounded-lg shadow p-6 flex flex-col items-center'>
              <FaPhone className='text-red-600 text-3xl mb-2' />
              <h3 className='font-bold text-lg mb-1 text-red-600'>TELÉFONO</h3>
              <span className='text-sm'>+54 9 3364 69-4921</span>
            </div>
            {/* Email */}
            <div className='bg-white text-black rounded-lg shadow p-6 flex flex-col items-center'>
              <FaEnvelope className='text-red-600 text-3xl mb-2' />
              <h3 className='font-bold text-lg mb-1 text-red-600'>EMAIL</h3>
              <span className='text-sm break-all'>
                contacto@mecanicagrandoli.com
              </span>
            </div>
            {/* Dirección */}
            <div className='bg-white text-black rounded-lg shadow p-6 flex flex-col items-center'>
              <FaMapMarkerAlt className='text-red-600 text-3xl mb-2' />
              <h3 className='font-bold text-lg mb-1 text-red-600'>DIRECCIÓN</h3>
              <span className='text-sm text-center'>
                Luis Viale 291, B2900 San Nicolás de Los Arroyos, Provincia de
                Buenos Aires.
              </span>
            </div>
          </div>

          <p className='text-gray-300 text-sm mb-4'>
            Si necesitas más información sobre nuestros servicios, tienes
            preguntas específicas, o simplemente deseas saber cómo podemos
            ayudarte, no dudes en ponerte en contacto con nosotros. Estamos para
            ayudarte.
          </p>

          {/* Redes sociales */}
          <div className='flex gap-6 mb-4'>
            <a
              href='https://wa.me/5493364694921'
              target='_blank'
              rel='noopener noreferrer'
              className='text-red-500 hover:text-red-700 text-2xl'
            >
              <svg
                width='1em'
                height='1em'
                viewBox='0 0 448 512'
                fill='currentColor'
              >
                <path d='M380.9 97.1C339-18.6 197.5-35.3 112.1 49.7c-84.5 85-67.8 226.5 47.9 268.4l-12.7 46.5c-3.5 12.7 8.4 24.6 21.1 21.1l46.5-12.7c41.9 19.2 89.2 19.2 131.1 0 85-84.5 67.8-226.5-47.9-268.4zM224 352c-70.7 0-128-57.3-128-128S153.3 96 224 96s128 57.3 128 128-57.3 128-128 128zm0-224c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96z' />
              </svg>
            </a>
            <a
              href='https://instagram.com/mecanicagrandoli'
              target='_blank'
              rel='noopener noreferrer'
              className='text-red-500 hover:text-red-700 text-2xl'
            >
              <FaInstagram />
            </a>
            <a
              href='https://facebook.com/mecanicagrandoli'
              target='_blank'
              rel='noopener noreferrer'
              className='text-red-500 hover:text-red-700 text-2xl'
            >
              <FaFacebookF />
            </a>
          </div>

          {/* Mapa */}
          <div className='rounded-lg overflow-hidden shadow mt-4'>
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
        <div className='bg-black/80 rounded-lg shadow-lg p-8 flex flex-col justify-center'>
          <form className='space-y-6'>
            <div>
              <input
                type='text'
                placeholder='Nombre'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4'
                required
              />
            </div>
            <div>
              <input
                type='email'
                placeholder='Email'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4'
                required
              />
            </div>
            <div>
              <textarea
                placeholder='Mensaje'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 min-h-[120px]'
                required
              ></textarea>
            </div>
            <Button
              type='submit'
              variant='primary'
              size='xl'
              className='w-full'
            >
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
