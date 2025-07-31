'use client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { TurnoInput } from '../../../actions/types/types'

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
}

export default function FormFields({
  formData,
  availabilityCache,
  isLoadingDates,
  onFieldChange,
  onDateChange,
}: FormFieldsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Nombre */}
      <div>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Nombre completo *
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

      {/* Teléfono */}
      <div>
        <label
          htmlFor='phone'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Teléfono *
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

      {/* Email */}
      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Email
        </label>
        <input
          type='email'
          id='email'
          name='email'
          value={formData.email}
          onChange={onFieldChange}
          className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
          placeholder='tu@email.com'
        />
      </div>

      {/* Vehículo */}
      <div>
        <label
          htmlFor='vehicle'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Vehículo *
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

      {/* Servicio */}
      <div>
        <label
          htmlFor='service'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Servicio requerido *
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

      {/* Sub-servicio para Caja automática */}
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

      {/* Fecha preferida - Solo disponible para diagnóstico */}
      <div>
        <label
          htmlFor='preferredDate'
          className='block text-sm font-medium text-gray-300 mb-2'
        >
          Fecha
        </label>
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
            minDate={new Date()}
            filterDate={date => {
              // Solo permitir días de lunes a viernes
              const day = date.getDay()
              const isWeekday = day !== 0 && day !== 6 // 0 = domingo, 6 = sábado

              // Solo permitir días de lunes a viernes
              if (!isWeekday) return false

              // Para Diagnóstico, verificar disponibilidad específica
              if (formData.service === 'Diagnóstico') {
                const dateString = date.toISOString().split('T')[0]
                const cacheKey = `${dateString}-Diagnóstico`
                return availabilityCache[cacheKey] === true
              }

              // Para Caja automática, verificar disponibilidad según el sub-servicio
              if (
                formData.service === 'Caja automática' &&
                formData.subService
              ) {
                const dateString = date.toISOString().split('T')[0]
                const cacheKey = `${dateString}-${formData.subService}`
                return availabilityCache[cacheKey] === true
              }

              // Para Caja automática sin sub-servicio seleccionado, permitir todas las fechas
              if (
                formData.service === 'Caja automática' &&
                !formData.subService
              ) {
                return true
              }

              // Para otros servicios, bloquear todas las fechas
              return false
            }}
            className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            wrapperClassName='w-full'
            disabled={
              !['Diagnóstico', 'Caja automática'].includes(formData.service)
            }
          />
        )}
        <p className='text-xs text-gray-400 mt-2'>
          ⏰ Horario para traer el auto: 8:00 a 8:30
        </p>
      </div>
    </div>
  )
}
