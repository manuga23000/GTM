import Image from 'next/image'

export default function QualitySolutions() {
  return (
    <section className='py-20 bg-white text-black'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Grid de 4 imágenes 2x2 */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Imagen 1 */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform rotate-1'>
              <Image
                src='/images/soluciones/motor1.jpg'
                alt='Motor principal GTM'
                fill
                className='object-cover'
              />
            </div>
            {/* Imagen 2 */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform -rotate-1'>
              <Image
                src='/images/soluciones/motor2.jpg'
                alt='Componentes del motor'
                fill
                className='object-cover'
              />
            </div>
            {/* Imagen 3 */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform -rotate-1'>
              <Image
                src='/images/soluciones/motor3.jpg'
                alt='Transmisión GTM'
                fill
                className='object-cover'
              />
            </div>
            {/* Imagen 4 */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform rotate-1'>
              <Image
                src='/images/soluciones/flex.jpg'
                alt='Detalle motor GTM'
                fill
                className='object-cover'
              />
            </div>
          </div>

          {/* Contenido de texto */}
          <div className='space-y-6'>
            <div>
              <p className='text-gray-600 text-lg font-medium italic mb-4'>
                Tu Aliado En Soluciones Automotrices
              </p>

              <h2 className='text-4xl md:text-5xl font-bold leading-tight mb-6'>
                SOLUCIONES CON
                <br />
                <span className='text-red-500'>INNOVACIÓN</span>
              </h2>
            </div>

            <div className='text-gray-700 text-base leading-relaxed space-y-4'>
              <p>
                En <strong>GTM</strong> brindamos un servicio integral de
                mantenimiento y reparación, desde cajas automáticas con
                diagnósticos y reprogramaciones avanzadas, hasta mecánica
                general: motores, frenos y suspensión.
              </p>

              <p>
                Con un enfoque tecnológico, resolvemos fallas eléctricas y
                electrónicas, incorporamos dispositivos modernos y usamos
                equipos de diagnóstico de última generación. Reparamos y
                reprogramamos ECUs, módulos y cajas de fusibles.
              </p>

              <p>
                También realizamos{' '}
                <strong>programaciones Stage 1, 2 y 3</strong> para mejorar el
                rendimiento del motor, adaptándolo desde uso urbano hasta alta
                performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
