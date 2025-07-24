import Image from 'next/image'

export default function ServiciosParticulares() {
  return (
    <section
      className='relative w-full min-h-[600px] flex items-center justify-center py-20'
      style={{
        backgroundImage: "url('/images/servicios/chevrolet.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'right',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4'>
        <div className='flex flex-col items-start text-left space-y-6'>
          <h2 className='text-white font-extrabold text-5xl mb-2'>
            SERVICIOS <br />
            <span className='relative text-red-600 inline-block'>
              PARTICULARES
            </span>
          </h2>
          <p className='text-white text-lg max-w-xl mt-6 mb-8'>
            Brindamos atención especializada para tu vehículo con tecnología de
            última generación. Nuestro equipo de técnicos certificados realiza
            diagnósticos precisos y reparaciones profesionales en mecánica
            general, cajas automáticas, sistemas electrónicos y programación de
            módulos.
          </p>
          <ul className='text-white text-lg font-bold space-y-2 mb-10'>
            <li>✓ Trabajos de electrónica</li>
            <li>✓ Mecánica en general</li>
            <li>✓ Cajas automáticas</li>
            <li>✓ Mas Servicios</li>
          </ul>
          <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded transition-all text-lg shadow-lg'>
            Ver Todo
          </button>
        </div>
        {/* Columna derecha vacía para dejar ver la imagen */}
        <div className='hidden lg:block'></div>
      </div>
    </section>
  )
}
