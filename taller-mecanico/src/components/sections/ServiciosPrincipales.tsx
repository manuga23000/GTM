import React from 'react'

export default function ServiciosPrincipales() {
  const servicios = [
    {
      titulo: 'CAJAS AUTOMÁTICAS',
      descripcion:
        'En Mecánica Grandoli, somos expertos en diagnosticar y reparar cajas automáticas para vehículos de todas las marcas. Realizamos mantenimiento preventivo y correctivo para asegurar el óptimo desempeño de tu transmisión, prolongando su vida útil. También llevamos a cabo reprogramaciones y ajustes personalizados, utilizando tecnología de punta para garantizar un funcionamiento suave y eficiente.',
      imagen: '/images/servicios/caja.jpg',
      lado: 'izquierda',
    },
    {
      titulo: 'REPARACIÓN DE ECUS',
      descripcion:
        'Nos especializamos en diagnosticar y reparar las ECUs de tu vehículo, corrigiendo problemas electrónicos que afectan el desempeño general. Realizamos reprogramaciones avanzadas para optimizar el rendimiento y la eficiencia, además de sustituir o restaurar ECUs dañadas con soluciones adaptadas a tus necesidades.',
      imagen: '/images/servicios/ecu.jpg',
      lado: 'derecha',
    },
    {
      titulo: 'TRABAJOS DE ELECTRÓNICA',
      descripcion:
        'Nuestra especialidad en electrónica nos permite solucionar fallas en sistemas eléctricos y electrónicos del vehículo, como sensores, iluminación, y paneles de control. También instalamos y configuramos dispositivos electrónicos adicionales para modernizar y personalizar tu auto, asegurándonos de que funcione con precisión.',
      imagen: '/images/servicios/electronica.jpg',
      lado: 'izquierda',
    },
  ]

  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            SERVICIOS <span className='text-red-600'>ESPECIALIZADOS</span>
          </h2>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
            Nuestras especialidades con tecnología de última generación
          </p>
        </div>

        <div className='space-y-20'>
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                servicio.lado === 'derecha' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className='lg:w-1/2'>
                <img
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  className='w-full h-80 object-cover rounded-lg shadow-lg'
                />
              </div>
              <div className='lg:w-1/2'>
                <h3 className='text-3xl font-bold text-red-600 mb-6'>
                  {servicio.titulo}
                </h3>
                <p className='text-gray-700 text-lg leading-relaxed mb-8'>
                  {servicio.descripcion}
                </p>
                <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:scale-105'>
                  Solicitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
