import React from 'react'

export default function TrabajaConNosotros() {
  return (
    <section className='py-20 bg-black text-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-extrabold text-center mb-12'>
          TRABAJA CON <span className='text-red-600'>NOSOTROS</span>
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          <div className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'>
            <img
              src='/images/servicios/servicios.png'
              alt='Particulares'
              className='w-full h-56 object-cover'
            />
            <div className='p-8'>
              <h3 className='text-2xl font-bold mb-2'>
                SERVICIOS A <span className='text-red-600'>PARTICULARES</span>
              </h3>
              <p className='text-gray-200'>
                Nos especializamos en brindar a los conductores particulares un
                servicio personalizado y de alta calidad. Nuestro equipo de
                mecánicos altamente capacitados brinda atención personalizada,
                asegurándonos de que cada uno de nuestros clientes reciba
                soluciones que se ajusten a sus necesidades específicas.
                Ofrecemos servicios únicos en la zona.
              </p>
            </div>
          </div>
          <div className='bg-gray-900 rounded-xl overflow-hidden shadow-lg'>
            <img
              src='/images/servicios/flota.png'
              alt='Empresas'
              className='w-full h-56 object-cover'
            />
            <div className='p-8'>
              <h3 className='text-2xl font-bold mb-2'>
                SERVICIOS A <span className='text-red-600'>EMPRESAS</span>
              </h3>
              <p className='text-gray-200'>
                Entendemos que las empresas necesitan que sus flotas de
                vehículos estén operativas en todo momento. Nuestro servicio
                especializado para empresas ofrece atención rápida y eficaz, con
                planes de mantenimiento preventivo adaptados a las necesidades
                de cada cliente. Ya sea que se trate de una flota pequeña o de
                gran tamaño, trabajamos para asegurar que tu empresa no se vea
                afectada por tiempos de inactividad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
