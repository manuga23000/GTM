import Button from '@/components/ui/Button'

export default function BookingSection() {
  const steps = [
    {
      icon: '🔧',
      title: 'Selecciona tu Servicio',
      description: 'Elige entre nuestros servicios especializados',
    },
    {
      icon: '📅',
      title: 'Elige Fecha y Hora',
      description: 'Selecciona el momento que mejor te convenga',
    },
    {
      icon: '✅',
      title: 'Confirma tu Cita',
      description: 'Recibe la confirmación y detalles del servicio',
    },
  ]

  return (
    <section id='reservar-turnos' className='py-20 bg-black'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <div className='space-y-8'>
          <h2 className='text-4xl md:text-6xl font-bold'>
            RESERVA TU <span className='text-red-500'>TURNO</span>
          </h2>
          <p className='text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed'>
            Agenda tu cita de manera rápida y sencilla. Selecciona el servicio
            que necesitas, elige la fecha y hora que más te convenga, y deja tu
            vehículo en manos expertas.
          </p>

          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
            {steps.map((step, index) => (
              <div
                key={index}
                className='bg-gray-800 p-8 rounded-lg text-center max-w-sm'
              >
                <h3 className='text-xl font-semibold text-red-500 mb-4'>
                  {step.icon}
                </h3>
                <h3 className='text-xl font-semibold mb-2'>{step.title}</h3>
                <p className='text-gray-400'>{step.description}</p>
              </div>
            ))}
          </div>

          <div className='mt-12'>
            <Button
              variant='primary'
              size='xl'
              className='hover:scale-105 shadow-lg'
            >
              PRÓXIMAMENTE - SISTEMA DE TURNOS
            </Button>
            <p className='text-gray-400 mt-4 text-sm'>
              Mientras tanto, contáctanos por WhatsApp para coordinar tu cita
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
