import Image from 'next/image'

export default function QualitySolutions() {
  return (
    <section className='py-20 bg-white text-black'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content - Images */}
          <div className='relative'>
            {/* Main Engine Image */}
            <div className='relative mb-6'>
              <Image
                src='/images/engine-main.jpg'
                alt='Motor principal GTM'
                width={400}
                height={300}
                className='rounded-lg shadow-lg w-full h-64 object-cover'
              />
            </div>

            {/* Bottom Grid - Two smaller images */}
            <div className='grid grid-cols-2 gap-4'>
              <Image
                src='/images/engine-parts.jpg'
                alt='Componentes del motor'
                width={200}
                height={150}
                className='rounded-lg shadow-lg w-full h-32 object-cover'
              />
              <Image
                src='/images/transmission.jpg'
                alt='Transmisión GTM'
                width={200}
                height={150}
                className='rounded-lg shadow-lg w-full h-32 object-cover'
              />
            </div>
          </div>

          {/* Right Content - Text */}
          <div className='space-y-6'>
            <div>
              <p className='text-gray-600 text-lg font-medium italic mb-4'>
                Tu Aliado En Soluciones Automotrices
              </p>

              <h2 className='text-4xl md:text-5xl font-bold leading-tight mb-6'>
                SOLUCIONES CON
                <br />
                <span className='text-red-500'>CALIDAD</span>
              </h2>
            </div>

            <div className='text-gray-700 text-base leading-relaxed space-y-4'>
              <p>
                En <strong>Mecánica Grandoli</strong>, ofrecemos un servicio
                integral para el mantenimiento y reparación de tu vehículo,
                abarcando desde la especialización en cajas automáticas, con
                diagnósticos precisos y reprogramaciones avanzadas, hasta
                reparaciones completas de mecánica en general, como motores,
                frenos y suspensión.
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
