'use client'

export default function TurnosHero() {
  return (
    <section className='relative bg-gradient-to-br from-gray-900 via-black to-gray-800 py-20 lg:py-32'>
      <div className='absolute inset-0 bg-black/50'></div>
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-4xl md:text-6xl font-bold text-white mb-6'>
            Reserva tu Turno
          </h1>
          <p className='text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto'>
            Agenda tu cita de manera rápida y sencilla. Nuestro equipo de
            expertos está listo para atenderte con la mejor calidad y
            profesionalismo.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <div className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300'>
              📱 WhatsApp Directo
            </div>
            <div className='bg-gray-700 text-gray-300 px-8 py-4 rounded-lg font-semibold'>
              ⏰ Horarios: Lun-Vie 8:00-18:00
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
