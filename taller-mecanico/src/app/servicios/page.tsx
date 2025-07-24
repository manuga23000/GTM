'use client'
import Navbar from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import BookingSection from '@/components/sections/BookingSection'
import ContactoSection from '@/components/sections/ContactoSection'

// Hero section
function ServiciosHero() {
  return (
    <section
      className='relative min-h-[90vh] flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/servicios/servicios.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-4xl mx-auto text-center px-4'>
        <h1 className='text-5xl md:text-6xl font-extrabold mb-6 text-white'>
          NUESTROS <span className='text-red-600'>SERVICIOS</span>
        </h1>
        <p className='text-white text-lg mb-8 max-w-2xl mx-auto'>
          Especialistas en cajas automáticas, mecánica general y programación de
          módulos. Soluciones para particulares y empresas.
        </p>
      </div>
    </section>
  )
}

// Servicios básicos en grid
function ServiciosBasicos() {
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

// Servicios principales con layout texto/imagen alternado
function ServiciosPrincipales() {
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

// Programación de módulos detallada
function ProgramacionModulos() {
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

// Capacitación Técnica Profesional
function CapacitacionTecnica() {
  return (
    <section
      className='relative py-20 bg-gray-900 text-white'
      style={{
        backgroundImage: "url('/images/servicios/capacitacion.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <div className='bg-black/60 p-12 rounded-lg backdrop-blur-sm'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>
              CAPACITACIÓN TÉCNICA{' '}
              <span className='text-red-600'>PROFESIONAL</span>
            </h2>
            <div className='w-24 h-1 bg-red-600 mx-auto mb-8'></div>
          </div>

          <div className='max-w-4xl mx-auto text-center'>
            <p className='text-gray-200 text-lg leading-relaxed mb-8'>
              Ofrecemos programas de formación especializados para técnicos y
              profesionales del sector automotriz, enfocados en el desarrollo de
              habilidades prácticas y conocimientos teóricos. Nuestras
              capacitaciones abarcan desde conceptos básicos hasta tecnologías
              avanzadas, permitiendo a los participantes dominar las
              herramientas y técnicas necesarias para la reparación y
              mantenimiento de vehículos modernos.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>🎓</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Cursos Teóricos</h3>
                <p className='text-gray-300 text-sm'>
                  Fundamentos de mecánica, electrónica automotriz y sistemas
                  modernos
                </p>
              </div>

              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>🔧</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Práctica Hands-On</h3>
                <p className='text-gray-300 text-sm'>
                  Talleres prácticos con herramientas y equipos profesionales
                </p>
              </div>

              <div className='bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>📜</span>
                </div>
                <h3 className='text-xl font-bold mb-3'>Certificación</h3>
                <p className='text-gray-300 text-sm'>
                  Certificados oficiales que avalan la capacitación recibida
                </p>
              </div>
            </div>

            <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-lg hover:scale-105 text-lg'>
              Solicitar Información
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ServiciosPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <ServiciosHero />
      <ServiciosBasicos />
      <ServiciosPrincipales />
      <ProgramacionModulos />
      <CapacitacionTecnica />
      <ContactoSection />
      <BookingSection />
      <WhatsAppButton />
    </div>
  )
}
