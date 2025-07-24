import React from 'react'

export default function ServiciosBasicos() {
  const servicios = [
    {
      titulo: 'MECÁNICA EN GENERAL',
      descripcion:
        'Diagnóstico moderno, reparación de motores, frenos y suspensión.',
      imagen: '/images/servicios/mecanica.png',
    },
    {
      titulo: 'GESTIÓN DE FLOTAS',
      descripcion:
        'Mantenimiento programado y administración integral para empresas.',
      imagen: '/images/servicios/flotas.png',
    },
    {
      titulo: 'DIAGNÓSTICO AVANZADO',
      descripcion: 'Equipos de última generación para todas las marcas.',
      imagen: '/images/servicios/diagnostico.png',
    },
  ]

  return (
    <section className='py-16 bg-gray-100'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className='bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-all'
            >
              <div className='mb-4 flex justify-center'>
                <img
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  className='w-20 h-20 object-cover rounded-md shadow-md'
                />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                {servicio.titulo}
              </h3>
              <p className='text-gray-600 mb-6'>{servicio.descripcion}</p>
              <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:scale-105'>
                Solicitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
