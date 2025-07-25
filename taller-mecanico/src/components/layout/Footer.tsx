import Image from 'next/image'
import Link from 'next/link'
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaWrench,
  FaShieldAlt,
} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer
      className='bg-black text-white pt-16 pb-6 mt-0 relative'
      style={{
        backgroundImage: "url('/images/footer/footer.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='absolute inset-0 bg-black/85 z-0'></div>
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        {/* Logo y título principal */}
        <div className='flex items-center mb-8'>
          <Image
            src='/images/header/LOGO GTM.png'
            alt='Logo GTM'
            width={60}
            height={60}
            className='h-15 w-auto mr-4'
          />
          <div>
            <span className='text-3xl font-bold tracking-wide'>GTM</span>
            <p className='text-gray-300 text-sm'>Tu aliado automotriz</p>
          </div>
        </div>

        {/* Grid principal de 4 columnas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          {/* Columna 1: Sobre GTM */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-red-500 mb-4 flex items-center'>
              <FaWrench className='mr-2' />
              SOBRE GTM
            </h3>
            <p className='text-gray-300 text-sm leading-relaxed'>
              Especialistas en{' '}
              <strong className='text-white'>cajas automáticas</strong> y
              mecánica general con años de experiencia en San Nicolás de los
              Arroyos. Tu aliado automotriz de confianza.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center text-sm text-gray-300'>
                <FaShieldAlt className='text-red-500 mr-2' />
                <span>Garantía en todos los trabajos</span>
              </div>
              <div className='flex items-center text-sm text-gray-300'>
                <FaWrench className='text-red-500 mr-2' />
                <span>Tecnología de diagnóstico avanzada</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Contacto & Ubicación */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-red-500 mb-4 flex items-center'>
              <FaMapMarkerAlt className='mr-2' />
              CONTACTO
            </h3>
            <div className='space-y-3'>
              <div className='flex items-start text-sm'>
                <FaMapMarkerAlt className='text-red-500 mr-3 mt-1 flex-shrink-0' />
                <div>
                  <p className='text-white font-semibold'>Viale 291</p>
                  <p className='text-gray-300'>San Nicolás de los Arroyos</p>
                </div>
              </div>

              <div className='flex items-center text-sm'>
                <FaPhone className='text-red-500 mr-3 flex-shrink-0' />
                <div>
                  <a
                    href='tel:+5493364694921'
                    className='text-white font-semibold hover:text-red-500 transition'
                  >
                    +54 9 336 469-4921
                  </a>
                  <p className='text-gray-300 text-xs'>Llamadas y WhatsApp</p>
                </div>
              </div>

              <div className='flex items-center text-sm'>
                <FaEnvelope className='text-red-500 mr-3 flex-shrink-0' />
                <div>
                  <a className='text-white font-semibold hover:text-red-500 transition break-all'>
                    gtmsn291@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Horarios & Servicios */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-red-500 mb-4 flex items-center'>
              <FaClock className='mr-2' />
              HORARIOS & SERVICIOS
            </h3>

            <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4'>
              <div className='flex items-center text-sm mb-2'>
                <FaClock className='text-red-500 mr-2' />
                <span className='text-white font-semibold'>
                  Horarios de Atención
                </span>
              </div>
              <p className='text-gray-300 text-sm'>
                🗓️ <strong>Lunes a Viernes:</strong> 8:00 - 16:00
                <br />
                🔴 <strong>Sábados y Domingos:</strong> Cerrado
              </p>
            </div>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-red-500 mb-4'>SÍGUENOS</h3>

            <p className='text-gray-300 text-sm mb-4'>
              Mantente al día con nuestros trabajos y novedades en redes
              sociales
            </p>

            <div className='flex flex-wrap gap-3'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Facebook'
                className='flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors'
              >
                <FaFacebookF className='w-5 h-5 text-white' />
              </a>

              <a
                href='https://www.instagram.com/'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Instagram'
                className='flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors'
              >
                <FaInstagram className='w-5 h-5 text-white' />
              </a>

              <a
                href='https://www.tiktok.com/'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='TikTok'
                className='flex items-center justify-center w-12 h-12 bg-black hover:bg-gray-800 rounded-lg transition-colors border border-white'
              >
                <FaTiktok className='w-5 h-5 text-white' />
              </a>

              <a
                href='https://wa.me/5493364694921'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='WhatsApp'
                className='flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-lg transition-colors'
              >
                <FaWhatsapp className='w-5 h-5 text-white' />
              </a>
            </div>
          </div>
        </div>

        {/* Enlaces de navegación */}
        <div className='border-t border-gray-700 pt-6 mb-6'>
          <div className='flex flex-wrap justify-center gap-6 text-sm'>
            <Link
              href='#servicios'
              className='text-gray-300 hover:text-red-500 transition font-medium'
            >
              Servicios
            </Link>
            <Link
              href='#sobre-nosotros'
              className='text-gray-300 hover:text-red-500 transition font-medium'
            >
              Sobre Nosotros
            </Link>
            <Link
              href='#reservar-turnos'
              className='text-gray-300 hover:text-red-500 transition font-medium'
            >
              Reservar Turnos
            </Link>
            <Link
              href='/contacto'
              className='text-gray-300 hover:text-red-500 transition font-medium'
            >
              Contacto
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-700 pt-4 text-center'>
          <p className='text-gray-400 text-xs'>
            © {new Date().getFullYear()} GTM - Tu aliado automotriz. Todos los
            derechos reservados. | Viale 291, San Nicolás de los Arroyos
          </p>
        </div>
      </div>
    </footer>
  )
}
