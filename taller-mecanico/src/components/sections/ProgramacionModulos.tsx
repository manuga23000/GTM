import React from 'react'

export default function ProgramacionModulos() {
  return (
    <section className='py-20 bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            PROGRAMACIÓN DE <span className='text-red-600'>MÓDULOS</span>
          </h2>
          <p className='text-gray-300 text-lg max-w-3xl mx-auto'>
            Servicios avanzados de programación y reprogramación de ECUs,
            módulos de control y sistemas electrónicos
          </p>
        </div>
        {/* Grid de servicios de programación */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
          <div className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'>
            <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-white text-lg font-bold'>S1</span>
            </div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 1</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación básica para optimizar el rendimiento del motor y
              mejorar la eficiencia de combustible.
            </p>
          </div>
          <div className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'>
            <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-white text-lg font-bold'>S2</span>
            </div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 2</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación avanzada con modificaciones en hardware para
              maximizar el potencial del vehículo.
            </p>
          </div>
          <div className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'>
            <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-white text-lg font-bold'>S3</span>
            </div>
            <h3 className='text-xl font-bold mb-4'>Flex Stage 3</h3>
            <p className='text-gray-300 text-sm'>
              Reprogramación extrema para competición con modificaciones
              integrales del sistema.
            </p>
          </div>
          <div className='bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-all'>
            <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-white text-lg font-bold'>ECU</span>
            </div>
            <h3 className='text-xl font-bold mb-4'>Programación ECU</h3>
            <p className='text-gray-300 text-sm'>
              Programación completa de ECUs nuevas y reprogramación de módulos
              existentes para todas las marcas.
            </p>
          </div>
        </div>
        {/* Servicios adicionales */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
          <div className='bg-gray-800 p-8 rounded-lg'>
            <h4 className='text-2xl font-bold mb-4 text-red-600'>
              Codificación de Módulos
            </h4>
            <p className='text-gray-300 mb-4'>
              Codificación de módulos nuevos, adaptación de componentes y
              configuración de sistemas específicos para cada vehículo.
            </p>
            <ul className='text-gray-300 text-sm space-y-2'>
              <li>• Codificación de llaves y sistemas de seguridad</li>
              <li>• Adaptación de componentes nuevos</li>
              <li>• Configuración de sistemas avanzados</li>
            </ul>
          </div>
          <div className='bg-gray-800 p-8 rounded-lg'>
            <h4 className='text-2xl font-bold mb-4 text-red-600'>
              Reprogramación Personalizada
            </h4>
            <p className='text-gray-300 mb-4'>
              Ajustes específicos según las necesidades del cliente, desde
              mejoras de rendimiento hasta corrección de fallas.
            </p>
            <ul className='text-gray-300 text-sm space-y-2'>
              <li>• Eliminación de FAP/DPF</li>
              <li>• Desactivación de EGR</li>
              <li>• Optimización de mapas de inyección</li>
            </ul>
          </div>
        </div>
        {/* Call to action */}
        <div className='text-center'>
          <div className='bg-red-600 p-8 rounded-lg inline-block'>
            <h4 className='text-2xl font-bold mb-4'>Consulta Especializada</h4>
            <p className='mb-6'>
              Cada vehículo requiere un análisis personalizado. Consultanos
              sobre las posibilidades para tu auto.
            </p>
            <button className='bg-white text-red-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all'>
              Consultar Ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
