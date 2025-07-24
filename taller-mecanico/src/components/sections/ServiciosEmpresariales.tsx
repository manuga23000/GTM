export default function ServiciosEmpresariales() {
  return (
    <>
      <section
        className='relative w-full min-h-[600px] flex items-center justify-center py-20'
        style={{
          backgroundImage: "url('/images/servicios/flota.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay oscuro para legibilidad */}
        <div className='absolute inset-0 bg-black/70 z-0'></div>
        <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 relative z-10'>
          {/* Columna izquierda vacía para dejar ver la imagen */}
          <div className='hidden lg:block'></div>
          <div className='flex flex-col items-end text-right space-y-6'>
            <h2 className='text-white font-extrabold text-5xl mb-2'>
              SERVICIOS <br />
              <span className='relative text-red-600 inline-block'>
                EMPRESARIALES
              </span>
            </h2>
            <p className='text-white text-lg max-w-xl mt-6 mb-8'>
              Desarrollamos soluciones integrales para el mantenimiento y
              gestión de flotas vehiculares. Ofrecemos planes personalizados que
              incluyen mantenimiento preventivo programado, servicio de
              emergencia móvil, diagnóstico electrónico avanzado y gestión
              completa de documentación.
            </p>
            <ul className='text-white text-lg font-bold space-y-2 mb-10'>
              <li>✓ Mantenimiento Preventivo Programado</li>
              <li>✓ Diagnóstico Electrónico de Flota</li>
              <li>✓ Gestión Integral de Flotas</li>
              <li>✓ Mas Servicios</li>
            </ul>
            <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded transition-all text-lg shadow-lg'>
              Ver Todos
            </button>
          </div>
        </div>
      </section>
      {/* Sección de marcas */}
      <section className='bg-white py-12'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h3 className='text-red-600 font-bold tracking-widest text-lg mb-6'>
            TRABAJANDO SIEMPRE CON LAS PRIMERAS MARCAS
          </h3>
          <p className='text-gray-800 text-lg mb-1'>
            Utilizamos repuestos originales y tecnología avanzada para
            garantizar la máxima calidad y rendimiento en cada servicio.
          </p>
          <p className='text-gray-800 text-lg mb-10'>
            Brindamos soluciones confiables y eficientes tanto para vehículos
            particulares como para flotas.
          </p>
          <div className='flex flex-wrap justify-center items-center gap-8'>
            <img
              src='/images/marcas/transtec.png'
              alt='Transtec'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
            <img
              src='/images/marcas/valvoline.png'
              alt='Valvoline'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
            <img
              src='/images/marcas/altomadeinusa.png'
              alt='Alto'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
            <img
              src='/images/marcas/precision.png'
              alt='Precision'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
            <img
              src='/images/marcas/raybestos.png'
              alt='Raybestos'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
            <img
              src='/images/marcas/borgwarner.png'
              alt='BorgWarner'
              className='max-h-20 max-w-[150px] object-contain p-2 mx-2'
            />
          </div>
        </div>
      </section>
      {/* Sección de servicios especializados */}
      <section
        className='relative w-full min-h-[500px] flex flex-col items-center justify-center py-20'
        style={{
          backgroundImage: "url('/images/home/revisacion.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className='absolute inset-0 bg-black/80 z-0'></div>
        <div className='relative z-10 w-full max-w-5xl mx-auto text-center px-4'>
          <h2 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
            SERVICIOS <span className='text-red-600'>ESPECIALIZADOS</span>
          </h2>
          <p className='text-white text-lg mb-10'>
            Brindamos atención especializada para tu vehículo con tecnología de
            última generación. Nuestro equipo de técnicos certificados realiza
            diagnósticos precisos y reparaciones profesionales en mecánica
            general, cajas automáticas, sistemas electrónicos y programación de
            módulos.
          </p>
          <div className='flex flex-col md:flex-row justify-center gap-6 mb-10'>
            <div className='border-2 border-red-600 rounded-lg px-6 py-4 text-white font-bold text-lg tracking-wide text-center min-w-[260px] w-72'>
              CAPACITACIÓN TÉCNICA
              <br />
              PROFESIONAL
            </div>
            <div className='border-2 border-red-600 rounded-lg px-6 py-4 text-white font-bold text-lg tracking-wide text-center min-w-[260px] w-72'>
              DIAGNÓSTICO AUTOMOTRIZ
              <br />
              AVANZADO
            </div>
            <div className='border-2 border-red-600 rounded-lg px-6 py-4 text-white font-bold text-lg tracking-wide text-center min-w-[260px] w-72'>
              SERVICIO ESPECIALIZADO DE
              <br />
              CAJAS AUTOMÁTICAS
            </div>
          </div>
          <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded transition-all text-lg shadow-lg'>
            Ver Más
          </button>
        </div>
      </section>
      {/* Sección de contacto */}
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
    </>
  )
}
