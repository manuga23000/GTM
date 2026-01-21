'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ServiceConfig } from '@/actions/types/types'
import {
  getAllServiceConfigs,
  updateServiceConfig,
  initializeServiceConfigs,
  cleanDuplicateConfigs,
  getVacationMode,
  setVacationMode,
} from '@/actions/serviceconfig'

const DAYS_MOBILE = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
]

const DAYS_DESKTOP = [
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
  const [vacationMode, setVacationModeState] = useState(false)
  const [vacationLoading, setVacationLoading] = useState(false)

  const availableServices = [
    'Diagnóstico',
    'Revisación técnica',
    'Otro',
    'Caja automática',
    'Mecánica general',
  ]

  const cajaAutomaticaSubServices = [
    'Service de mantenimiento',
    'Diagnóstico de caja',
    'Reparación de fugas',
    'Cambio de solenoides',
    'Overhaul completo',
    'Reparaciones mayores',
  ]

  const mecanicaGeneralSubServices = [
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
  ]

  const loadVacationMode = async () => {
    try {
      const vacationConfig = await getVacationMode()
      if (vacationConfig) {
        setVacationModeState(vacationConfig.enabled)
      }
    } catch (error) {
      console.error('❌ Error cargando modo vacaciones:', error)
    }
  }

  const handleToggleVacationMode = async () => {
    setVacationLoading(true)
    try {
      const newState = !vacationMode
      const result = await setVacationMode(newState)

      if (result.success) {
        setVacationModeState(newState)
        setMessage(`✅ ${result.message}`)
      } else {
        setMessage(`❌ ${result.message}`)
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('❌ Error al cambiar modo vacaciones:', error)
      setMessage('❌ Error al cambiar modo vacaciones')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setVacationLoading(false)
    }
  }

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true)

      await cleanDuplicateConfigs()

      await initializeServiceConfigs()

      const allConfigs = await getAllServiceConfigs()

      const uniqueConfigs = allConfigs.reduce((acc, config) => {
        const existingIndex = acc.findIndex(
          c => c.serviceName === config.serviceName
        )
        if (existingIndex === -1) {
          acc.push(config)
        } else {
          const existing = acc[existingIndex]
          if (config.updatedAt > existing.updatedAt) {
            acc[existingIndex] = config
          }
        }
        return acc
      }, [] as ServiceConfig[])

      setConfigs(uniqueConfigs)

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
  }, [])

  useEffect(() => {
    loadConfigs()
    loadVacationMode()
  }, [loadConfigs])

  const updateConfig = (serviceName: string, field: string, value: unknown) => {
    setConfigs(prev =>
      prev.map(config =>
        config.serviceName === serviceName
          ? { ...config, [field]: value }
          : config
      )
    )
  }

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

  const toggleAllDays = (serviceName: string) => {
    setConfigs(prev =>
      prev.map(config => {
        if (config.serviceName === serviceName) {
          const currentDays = config.allowedDays
          const allDays = [1, 2, 3, 4, 5]

          const newDays = currentDays.length === allDays.length ? [] : allDays
          return { ...config, allowedDays: newDays }
        }
        return config
      })
    )
  }

  const handleSave = async () => {
    if (!selectedService) {
      setMessage('❌ Por favor, selecciona un servicio para configurar')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setSaving(true)
    try {
      if (selectedService === 'Caja automática') {
        const subServiceConfigs = configs.filter(config =>
          cajaAutomaticaSubServices.includes(config.serviceName)
        )

        for (const configToSave of subServiceConfigs) {
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
        }

        setMessage(
          '✅ Configuraciones de Caja automática guardadas exitosamente'
        )
      } else if (selectedService === 'Mecánica general') {
        const subServiceConfigs = configs.filter(config =>
          mecanicaGeneralSubServices.includes(config.serviceName)
        )

        for (const configToSave of subServiceConfigs) {
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
        }

        setMessage(
          '✅ Configuraciones de Mecánica general guardadas exitosamente'
        )
      } else {
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

        setMessage(
          `✅ Configuración de ${selectedService} guardada exitosamente`
        )
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error: unknown) {
      console.error('❌ Error guardando configuración:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      setMessage(`❌ Error: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const renderServiceConfig = (config: ServiceConfig) => {
    const isActiveService = [
      'Diagnóstico',
      'Revisación técnica',
      'Otro',
      ...cajaAutomaticaSubServices,
      ...mecanicaGeneralSubServices,
    ].includes(config.serviceName)

    return (
      <div
        className={`bg-gray-800 p-3 sm:p-6 rounded-xl border-l-4 ${
          isActiveService ? 'border-blue-500' : 'border-gray-600'
        } ${
          selectedService === 'Caja automática' ||
          selectedService === 'Mecánica general'
            ? 'mb-0'
            : 'mb-3 sm:mb-6'
        }`}
      >
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-0'>
          <h3
            className={`text-sm sm:text-lg font-semibold ${
              isActiveService ? 'text-white' : 'text-gray-400'
            }`}
          >
            {config.serviceName}
          </h3>
        </div>

        <div className='space-y-3 sm:space-y-4'>
          {/* Grid responsivo para inputs */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2'>
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
                className={`w-full p-2 rounded border text-white focus:outline-none focus:ring-2 text-xs sm:text-base ${
                  isActiveService
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-600 cursor-text'
                    : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                placeholder='Sin límite'
              />
            </div>
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2'>
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
                className={`w-full p-2 rounded border text-white focus:outline-none focus:ring-2 text-xs sm:text-base ${
                  isActiveService
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-600 cursor-text'
                    : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                placeholder='Sin límite'
              />
            </div>
          </div>

          {/* Días permitidos - RESPONSIVO */}
          <div>
            <label className='block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2'>
              Días permitidos
            </label>
            <div className='flex justify-between items-center'>
              <div className='flex flex-wrap gap-1 sm:gap-2'>
                {/* Móvil: mostrar versión corta */}
                <div className='flex gap-1 sm:hidden'>
                  {DAYS_MOBILE.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(config.serviceName, day.value)}
                      disabled={!isActiveService}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors min-w-[28px] ${
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
                {/* Desktop: mostrar versión completa */}
                <div className='hidden sm:flex gap-2'>
                  {DAYS_DESKTOP.map(day => (
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
              </div>
              <button
                onClick={() => toggleAllDays(config.serviceName)}
                disabled={!isActiveService}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ml-2 ${
                  isActiveService
                    ? 'bg-gray-600 hover:bg-gray-500 text-white cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {config.allowedDays.length === 5 ? '❌' : '✅'}
              </button>
            </div>
          </div>

          {isActiveService && (
            <div className='bg-blue-900/20 border border-blue-700/30 rounded-lg p-2 sm:p-3 mt-3 sm:mt-4'>
              <p className='text-blue-300 text-xs sm:text-sm'>
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
      <div className='flex justify-center items-center h-32 sm:h-64'>
        <div className='animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500'></div>
        <span className='ml-4 text-white text-sm sm:text-base'>
          Cargando configuraciones...
        </span>
      </div>
    )
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div>
        <h2 className='text-lg sm:text-2xl font-bold text-white'>
          Configuración de Servicios
        </h2>
        <p className='text-gray-400 text-xs sm:text-sm mt-1'>
          Gestiona la disponibilidad y límites de cada servicio
        </p>
      </div>

      {message && (
        <div
          className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            message.includes('✅')
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {message}
        </div>
      )}

      {/* Modo Vacaciones */}
      <div className='bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-600/50 rounded-xl p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-2xl sm:text-3xl'>🏖️</span>
              <h3 className='text-lg sm:text-xl font-bold text-yellow-400'>
                Modo Vacaciones
              </h3>
            </div>
            <p className='text-gray-300 text-xs sm:text-sm'>
              {vacationMode ? (
                <>
                  <strong className='text-yellow-300'>ACTIVO:</strong> Bloqueando turnos del{' '}
                  <strong className='text-white'>31 de enero</strong> al{' '}
                  <strong className='text-white'>10 de febrero</strong>
                </>
              ) : (
                <>
                  Desactivado. Los clientes pueden sacar turnos normalmente.
                </>
              )}
            </p>
          </div>
          <button
            onClick={handleToggleVacationMode}
            disabled={vacationLoading}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base min-w-[140px] ${
              vacationMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {vacationLoading ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>...</span>
              </div>
            ) : vacationMode ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </button>
        </div>
      </div>

      {/* Selector de servicios - RESPONSIVO */}
      <div className='bg-gray-800 p-3 sm:p-6 rounded-xl border border-gray-700'>
        <h3 className='text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4'>
          Selecciona un servicio para configurar
        </h3>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4'>
          {availableServices.map(service => {
            const isSelected = selectedService === service

            return (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300 hover:text-white'
                }`}
              >
                <div className='text-center'>
                  <div className='text-lg sm:text-2xl mb-1 sm:mb-2'>
                    {service === 'Diagnóstico' && '🔍'}
                    {service === 'Revisación técnica' && '📋'}
                    {service === 'Otro' && '⚙️'}
                    {service === 'Caja automática' && '🔧'}
                    {service === 'Mecánica general' && '🔩'}
                  </div>
                  <div className='font-semibold text-xs sm:text-sm'>
                    {service}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuración del servicio seleccionado */}
      {selectedService && (
        <div className='space-y-4 sm:space-y-6'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-700 pb-2 gap-3 sm:gap-0'>
            <h3 className='text-base sm:text-xl font-semibold text-white'>
              Configuración de: {selectedService}
            </h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className='px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 cursor-pointer text-sm sm:text-base'
            >
              {saving ? (
                <>
                  <div className='inline-block animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2'></div>
                  Guardando...
                </>
              ) : (
                '💾 Guardar Configuración'
              )}
            </button>
          </div>

          {selectedService === 'Caja automática' ? (
            <div className='space-y-4 sm:space-y-6'>
              <p className='text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4'>
                Configuración de sub-servicios de Caja automática:
              </p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6'>
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
                        className='bg-gray-800 p-3 sm:p-6 rounded-xl border-l-4 border-gray-600'
                      >
                        <div className='flex justify-between items-start mb-3 sm:mb-4'>
                          <h3 className='text-sm sm:text-lg font-semibold text-gray-400'>
                            {subService}
                            <span className='ml-2 px-2 py-1 bg-gray-600 text-xs rounded-full text-gray-300'>
                              SIN CONFIGURACIÓN
                            </span>
                          </h3>
                        </div>
                        <div className='text-center py-4 sm:py-8 text-gray-400 text-xs sm:text-sm'>
                          No se encontró configuración para {subService}.
                          <button
                            onClick={loadConfigs}
                            className='block mx-auto mt-2 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm'
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
          ) : selectedService === 'Mecánica general' ? (
            <div className='space-y-4 sm:space-y-6'>
              <p className='text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4'>
                Configuración de sub-servicios de Mecánica general:
              </p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6'>
                {mecanicaGeneralSubServices.map(subService => {
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
                        className='bg-gray-800 p-3 sm:p-6 rounded-xl border-l-4 border-gray-600'
                      >
                        <div className='flex justify-between items-start mb-3 sm:mb-4'>
                          <h3 className='text-sm sm:text-lg font-semibold text-gray-400'>
                            {subService}
                            <span className='ml-2 px-2 py-1 bg-gray-600 text-xs rounded-full text-gray-300'>
                              SIN CONFIGURACIÓN
                            </span>
                          </h3>
                        </div>
                        <div className='text-center py-4 sm:py-8 text-gray-400 text-xs sm:text-sm'>
                          No se encontró configuración para {subService}.
                          <button
                            onClick={loadConfigs}
                            className='block mx-auto mt-2 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm'
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
            (() => {
              const selectedConfig = configs.find(
                config => config.serviceName === selectedService
              )
              if (selectedConfig) {
                return renderServiceConfig(selectedConfig)
              } else {
                return (
                  <div className='text-center py-4 sm:py-8 text-gray-400 text-xs sm:text-sm'>
                    No se encontró configuración para {selectedService}.
                    <button
                      onClick={loadConfigs}
                      className='block mx-auto mt-2 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 cursor-pointer text-xs sm:text-sm'
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
      <div className='bg-gray-800 p-3 sm:p-6 rounded-xl mt-4 sm:mt-8'>
        <h3 className='text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4'>
          ℹ️ Información de Configuración
        </h3>
        <div className='text-gray-300 space-y-1 sm:space-y-2 text-xs sm:text-sm'>
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

        <div className='mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg'>
          <p className='text-blue-300 text-xs sm:text-sm'>
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
