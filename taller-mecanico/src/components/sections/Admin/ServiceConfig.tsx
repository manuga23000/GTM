'use client'
import { useState } from 'react'

interface ServiceConfig {
  maxPerDay: number | null
  maxPerWeek: number | null
  requiresDate: boolean
  allowedDays: number[] // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
}

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
]

// Configuración inicial hardcodeada
const INITIAL_CONFIG: Record<string, ServiceConfig> = {
  Diagnóstico: {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Caja automática': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Mecánica general': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Programación de módulos': {
    maxPerDay: null,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Revisación técnica': {
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Service de mantenimiento': {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Diagnóstico de caja': {
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Reparación de fugas': {
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Cambio de solenoides': {
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: false,
    allowedDays: [1, 2, 3],
  },
  'Overhaul completo': {
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: true,
    allowedDays: [1, 2, 3],
  },
  'Reparaciones mayores': {
    maxPerDay: null,
    maxPerWeek: 5,
    requiresDate: true,
    allowedDays: [1, 2, 3],
  },
  'Cambio de aceite y filtros': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Cambio de correas': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Reparación de frenos': {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Otro: {
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
}

export default function ServiceConfig() {
  const [config, setConfig] =
    useState<Record<string, ServiceConfig>>(INITIAL_CONFIG)
  const [message, setMessage] = useState('')

  const updateServiceConfig = (
    serviceName: string,
    field: keyof ServiceConfig,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        [field]: value,
      },
    }))
  }

  const toggleDay = (serviceName: string, dayValue: number) => {
    const currentDays = config[serviceName].allowedDays
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort()

    updateServiceConfig(serviceName, 'allowedDays', newDays)
  }

  const handleSave = () => {
    // Aquí se guardaría en Firebase o localStorage
    setMessage('Configuración guardada exitosamente')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-white'>
          Configuración de Servicios
        </h2>
        <button
          onClick={handleSave}
          className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 cursor-pointer'
        >
          💾 Guardar Configuración
        </button>
      </div>

      {message && (
        <div className='p-4 bg-green-600 text-white rounded-lg'>{message}</div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {Object.entries(config).map(([serviceName, serviceConfig]) => (
          <div key={serviceName} className='bg-gray-800 p-6 rounded-xl'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              {serviceName}
            </h3>

            <div className='space-y-4'>
              {/* Límites */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Máximo por día
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={serviceConfig.maxPerDay || ''}
                    onChange={e =>
                      updateServiceConfig(
                        serviceName,
                        'maxPerDay',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className='w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-text'
                    placeholder='Sin límite'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Máximo por semana
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={serviceConfig.maxPerWeek || ''}
                    onChange={e =>
                      updateServiceConfig(
                        serviceName,
                        'maxPerWeek',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className='w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-text'
                    placeholder='Sin límite'
                  />
                </div>
              </div>

              {/* Requiere fecha */}
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id={`requiresDate-${serviceName}`}
                  checked={serviceConfig.requiresDate}
                  onChange={e =>
                    updateServiceConfig(
                      serviceName,
                      'requiresDate',
                      e.target.checked
                    )
                  }
                  className='w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 cursor-pointer'
                />
                <label
                  htmlFor={`requiresDate-${serviceName}`}
                  className='text-sm font-medium text-gray-300 cursor-pointer'
                >
                  Requiere fecha específica
                </label>
              </div>

              {/* Días permitidos */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Días permitidos
                </label>
                <div className='flex flex-wrap gap-2'>
                  {DAYS.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(serviceName, day.value)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                        serviceConfig.allowedDays.includes(day.value)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className='bg-gray-800 p-6 rounded-xl'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Información de Configuración
        </h3>
        <div className='text-gray-300 space-y-2 text-sm'>
          <p>
            • <strong>Máximo por día:</strong> Número máximo de turnos que se
            pueden agendar por día para este servicio.
          </p>
          <p>
            • <strong>Máximo por semana:</strong> Número máximo de turnos que se
            pueden agendar por semana para este servicio.
          </p>
          <p>
            • <strong>Requiere fecha:</strong> Si está activado, el cliente debe
            seleccionar una fecha específica.
          </p>
          <p>
            • <strong>Días permitidos:</strong> Días de la semana en los que se
            puede agendar este servicio.
          </p>
        </div>
      </div>
    </div>
  )
}
