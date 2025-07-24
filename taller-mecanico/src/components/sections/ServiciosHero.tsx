import React from 'react'

export default function ServiciosHero() {
  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/servicios/servicios.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-4xl mx-auto text-center px-4'>
        <h1 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
          NUESTROS <span className='text-red-600'>SERVICIOS</span>
        </h1>
        <p className='text-white text-lg mb-8 max-w-2xl mx-auto'>
          Especialistas en cajas automáticas, mecánica general y programación de
          módulos. Soluciones para particulares y empresas.
        </p>
      </div>
    </section>
  )
}
