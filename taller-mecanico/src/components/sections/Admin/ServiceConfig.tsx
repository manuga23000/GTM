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

// Configuración inicial organizada jerárquicamente
const INITIAL_CONFIG: Record<string, ServiceConfig> = {
  // SERVICIOS PRINCIPALES
  Diagnóstico: {
    maxPerDay: 2,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Revisación técnica': {
    maxPerDay: 1,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Programación de módulos': {
    maxPerDay: null,
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

  // SUB-SERVICIOS DE CAJA AUTOMÁTICA
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

  // SUB-SERVICIOS DE MECÁNICA GENERAL
  'Correa de distribución': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Frenos: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Embrague: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Suspensión: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Motor: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: true,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Bujías / Inyectores': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Batería: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Ruidos o vibraciones': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Mantenimiento general': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  Dirección: {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
  'Otro / No estoy seguro': {
    maxPerDay: 3,
    maxPerWeek: null,
    requiresDate: false,
    allowedDays: [1, 2, 3, 4, 5],
  },
}

const MAIN_SERVICES = [
  'Diagnóstico',
  'Caja automática',
  'Mecánica general',
  'Revisación técnica',
  'Programación de módulos',
  'Otro',
]

const SUB_SERVICES: Record<string, string[]> = {
  'Caja automática': [
    'Service de mantenimiento',
    'Diagnóstico de caja',
    'Reparación de fugas',
    'Cambio de solenoides',
    'Overhaul completo',
    'Reparaciones mayores',
  ],
  'Mecánica general': [
    'Correa de distribución',
    'Frenos',
    'Embrague',
    'Suspensión',
    'Motor',
    'Bujías / Inyectores',
    'Batería',
    'Ruidos o vibraciones',
    'Mantenimiento general',
    'Dirección',
    'Otro / No estoy seguro',
  ],
}

export default function ServiceConfig() {
  const [config, setConfig] =
    useState<Record<string, ServiceConfig>>(INITIAL_CONFIG)
  const [message, setMessage] = useState('')
  const [selectedMain, setSelectedMain] = useState<string>(MAIN_SERVICES[0])

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
    setMessage('Configuración guardada exitosamente')
    setTimeout(() => setMessage(''), 3000)
  }

  // Renderiza la configuración de un servicio
  const renderServiceConfig = (serviceName: string) => (
    <div
      key={serviceName}
      className='bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 mb-6'
    >
      <h3 className='text-lg font-semibold text-white mb-4'>{serviceName}</h3>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Máximo por día
            </label>
            <input
              type='number'
              min='0'
              value={config[serviceName]?.maxPerDay || ''}
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
              value={config[serviceName]?.maxPerWeek || ''}
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
                  config[serviceName]?.allowedDays.includes(day.value)
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
  )

  // Renderiza los sub-servicios si existen
  const renderSubServices = (main: string) => {
    const subs = SUB_SERVICES[main]
    if (!subs) return renderServiceConfig(main)
    return (
      <>
        <div className='mb-8'>{renderServiceConfig(main)}</div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {subs.map(sub => renderServiceConfig(sub))}
        </div>
      </>
    )
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
      <div className='flex flex-wrap gap-2 mb-8'>
        {MAIN_SERVICES.map(main => (
          <button
            key={main}
            onClick={() => setSelectedMain(main)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-2 ${
              selectedMain === main
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {main}
          </button>
        ))}
      </div>
      {renderSubServices(selectedMain)}
      <div className='bg-gray-800 p-6 rounded-xl mt-8'>
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
            • <strong>Días permitidos:</strong> Días de la semana en los que se
            puede agendar este servicio.
          </p>
        </div>
      </div>
    </div>
  )
}
