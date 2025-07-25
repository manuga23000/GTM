'use client'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

export default function ContactoPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      {/* HERO */}
      <section
        className='relative min-h-[90vh] flex items-center justify-center'
        style={{
          backgroundImage: "url('/images/contacto/contactos.png')",
          backgroundSize: 'cover',
          backgroundPosition: '80% center',
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
      {/* TARJETAS DE CONTACTO DEBAJO DEL HERO */}
      <div className='w-full bg-transparent flex flex-col items-center pt-12 pb-8'>
        <div className='flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center'>
          {/* Teléfono */}
          <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
            <FaPhone className='text-red-600 text-3xl mb-2' />
            <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
              TELÉFONO
            </h3>
            <span className='text-base font-medium'>+54 9 3364 69-4921</span>
          </div>
          {/* Email */}
          <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
            <FaEnvelope className='text-red-600 text-3xl mb-2' />
            <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
              EMAIL
            </h3>
            <span className='text-base font-medium break-words text-center'>
              contacto@mecanicagrandoli.com
            </span>
          </div>
          {/* Dirección */}
          <div className='flex-1 bg-white text-black rounded-lg shadow p-8 flex flex-col items-center min-w-[220px] max-w-xs'>
            <FaMapMarkerAlt className='text-red-600 text-3xl mb-2' />
            <h3 className='font-bold text-lg mb-1 text-red-600 tracking-wide'>
              DIRECCIÓN
            </h3>
            <span className='text-base font-medium text-center'>
              Luis Viale 291,
              <br />
              B2900 San Nicolás de Los Arroyos,
              <br />
              Provincia de Buenos Aires.
            </span>
          </div>
        </div>
      </div>
      {/* SECCIÓN PRINCIPAL */}
      <main className='max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
        {/* Columna izquierda: Datos y mapa */}
        <div>
          <p className='text-gray-300 text-base mb-8 max-w-2xl'>
            Si necesitás más información sobre nuestros servicios, tenés
            preguntas específicas o simplemente querés saber cómo podemos
            ayudarte, no dudes en ponerte en contacto con nosotros. ¡Estamos
            para ayudarte!
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
          <form className='space-y-7'>
            <div>
              <input
                type='text'
                placeholder='Nombre'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2'
                required
              />
            </div>
            <div>
              <input
                type='email'
                placeholder='Email'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2'
                required
              />
            </div>
            <div>
              <textarea
                placeholder='Mensaje'
                className='w-full px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] mb-2'
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
