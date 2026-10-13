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
import {
  Search,
  ClipboardList,
  Settings2,
  Cog,
  Wrench,
  PalmtreeIcon,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
} from 'lucide-react'

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

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Diagnóstico':        <Search       className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={1.8} />,
  'Revisación técnica': <ClipboardList className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={1.8} />,
  'Otro':               <Settings2    className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={1.8} />,
  'Caja automática':    <Cog          className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={1.8} />,
  'Mecánica general':   <Wrench       className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={1.8} />,
}

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
      if (vacationConfig) setVacationModeState(vacationConfig.enabled)
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
        const existingIndex = acc.findIndex(c => c.serviceName === config.serviceName)
        if (existingIndex === -1) {
          acc.push(config)
        } else {
          const existing = acc[existingIndex]
          if (config.updatedAt > existing.updatedAt) acc[existingIndex] = config
        }
        return acc
      }, [] as ServiceConfig[])

      setConfigs(uniqueConfigs)
      if (!selectedService && uniqueConfigs.length > 0) {
        const firstAvailableService = uniqueConfigs.find(config => availableServices.includes(config.serviceName))
        if (firstAvailableService) setSelectedService(firstAvailableService.serviceName)
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
        config.serviceName === serviceName ? { ...config, [field]: value } : config
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
          const allDays = [1, 2, 3, 4, 5]
          const newDays = config.allowedDays.length === allDays.length ? [] : allDays
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
        const subServiceConfigs = configs.filter(config => cajaAutomaticaSubServices.includes(config.serviceName))
        for (const configToSave of subServiceConfigs) {
          const result = await updateServiceConfig(configToSave.serviceName, {
            maxPerDay: configToSave.maxPerDay,
            maxPerWeek: configToSave.maxPerWeek,
            requiresDate: configToSave.requiresDate,
            allowedDays: configToSave.allowedDays,
            isActive: configToSave.isActive,
            serviceName: configToSave.serviceName,
          })
          if (!result.success) throw new Error(`Error guardando ${configToSave.serviceName}: ${result.message}`)
        }
        setMessage('✅ Configuraciones de Caja automática guardadas exitosamente')
      } else if (selectedService === 'Mecánica general') {
        const subServiceConfigs = configs.filter(config => mecanicaGeneralSubServices.includes(config.serviceName))
        for (const configToSave of subServiceConfigs) {
          const result = await updateServiceConfig(configToSave.serviceName, {
            maxPerDay: configToSave.maxPerDay,
            maxPerWeek: configToSave.maxPerWeek,
            requiresDate: configToSave.requiresDate,
            allowedDays: configToSave.allowedDays,
            isActive: configToSave.isActive,
            serviceName: configToSave.serviceName,
          })
          if (!result.success) throw new Error(`Error guardando ${configToSave.serviceName}: ${result.message}`)
        }
        setMessage('✅ Configuraciones de Mecánica general guardadas exitosamente')
      } else {
        const configToSave = configs.find(config => config.serviceName === selectedService)
        if (!configToSave) throw new Error(`No se encontró configuración para ${selectedService}`)
        const result = await updateServiceConfig(selectedService, {
          maxPerDay: configToSave.maxPerDay,
          maxPerWeek: configToSave.maxPerWeek,
          requiresDate: configToSave.requiresDate,
          allowedDays: configToSave.allowedDays,
          isActive: configToSave.isActive,
          serviceName: configToSave.serviceName,
        })
        if (!result.success) throw new Error(result.message)
        setMessage(`✅ Configuración de ${selectedService} guardada exitosamente`)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error: unknown) {
      console.error('❌ Error guardando configuración:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setMessage(`❌ Error: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const isSuccess = message.includes('✅')

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
        className={`bg-zinc-900/70 border p-3 sm:p-5 rounded-xl border-l-4 ${
          isActiveService ? 'border-l-amber-500 border-zinc-800' : 'border-l-zinc-700 border-zinc-800'
        } ${
          selectedService === 'Caja automática' || selectedService === 'Mecánica general' ? 'mb-0' : 'mb-3 sm:mb-4'
        }`}
      >
        <h3 className={`text-sm sm:text-base font-semibold mb-3 ${isActiveService ? 'text-white' : 'text-zinc-500'}`}>
          {config.serviceName}
        </h3>

        <div className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-zinc-400 mb-1.5'>Máximo por día</label>
              <input
                type='number'
                min='0'
                value={config.maxPerDay || ''}
                onChange={e => updateConfig(config.serviceName, 'maxPerDay', e.target.value ? parseInt(e.target.value) : null)}
                disabled={!isActiveService}
                className={`w-full px-3 py-2 rounded-lg border text-white text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  isActiveService
                    ? 'bg-zinc-800 border-zinc-700 focus:ring-amber-500/40 focus:border-amber-500/40 cursor-text'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
                placeholder='Sin límite'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-zinc-400 mb-1.5'>Máximo por semana</label>
              <input
                type='number'
                min='0'
                value={config.maxPerWeek || ''}
                onChange={e => updateConfig(config.serviceName, 'maxPerWeek', e.target.value ? parseInt(e.target.value) : null)}
                disabled={!isActiveService}
                className={`w-full px-3 py-2 rounded-lg border text-white text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  isActiveService
                    ? 'bg-zinc-800 border-zinc-700 focus:ring-amber-500/40 focus:border-amber-500/40 cursor-text'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
                placeholder='Sin límite'
              />
            </div>
          </div>

          {/* Days */}
          <div>
            <label className='block text-xs font-medium text-zinc-400 mb-1.5'>Días permitidos</label>
            <div className='flex justify-between items-center gap-2'>
              <div className='flex flex-wrap gap-1.5'>
                {/* Mobile */}
                <div className='flex gap-1.5 sm:hidden'>
                  {DAYS_MOBILE.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(config.serviceName, day.value)}
                      disabled={!isActiveService}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all min-w-[30px] ${
                        isActiveService
                          ? config.allowedDays.includes(day.value)
                            ? 'bg-amber-500 text-zinc-900 shadow-sm cursor-pointer'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 cursor-pointer'
                          : config.allowedDays.includes(day.value)
                          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {/* Desktop */}
                <div className='hidden sm:flex gap-1.5'>
                  {DAYS_DESKTOP.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(config.serviceName, day.value)}
                      disabled={!isActiveService}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActiveService
                          ? config.allowedDays.includes(day.value)
                            ? 'bg-amber-500 text-zinc-900 shadow-sm cursor-pointer'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 cursor-pointer'
                          : config.allowedDays.includes(day.value)
                          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Toggle all */}
              <button
                onClick={() => toggleAllDays(config.serviceName)}
                disabled={!isActiveService}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ml-1 ${
                  isActiveService
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 cursor-pointer'
                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {config.allowedDays.length === 5 ? (
                  <XCircle className='w-3.5 h-3.5' strokeWidth={2} />
                ) : (
                  <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {isActiveService && (
            <div className='bg-amber-500/8 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2'>
              <Lightbulb className='w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5' strokeWidth={2} />
              <p className='text-amber-200/80 text-xs'>
                Esta configuración se aplica inmediatamente al sistema de turnos.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-32 sm:h-64 gap-4'>
        <div className='relative w-9 h-9'>
          <div className='absolute inset-0 border-2 border-zinc-800 rounded-full' />
          <div className='absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin' />
        </div>
        <span className='text-zinc-400 text-sm'>Cargando configuraciones…</span>
      </div>
    )
  }

  return (
    <div className='space-y-4 sm:space-y-5'>

      {/* ── Header ── */}
      <div>
        <div className='flex items-center gap-2 mb-1'>
          <div className='w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center'>
            <Settings2 className='w-3.5 h-3.5 text-amber-400' strokeWidth={2.2} />
          </div>
          <h2 className='text-base sm:text-xl font-bold text-white'>Configuración de Servicios</h2>
        </div>
        <p className='text-zinc-500 text-xs sm:text-sm ml-8'>Gestiona la disponibilidad y límites de cada servicio</p>
      </div>

      {/* ── Message ── */}
      {message && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2.5 border ${
          isSuccess
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
            : 'bg-red-500/10 border-red-500/25 text-red-300'
        }`}>
          {isSuccess
            ? <CheckCircle2 className='w-4 h-4 shrink-0' strokeWidth={2} />
            : <XCircle      className='w-4 h-4 shrink-0' strokeWidth={2} />
          }
          {message.replace('✅ ', '').replace('❌ ', '')}
        </div>
      )}

      {/* ── Vacation mode ── */}
      <div className='bg-zinc-900/70 border border-amber-500/25 rounded-2xl p-4 sm:p-5 overflow-hidden relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-amber-500/8 to-orange-500/5 pointer-events-none' />
        <div className='relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <div className='p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20 shrink-0'>
              <Wrench className='w-5 h-5 text-amber-400' strokeWidth={1.8} />
            </div>
            <div>
              <h3 className='text-base font-bold text-amber-400 mb-1'>Modo Vacaciones</h3>
              <p className='text-zinc-400 text-xs sm:text-sm'>
                {vacationMode ? (
                  <>
                    <span className='text-amber-300 font-semibold'>ACTIVO:</span> Bloqueando turnos del{' '}
                    <span className='text-white font-medium'>31 de enero</span> al{' '}
                    <span className='text-white font-medium'>10 de febrero</span>
                  </>
                ) : (
                  'Desactivado. Los clientes pueden sacar turnos normalmente.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleVacationMode}
            disabled={vacationLoading}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 min-w-[130px] border disabled:opacity-50 disabled:cursor-not-allowed ${
              vacationMode
                ? 'bg-red-600/80 hover:bg-red-500 text-white border-red-500/30'
                : 'bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-500/30'
            }`}
          >
            {vacationLoading ? (
              <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            ) : vacationMode ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {/* ── Service selector ── */}
      <div className='bg-zinc-900/70 border border-zinc-800 p-4 sm:p-5 rounded-2xl'>
        <h3 className='text-sm font-semibold text-zinc-400 mb-3'>Selecciona un servicio para configurar</h3>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3'>
          {availableServices.map(service => {
            const isSelected = selectedService === service
            return (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-900/20'
                    : 'border-zinc-700/80 bg-zinc-800/50 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className='flex flex-col items-center gap-2'>
                  <div className={`${isSelected ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {SERVICE_ICONS[service]}
                  </div>
                  <div className='font-semibold text-xs text-center leading-tight'>{service}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Selected service config ── */}
      {selectedService && (
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-zinc-800 pb-3 gap-3'>
            <h3 className='text-sm sm:text-base font-semibold text-white'>
              Configuración: <span className='text-amber-400'>{selectedService}</span>
            </h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className='flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-zinc-900 disabled:text-zinc-400 font-bold rounded-xl transition-all duration-200 cursor-pointer text-sm border border-amber-400/30 disabled:border-zinc-600 shadow-sm shadow-amber-900/30'
            >
              {saving ? (
                <span className='w-3.5 h-3.5 border-2 border-zinc-600/30 border-t-zinc-600 rounded-full animate-spin' />
              ) : (
                <Save className='w-3.5 h-3.5' strokeWidth={2.2} />
              )}
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

          {selectedService === 'Caja automática' ? (
            <div className='space-y-3'>
              <p className='text-zinc-400 text-xs mb-2'>Sub-servicios de Caja automática:</p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                {cajaAutomaticaSubServices.map(subService => {
                  const subConfig = configs.find(c => c.serviceName === subService)
                  return subConfig ? (
                    <div key={subService}>{renderServiceConfig(subConfig)}</div>
                  ) : (
                    <div key={subService} className='bg-zinc-900/70 border border-zinc-800 border-l-4 border-l-zinc-700 p-4 rounded-xl'>
                      <h3 className='text-sm font-semibold text-zinc-500 mb-3'>{subService}
                        <span className='ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full text-zinc-400'>SIN CONFIG</span>
                      </h3>
                      <div className='text-center py-4 text-zinc-500 text-xs'>
                        No se encontró configuración.
                        <button onClick={loadConfigs} className='flex items-center gap-1.5 mx-auto mt-3 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-lg text-xs border border-amber-500/25 transition-colors cursor-pointer'>
                          <RefreshCw className='w-3 h-3' strokeWidth={2} /> Recargar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : selectedService === 'Mecánica general' ? (
            <div className='space-y-3'>
              <p className='text-zinc-400 text-xs mb-2'>Sub-servicios de Mecánica general:</p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                {mecanicaGeneralSubServices.map(subService => {
                  const subConfig = configs.find(c => c.serviceName === subService)
                  return subConfig ? (
                    <div key={subService}>{renderServiceConfig(subConfig)}</div>
                  ) : (
                    <div key={subService} className='bg-zinc-900/70 border border-zinc-800 border-l-4 border-l-zinc-700 p-4 rounded-xl'>
                      <h3 className='text-sm font-semibold text-zinc-500 mb-3'>{subService}
                        <span className='ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full text-zinc-400'>SIN CONFIG</span>
                      </h3>
                      <div className='text-center py-4 text-zinc-500 text-xs'>
                        No se encontró configuración.
                        <button onClick={loadConfigs} className='flex items-center gap-1.5 mx-auto mt-3 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-lg text-xs border border-amber-500/25 transition-colors cursor-pointer'>
                          <RefreshCw className='w-3 h-3' strokeWidth={2} /> Recargar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            (() => {
              const selectedConfig = configs.find(config => config.serviceName === selectedService)
              if (selectedConfig) return renderServiceConfig(selectedConfig)
              return (
                <div className='text-center py-8 text-zinc-500 text-xs'>
                  No se encontró configuración para {selectedService}.
                  <button onClick={loadConfigs} className='flex items-center gap-1.5 mx-auto mt-3 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-lg text-xs border border-amber-500/25 transition-colors cursor-pointer'>
                    <RefreshCw className='w-3 h-3' strokeWidth={2} /> Recargar
                  </button>
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* ── Info box ── */}
      <div className='bg-zinc-900/70 border border-zinc-800 p-4 sm:p-5 rounded-2xl'>
        <div className='flex items-center gap-2 mb-3'>
          <Info className='w-4 h-4 text-zinc-500' strokeWidth={2} />
          <h3 className='text-sm font-semibold text-zinc-400'>Información de Configuración</h3>
        </div>
        <div className='text-zinc-500 space-y-1.5 text-xs sm:text-sm'>
          <p>• <span className='text-zinc-300 font-medium'>Máximo por día:</span> Número máximo de turnos que se pueden agendar por día.</p>
          <p>• <span className='text-zinc-300 font-medium'>Máximo por semana:</span> Número máximo de turnos que se pueden agendar por semana.</p>
          <p>• <span className='text-zinc-300 font-medium'>Días permitidos:</span> Días de la semana en los que se puede agendar el servicio.</p>
        </div>
        <div className='mt-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl'>
          <div className='flex items-start gap-2'>
            <Lightbulb className='w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5' strokeWidth={2} />
            <p className='text-amber-200/70 text-xs'>
              Si configurás AMBOS límites, el sistema verificará que se cumplan las dos condiciones simultáneamente.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
