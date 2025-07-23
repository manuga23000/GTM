import Image from 'next/image'

export default function QualitySolutions() {
  return (
    <section className='py-20 bg-white text-black'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Grid de 4 imágenes 2x2 */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Imagen 1 - Superior izquierda */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform rotate-1'>
              <Image
                src='/images/motor1.jpg'
                alt='Motor principal GTM'
                fill
                className='object-cover'
              />
            </div>

            {/* Imagen 2 - Superior derecha */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform -rotate-1'>
              <Image
                src='/images/motor2.jpg'
                alt='Componentes del motor'
                fill
                className='object-cover'
              />
            </div>

            {/* Imagen 3 - Inferior izquierda */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform -rotate-1'>
              <Image
                src='/images/motor3.jpg'
                alt='Transmisión GTM'
                fill
                className='object-cover'
              />
            </div>

            {/* Imagen 4 - Inferior derecha */}
            <div className='relative h-48 border-2 border-red-500 rounded-lg overflow-hidden shadow-lg transform rotate-1'>
              <Image
                src='/images/motor4.jpg'
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
                En <strong>GTM</strong>, ofrecemos un servicio integral para el
                mantenimiento y reparación de tu vehículo, abarcando desde la
                especialización en cajas automáticas, con diagnósticos precisos
                y reprogramaciones avanzadas, hasta reparaciones completas de
                mecánica en general, como motores, frenos y suspensión.
              </p>

              <p>
                Nuestro enfoque en la tecnología nos permite realizar trabajos
                de electrónica avanzada, solucionando fallas en sistemas
                eléctricos y electrónicos, e implementando dispositivos
                modernos. Contamos con equipos de diagnóstico de última
                generación para detectar y solucionar problemas rápidamente,
                además de ser expertos en la reparación y reprogramación de
                ECUs, módulos y cajas de fusibles.
              </p>

              <p>
                Todo esto, respaldado por un equipo altamente capacitado y
                comprometido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
