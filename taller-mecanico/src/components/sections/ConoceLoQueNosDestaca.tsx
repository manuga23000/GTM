import React from 'react'

export default function ConoceLoQueNosDestaca() {
  return (
    <section className='pt-20 pb-5 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-extrabold text-center mb-10 text-black'>
          CONOCE LO QUE NOS <span className='text-red-600'>DESTACA</span>
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <p className='text-gray-800'>
            En GTM, con más de 20 años de experiencia en el rubro, nos
            especializamos en la reparación y mantenimiento de vehículos.
            Ubicados en Luis Viale 291, San Nicolás de los Arroyos, ofrecemos
            una amplia gama de servicios para satisfacer las necesidades de
            nuestros clientes.
          </p>
          <p className='text-gray-800'>
            Contamos con un equipo de especialistas comprometidos con brindar
            atención de calidad y soluciones rápidas y efectivas a demás de las
            herramientas más avanzadas del momento. Nuestra reputación se basa
            en cumplir con los plazos establecidos y ofrecer servicios variados
            y avanzados en la zona.
          </p>
        </div>
        <div className='flex justify-center'>
          <img
            src='/images/sobrenosotros/camioneta.jpg'
            alt='Camioneta destacada'
            className='w-full h-auto object-contain'
            style={{ maxWidth: '700px' }}
          />
        </div>
      </div>
    </section>
  )
}
