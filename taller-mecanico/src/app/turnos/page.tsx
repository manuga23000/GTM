'use client'
import Navbar from '@/components/layout/Navbar'
import TurnosHero from '@/components/sections/TurnosHero'
// import TurnosFormulario from '@/components/sections/TurnosFormulario'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function TurnosPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <TurnosHero />

      {/* Formulario de turnos comentado - próximamente */}
      {/* <TurnosFormulario /> */}

      {/* Sección en construcción */}
      <section className='py-20 bg-gray-900'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='bg-gray-800 rounded-2xl p-12 shadow-2xl border border-gray-700'>
            <div className='text-6xl mb-6'>🚧</div>
            <h2 className='text-3xl font-bold mb-4 text-white'>
              Sistema de Turnos en Construcción
            </h2>
            <p className='text-xl text-gray-300 mb-6'>
              Estamos trabajando para brindarte la mejor experiencia de reserva
              de turnos.
            </p>
            <p className='text-lg text-gray-400 mb-8'>
              Muy pronto podrás reservar tus turnos de forma online de manera
              rápida y sencilla.
            </p>
            <div className='bg-gray-700 rounded-lg p-6 border border-gray-600'>
              <h3 className='text-lg font-semibold text-white mb-3'>
                📞 Mientras tanto, contáctanos directamente:
              </h3>
              <p className='text-gray-300'>
                Envíanos un WhatsApp para agendar tu turno
              </p>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  )
}
