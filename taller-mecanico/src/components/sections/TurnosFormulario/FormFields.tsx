'use client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import { es } from 'date-fns/locale/es'
import { TurnoInput, ServiceConfig } from '../../../actions/types/types'

const esCustom = {
  ...es,
  localize: {
    ...es.localize,
    day: (n: number) => {
      const days = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']
      return days[n]
    },
    month: (n: number) => {
      const months = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
      ]
      return months[n]
    },
  },
}

registerLocale('es-custom', esCustom)

interface FormFieldsProps {
  formData: TurnoInput
  availabilityCache: Record<string, boolean>
  isLoadingDates: boolean
  onFieldChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  onDateChange: (date: Date | null) => void
  getServiceConfig: (serviceName: string) => ServiceConfig | null
}

export default function FormFields({
  formData,
  availabilityCache,
  isLoadingDates,
  onFieldChange,
  onDateChange,
  getServiceConfig,
}: FormFieldsProps) {
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDayAllowedForService = (date: Date, serviceName: string): boolean => {
    const config = getServiceConfig(serviceName)
    if (!config || !config.isActive) return false

    const dayOfWeek = date.getDay()
    const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek

    return config.allowedDays.includes(dayNumber)
  }

  return (
    <>
      <div className='mb-2 p-4 rounded-lg bg-blue-900/60 border border-blue-400 flex items-center gap-3 text-blue-200 text-sm shadow-sm'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-blue-300'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0v6'
          />
        </svg>
        <span>
          <b>Todos los trabajos</b>, incluyendo caja automática y servicios
          especializados, los realizamos{' '}
          <b>nosotros mismos en nuestro taller</b>. <b>No tercerizamos</b>{' '}
          ningún trabajo. Su vehículo queda siempre en manos de nuestro equipo.
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Nombre completo <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={onFieldChange}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            placeholder='Tu nombre completo'
            required
          />
        </div>

        <div>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Teléfono <span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={formData.phone}
            onChange={onFieldChange}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            placeholder='Tu número de teléfono'
            required
          />
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Email <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={onFieldChange}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            placeholder='tu@email.com'
            required
          />
        </div>

        <div>
          <label
            htmlFor='vehicle'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Vehículo
          </label>
          <input
            type='text'
            id='vehicle'
            name='vehicle'
            value={formData.vehicle}
            onChange={onFieldChange}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            placeholder='Marca, modelo y año'
            required
          />
        </div>

        <div>
          <label
            htmlFor='service'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Servicio requerido <span className='text-red-500'>*</span>
          </label>
          <select
            id='service'
            name='service'
            value={formData.service}
            onChange={onFieldChange}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            required
          >
            <option value=''>Selecciona un servicio</option>
            <option value='Diagnóstico'>Diagnóstico</option>
            <option value='Caja automática'>Caja automática</option>
            <option value='Mecánica general'>Mecánica general</option>
            <option value='Programación de módulos'>
              Programación de módulos
            </option>
            <option value='Revisación técnica'>Revisación técnica</option>
            <option value='Otro'>Otro</option>
          </select>
        </div>

        {formData.service === 'Caja automática' && (
          <div>
            <label
              htmlFor='subService'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Tipo de servicio *
            </label>
            <select
              id='subService'
              name='subService'
              value={formData.subService || ''}
              onChange={onFieldChange}
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
              required
            >
              <option value=''>Selecciona el tipo de servicio</option>
              <option value='Service de mantenimiento'>
                Service de mantenimiento
              </option>
              <option value='Diagnóstico de caja'>Diagnóstico de caja</option>
              <option value='Reparación de fugas'>Reparación de fugas</option>
              <option value='Overhaul completo'>Overhaul completo</option>
              <option value='Cambio de solenoides'>Cambio de solenoides</option>
              <option value='Reparaciones mayores'>Reparaciones mayores</option>
              <option value='Otro'>Otro</option>
            </select>
          </div>
        )}

        {formData.service === 'Mecánica general' && (
          <div>
            <label
              htmlFor='subService'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Tipo de servicio *
            </label>
            <select
              id='subService'
              name='subService'
              value={formData.subService || ''}
              onChange={onFieldChange}
              className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
              required
            >
              <option value=''>Selecciona el tipo de servicio</option>
              <option value='Correa de distribución'>
                Correa de distribución
              </option>
              <option value='Frenos'>Frenos</option>
              <option value='Embrague'>Embrague</option>
              <option value='Suspensión'>Suspensión</option>
              <option value='Motor'>Motor</option>
              <option value='Bujías / Inyectores'>Bujías / Inyectores</option>
              <option value='Batería'>Batería</option>
              <option value='Ruidos o vibraciones'>Ruidos o vibraciones</option>
              <option value='Mantenimiento general'>
                Mantenimiento general
              </option>
              <option value='Dirección'>Dirección</option>
              <option value='Otro / No estoy seguro'>
                Otro / No estoy seguro
              </option>
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor='preferredDate'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Fecha <span className='text-red-500'>*</span>
          </label>

          {formData.service === 'Programación de módulos' ? (
            <div className='p-4 bg-blue-900 border border-blue-700 rounded-lg'>
              <div className='flex items-start space-x-3'>
                <span className='text-blue-400 text-xl'>🧠</span>
                <div className='flex-1'>
                  <p className='text-sm text-blue-200 mb-3'>
                    Este servicio requiere coordinación técnica personalizada.
                  </p>
                  <a
                    href='https://wa.me/5493364694921?text=Hola%20quiero%20consultar%20por%20programaci%C3%B3n%20de%20m%C3%B3dulos'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors duration-300'
                  >
                    <span className='mr-2'>📲</span>
                    Hablar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoadingDates ? (
                <div className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 flex items-center justify-center'>
                  <div className='flex items-center space-x-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-500'></div>
                    <span>Cargando fechas disponibles...</span>
                  </div>
                </div>
              ) : (
                <DatePicker
                  selected={formData.date}
                  onChange={onDateChange}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='Selecciona una fecha'
                  minDate={(() => {
                    const now = new Date()
                    const today8AM = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      8,
                      10,
                      0
                    )

                    if (now < today8AM) {
                      return new Date()
                    }

                    return new Date(now.getTime() + 24 * 60 * 60 * 1000)
                  })()}
                  locale='es-custom'
                  calendarStartDay={0}
                  filterDate={date => {
                    const dateString = getLocalDateString(date)

                    if (formData.service === 'Diagnóstico') {
                      if (!isDayAllowedForService(date, 'Diagnóstico')) {
                        return false
                      }

                      const cacheKey = `${dateString}-Diagnóstico`
                      return availabilityCache[cacheKey] === true
                    }

                    if (formData.service === 'Revisación técnica') {
                      if (!isDayAllowedForService(date, 'Revisación técnica')) {
                        return false
                      }

                      const cacheKey = `${dateString}-Revisación técnica`
                      return availabilityCache[cacheKey] === true
                    }

                    if (formData.service === 'Otro') {
                      if (!isDayAllowedForService(date, 'Otro')) {
                        return false
                      }

                      const cacheKey = `${dateString}-Otro`
                      return availabilityCache[cacheKey] === true
                    }

                    if (
                      formData.service === 'Caja automática' &&
                      formData.subService
                    ) {
                      if (!isDayAllowedForService(date, formData.subService)) {
                        return false
                      }

                      const cacheKey = `${dateString}-${formData.subService}`
                      return availabilityCache[cacheKey] === true
                    }

                    if (
                      formData.service === 'Mecánica general' &&
                      formData.subService
                    ) {
                      if (!isDayAllowedForService(date, formData.subService)) {
                        return false
                      }

                      const cacheKey = `${dateString}-${formData.subService}`
                      return availabilityCache[cacheKey] === true
                    }

                    if (
                      formData.service === 'Caja automática' &&
                      !formData.subService
                    ) {
                      const day = date.getDay()
                      return day >= 1 && day <= 5
                    }

                    if (
                      formData.service === 'Mecánica general' &&
                      !formData.subService
                    ) {
                      const day = date.getDay()
                      return day >= 1 && day <= 5
                    }

                    return false
                  }}
                  className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  wrapperClassName='w-full'
                  disabled={
                    ![
                      'Diagnóstico',
                      'Caja automática',
                      'Mecánica general',
                      'Revisación técnica',
                      'Otro',
                    ].includes(formData.service)
                  }
                />
              )}
              <p className='text-xs text-gray-400 mt-2'>
                ⏰ Horario para traer el auto: 8:00 a 8:30
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
