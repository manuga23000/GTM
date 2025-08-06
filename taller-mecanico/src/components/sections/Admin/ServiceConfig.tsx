'use client'
import { useState, useEffect } from 'react'
import type { ServiceConfig } from '@/actions/types/types'
import {
  getAllServiceConfigs,
  updateServiceConfig,
  initializeServiceConfigs,
  cleanDuplicateConfigs,
} from '@/actions/serviceconfig'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
]

export default function ServiceConfig() {
  const [configs, setConfigs] = useState<ServiceConfig[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Servicios disponibles para configuración
  const availableServices = [
    'Diagnóstico',
    'Revisación técnica',
    'Otro',
    'Caja automática',
  ]

  // Sub-servicios de Caja automática
  const cajaAutomaticaSubServices = [
    'Service de mantenimiento',
    'Diagnóstico de caja',
    'Reparación de fugas',
    'Cambio de solenoides',
    'Overhaul completo',
    'Reparaciones mayores',
  ]

  // Cargar configuraciones desde Firebase
  const loadConfigs = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando configuraciones desde Firebase...')

      // Primero limpiar configuraciones duplicadas
      await cleanDuplicateConfigs()

      // Luego inicializar configuraciones por defecto si no existen
      await initializeServiceConfigs()

      // Finalmente obtener todas las configuraciones
      const allConfigs = await getAllServiceConfigs()
      console.log('📋 Configuraciones cargadas:', allConfigs)

      // Filtrar configuraciones duplicadas (mantener solo la más reciente)
      const uniqueConfigs = allConfigs.reduce((acc, config) => {
        const existingIndex = acc.findIndex(
          c => c.serviceName === config.serviceName
        )
        if (existingIndex === -1) {
          acc.push(config)
        } else {
          // Si ya existe, mantener la más reciente (con fecha de actualización más nueva)
          const existing = acc[existingIndex]
          if (config.updatedAt > existing.updatedAt) {
            acc[existingIndex] = config
          }
        }
        return acc
      }, [] as ServiceConfig[])

      console.log('🔍 Configuraciones únicas:', uniqueConfigs)
      setConfigs(uniqueConfigs)

      // Seleccionar automáticamente el primer servicio disponible si no hay ninguno seleccionado
      if (!selectedService && uniqueConfigs.length > 0) {
        const firstAvailableService = uniqueConfigs.find(config =>
          availableServices.includes(config.serviceName)
        )
        if (firstAvailableService) {
          setSelectedService(firstAvailableService.serviceName)
        }
      }
    } catch (error) {
      console.error('❌ Error cargando configuraciones:', error)
      setMessage('Error al cargar las configuraciones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    loadConfigs()
  }, [])

  // Actualizar una configuración específica
  const updateConfig = (serviceName: string, field: string, value: any) => {
    setConfigs(prev =>
      prev.map(config =>
        config.serviceName === serviceName
          ? { ...config, [field]: value }
          : config
      )
    )
  }

  // Alternar día permitido
  const toggleDay = (serviceName: string, dayValue: number) => {
    setConfigs(prev =>
      prev.map(config => {
        if (config.serviceName === serviceName) {
          const currentDays = config.allowedDays
          const newDays = currentDays.includes(dayValue)
            ? currentDays.filter(d => d !== dayValue)
            : [...currentDays, dayValue].sort()
          return { ...config, allowedDays: newDays }
        }
        return config
      })
    )
  }

  // Habilitar/deshabilitar todos los días
  const toggleAllDays = (serviceName: string) => {
    setConfigs(prev =>
      prev.map(config => {
        if (config.serviceName === serviceName) {
          const currentDays = config.allowedDays
          const allDays = [1, 2, 3, 4, 5] // Lunes a viernes

          // Si todos los días están habilitados, deshabilitar todos
          // Si no todos están habilitados, habilitar todos
          const newDays = currentDays.length === allDays.length ? [] : allDays
          return { ...config, allowedDays: newDays }
        }
        return config
      })
    )
  }

  // Guardar configuración seleccionada en Firebase
  const handleSave = async () => {
    if (!selectedService) {
      setMessage('❌ Por favor, selecciona un servicio para configurar')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setSaving(true)
    try {
      if (selectedService === 'Caja automática') {
        // Guardar todas las configuraciones de sub-servicios de Caja automática
        console.log(
          '💾 Guardando configuraciones de sub-servicios de Caja automática...'
        )

        const subServiceConfigs = configs.filter(config =>
          cajaAutomaticaSubServices.includes(config.serviceName)
        )

        for (const configToSave of subServiceConfigs) {
          console.log(`🔄 Guardando ${configToSave.serviceName}...`)
          const result = await updateServiceConfig(configToSave.serviceName, {
            maxPerDay: configToSave.maxPerDay,
            maxPerWeek: configToSave.maxPerWeek,
            requiresDate: configToSave.requiresDate,
            allowedDays: configToSave.allowedDays,
            isActive: configToSave.isActive,
            serviceName: configToSave.serviceName,
          })

          if (!result.success) {
            throw new Error(
              `Error guardando ${configToSave.serviceName}: ${result.message}`
            )
          }
          console.log(`✅ ${configToSave.serviceName} guardado correctamente`)
        }

        setMessage(
          '✅ Configuraciones de Caja automática guardadas exitosamente'
        )
      } else {
        // Guardar configuración de un servicio individual
        console.log(`💾 Guardando configuración para ${selectedService}...`)

        const configToSave = configs.find(
          config => config.serviceName === selectedService
        )
        if (!configToSave) {
          throw new Error(
            `No se encontró configuración para ${selectedService}`
          )
        }

        const result = await updateServiceConfig(selectedService, {
          maxPerDay: configToSave.maxPerDay,
          maxPerWeek: configToSave.maxPerWeek,
          requiresDate: configToSave.requiresDate,
          allowedDays: configToSave.allowedDays,
          isActive: configToSave.isActive,
          serviceName: configToSave.serviceName,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        console.log(`✅ ${selectedService} guardado correctamente`)
        setMessage(
          `✅ Configuración de ${selectedService} guardada exitosamente`
        )
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('❌ Error guardando configuración:', error)
      setMessage(`❌ Error: ${error.message}`)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  // Renderizar configuración de un servicio
  const renderServiceConfig = (config: ServiceConfig) => {
    const isActiveService = [
      'Diagnóstico',
      'Revisación técnica',
      'Otro',
      ...cajaAutomaticaSubServices,
    ].includes(config.serviceName)

    return (
      <div
        className={`bg-gray-800 p-6 rounded-xl border-l-4 ${
          isActiveService ? 'border-blue-500' : 'border-gray-600'
        } ${selectedService === 'Caja automática' ? 'mb-0' : 'mb-6'}`}
      >
        <div className='flex justify-between items-start mb-4'>
          <h3
            className={`text-lg font-semibold ${
              isActiveService ? 'text-white' : 'text-gray-400'
            }`}
          >
            {config.serviceName}
          </h3>
        </div>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Máximo por día
              </label>
              <input
                type='number'
                min='0'
                value={config.maxPerDay || ''}
                onChange={e =>
                  updateConfig(
                    config.serviceName,
                    'maxPerDay',
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                disabled={!isActiveService}
                className={`w-full p-2 rounded border text-white focus:outline-none focus:ring-2 ${
                  isActiveService
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-600 cursor-text'
                    : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }`}
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
                value={config.maxPerWeek || ''}
                onChange={e =>
                  updateConfig(
                    config.serviceName,
                    'maxPerWeek',
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                disabled={!isActiveService}
                className={`w-full p-2 rounded border text-white focus:outline-none focus:ring-2 ${
                  isActiveService
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-600 cursor-text'
                    : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                placeholder='Sin límite'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Días permitidos
            </label>
            <div className='flex justify-between items-center'>
              <div className='flex flex-wrap gap-2'>
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(config.serviceName, day.value)}
                    disabled={!isActiveService}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isActiveService
                        ? config.allowedDays.includes(day.value)
                          ? 'bg-blue-600 text-white cursor-pointer'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer'
                        : config.allowedDays.includes(day.value)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => toggleAllDays(config.serviceName)}
                disabled={!isActiveService}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isActiveService
                    ? 'bg-gray-600 hover:bg-gray-500 text-white cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {config.allowedDays.length === 5 ? '❌ Todos' : '✅ Todos'}
              </button>
            </div>
          </div>

          {isActiveService && (
            <div className='bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mt-4'>
              <p className='text-blue-300 text-sm'>
                <strong>💡 Tip:</strong> Esta configuración se aplica
                inmediatamente al sistema de turnos. Los cambios afectan la
                disponibilidad de fechas para los clientes.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        <span className='ml-4 text-white'>Cargando configuraciones...</span>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-white'>
          Configuración de Servicios
        </h2>
        <p className='text-gray-400 text-sm mt-1'>
          Gestiona la disponibilidad y límites de cada servicio
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('✅')
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {message}
        </div>
      )}

      {/* Selector de servicios */}
      <div className='bg-gray-800 p-6 rounded-xl border border-gray-700'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Selecciona un servicio para configurar
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {availableServices.map(service => {
            const config = configs.find(c => c.serviceName === service)
            const isSelected = selectedService === service

            return (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300 hover:text-white'
                }`}
              >
                <div className='text-center'>
                  <div className='text-2xl mb-2'>
                    {service === 'Diagnóstico' && '🔍'}
                    {service === 'Revisación técnica' && '📋'}
                    {service === 'Otro' && '⚙️'}
                    {service === 'Caja automática' && '🔧'}
                  </div>
                  <div className='font-semibold'>{service}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuración del servicio seleccionado */}
      {selectedService && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center border-b border-gray-700 pb-2'>
            <h3 className='text-xl font-semibold text-white'>
              Configuración de: {selectedService}
            </h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 cursor-pointer'
            >
              {saving ? (
                <>
                  <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Guardando...
                </>
              ) : (
                '💾 Guardar Configuración'
              )}
            </button>
          </div>

          {selectedService === 'Caja automática' ? (
            // Mostrar sub-servicios de Caja automática directamente como configuraciones
            <div className='space-y-6'>
              <p className='text-gray-300 text-sm mb-4'>
                Configuración de sub-servicios de Caja automática:
              </p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {cajaAutomaticaSubServices.map(subService => {
                  const subConfig = configs.find(
                    c => c.serviceName === subService
                  )
                  if (subConfig) {
                    return (
                      <div key={subService}>
                        {renderServiceConfig(subConfig)}
                      </div>
                    )
                  } else {
                    return (
                      <div
                        key={subService}
                        className='bg-gray-800 p-6 rounded-xl border-l-4 border-gray-600'
                      >
                        <div className='flex justify-between items-start mb-4'>
                          <h3 className='text-lg font-semibold text-gray-400'>
                            {subService}
                            <span className='ml-2 px-2 py-1 bg-gray-600 text-xs rounded-full text-gray-300'>
                              SIN CONFIGURACIÓN
                            </span>
                          </h3>
                        </div>
                        <div className='text-center py-8 text-gray-400'>
                          No se encontró configuración para {subService}.
                          <button
                            onClick={loadConfigs}
                            className='block mx-auto mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer'
                          >
                            🔄 Recargar
                          </button>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          ) : (
            // Mostrar configuración del servicio seleccionado
            (() => {
              const selectedConfig = configs.find(
                config => config.serviceName === selectedService
              )
              if (selectedConfig) {
                return renderServiceConfig(selectedConfig)
              } else {
                return (
                  <div className='text-center py-8 text-gray-400'>
                    No se encontró configuración para {selectedService}.
                    <button
                      onClick={loadConfigs}
                      className='block mx-auto mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer'
                    >
                      🔄 Recargar
                    </button>
                  </div>
                )
              }
            })()
          )}
        </div>
      )}

      {/* Información */}
      <div className='bg-gray-800 p-6 rounded-xl mt-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          ℹ️ Información de Configuración
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

        <div className='mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg'>
          <p className='text-blue-300 text-sm'>
            <strong>🤝 Coexistencia de límites:</strong> Si configuras AMBOS
            límites (diario y semanal), el sistema verificará que se cumplan las
            DOS condiciones. Por ejemplo: con máximo 2/día y 8/semana, si el
            lunes ya tienes 2 turnos, el martes seguirá disponible porque solo
            has usado 2 de los 8 turnos semanales.
          </p>
        </div>
      </div>
    </div>
  )
}
