import React from 'react'

export default function CapacitacionTecnica() {
  return (
    <section
      className='relative py-20 bg-gray-900 text-white'
      style={{
        backgroundImage: "url('/images/servicios/capacitacion.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <div className='bg-black/60 p-12 rounded-lg backdrop-blur-sm'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>
              CAPACITACIÓN TÉCNICA{' '}
              <span className='text-red-600'>PROFESIONAL</span>
            </h2>
            <div className='w-24 h-1 bg-red-600 mx-auto mb-8'></div>
          </div>
          <div className='max-w-4xl mx-auto text-center'>
            <p className='text-gray-200 text-lg leading-relaxed mb-8'>
              Ofrecemos programas de formación especializados para técnicos y
              profesionales del sector automotriz, enfocados en el desarrollo de
              habilidades prácticas y conocimientos teóricos. Nuestras
              capacitaciones abarcan desde conceptos básicos hasta tecnologías
              avanzadas, permitiendo a los participantes dominar las
              herramientas y técnicas necesarias para la reparación y
              mantenimiento de vehículos modernos.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>🎓</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Cursos Teóricos</h3>
                <p className='text-gray-300 text-sm'>
                  Fundamentos de mecánica, electrónica automotriz y sistemas
                  modernos
                </p>
              </div>
              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>🔧</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Práctica Hands-On</h3>
                <p className='text-gray-300 text-sm'>
                  Talleres prácticos con herramientas y equipos profesionales
                </p>
              </div>
              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>📜</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Certificación</h3>
                <p className='text-gray-300 text-sm'>
                  Certificados oficiales que avalan la capacitación recibida
                </p>
              </div>
            </div>
            <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-lg hover:scale-105 text-lg'>
              Solicitar Información
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
