import React from 'react'

export default function ContactoSection() {
  return (
    <section
      className='relative w-full min-h-[450px] flex flex-col items-center justify-center py-16'
      style={{
        backgroundImage: "url('/images/home/cajaautomatica.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/60 z-0'></div>
      <div className='relative z-10 w-full max-w-3xl mx-auto text-center px-4'>
        <p className='text-white text-sm mb-2 italic'>
          Confiá en los expertos para mantener tu vehículo en óptimas
          condiciones.
        </p>
        <h2 className='text-4xl md:text-5xl font-extrabold mb-6 text-white'>
          CONTÁCTANOS <span className='text-red-600'>HOY</span> MISMO.
        </h2>
        <div className='flex justify-center mb-8'>
          <img
            src='/images/home/atf.png'
            alt='Máquina ATF'
            className='h-110 object-contain drop-shadow-xl'
          />
        </div>
        <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded transition-all text-lg shadow-lg'>
          Contacto
        </button>
      </div>
    </section>
  )
}
