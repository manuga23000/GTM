import ServiceCard from '@/components/ui/ServiceCard'

export default function Services() {
  const services = [
    {
      icon: '🚗',
      title: 'PARTICULARES',
      items: [
        'Trabajos de electrónica',
        'Mecánica en general',
        'Cajas automáticas',
        'Programación de módulos',
      ],
    },
    {
      icon: '🏢',
      title: 'EMPRESARIALES',
      items: [
        'Flotas de vehículos',
        'Mantenimiento preventivo',
        'Contratos de servicios',
        'Atención prioritaria',
      ],
    },
    {
      icon: '⚙️',
      title: 'ESPECIALIZADOS',
      items: [
        'Motores de alta gama',
        'Vehículos de competición',
        'Diagnóstico avanzado',
        'Conversiones especiales',
      ],
    },
  ]

  return (
    <section id='servicios' className='py-20 bg-gray-900/50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-6xl font-bold mb-4'>
            NUESTROS <span className='text-red-500'>SERVICIOS</span>
          </h2>
          <p className='text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed'>
            Ofrecemos soluciones integrales para todo tipo de vehículos con
            tecnología de última generación y un equipo de técnicos altamente
            capacitados.
          </p>
        </div>

        {/* Services Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              items={service.items}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
