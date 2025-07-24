import React from 'react'

export default function HeroSobreNosotros() {
  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/home/hero-engine.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-4xl mx-auto text-center px-4'>
        <h1 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
          SOBRE <span className='text-red-600'>NOSOTROS</span>
        </h1>
        <p className='text-white text-lg mb-8 max-w-2xl mx-auto'>
          Conocé nuestra historia, valores y lo que nos hace únicos en el rubro
          automotriz.
        </p>
      </div>
    </section>
  )
}
