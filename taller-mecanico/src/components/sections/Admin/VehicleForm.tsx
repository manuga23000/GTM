'use client'
import React, { useEffect } from 'react'
import { VehicleStep } from './VehicleList'
import { CalendarDays, User, Car, ClipboardList, Lightbulb, AlertTriangle } from 'lucide-react'

interface NewVehicleData {
  plateNumber: string
  brand: string
  model: string
  year: number
  clientName: string
  clientPhone: string
  serviceType: string
  chassisNumber: string
  km: number
  notes: string
  createdAt: Date
  estimatedCompletionDate: Date | null
}

interface VehicleInTracking {
  id: string
  plateNumber: string
  clientName: string
  brand?: string
  model?: string
  year?: number
  clientPhone?: string
  serviceType?: string
  chassisNumber?: string
  entryDate: Date
  estimatedCompletionDate?: Date | null
  status: 'received' | 'in-diagnosis' | 'in-repair' | 'completed' | 'delivered'
  km?: number
  steps: VehicleStep[]
  notes: string
  nextStep?: string
}

type NewVehicleSetter = (
  value: NewVehicleData | ((prev: NewVehicleData) => NewVehicleData)
) => void
type VehicleInTrackingSetter = (
  value: VehicleInTracking | ((prev: VehicleInTracking) => VehicleInTracking)
) => void

interface VehicleFormProps {
  vehicle: NewVehicleData | VehicleInTracking
  isEdit?: boolean
  onValidationChange?: (hasErrors: boolean) => void
  onPatenteChange?: (patente: string) => void
}

interface VehicleFormPropsNew extends VehicleFormProps {
  vehicle: NewVehicleData
  setVehicle: NewVehicleSetter
  isEdit?: false
  onPatenteChange?: (patente: string) => void
}

interface VehicleFormPropsEdit extends VehicleFormProps {
  vehicle: VehicleInTracking
  setVehicle: VehicleInTrackingSetter
  isEdit: true
  onPatenteChange?: (patente: string) => void
}

export default function VehicleForm(
  props: VehicleFormPropsNew | VehicleFormPropsEdit
) {
  const { vehicle, setVehicle, isEdit = false, onValidationChange, onPatenteChange } = props

  const entryDate =
    isEdit && 'entryDate' in vehicle
      ? vehicle.entryDate
      : 'createdAt' in vehicle
      ? vehicle.createdAt
      : new Date()
  const estimatedDate = vehicle.estimatedCompletionDate

  const hasDateError =
    estimatedDate && entryDate && new Date(entryDate) > new Date(estimatedDate)

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(!!hasDateError)
    }
  }, [hasDateError, onValidationChange])

  const formatPlateNumber = (value: string): string => {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (formatted.length <= 7) {
      if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(formatted)) {
        formatted =
          formatted.slice(0, 2) + ' ' + formatted.slice(2, 5) + ' ' + formatted.slice(5, 7)
      } else if (/^[A-Z]{3}\d{3}$/.test(formatted)) {
        formatted = formatted.slice(0, 3) + ' ' + formatted.slice(3, 6)
      }
    }
    return formatted
  }

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return ''
    if (typeof date === 'string') return date.slice(0, 10)
    if (date instanceof Date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  }

  const handleVehicleUpdate = (updates: Partial<NewVehicleData | VehicleInTracking>) => {
    if (isEdit) {
      const editSetter = setVehicle as VehicleInTrackingSetter
      editSetter((prev: VehicleInTracking) => ({ ...prev, ...updates } as VehicleInTracking))
    } else {
      const newSetter = setVehicle as NewVehicleSetter
      newSetter((prev: NewVehicleData) => ({ ...prev, ...updates } as NewVehicleData))
    }
  }

  const inputClass = (error?: boolean) =>
    `w-full h-8 sm:h-9 p-2 bg-zinc-900 border rounded-lg text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all ${
      error ? 'border-red-500' : 'border-zinc-700'
    }`

  return (
    <div className='space-y-3 sm:space-y-4'>
      {hasDateError && (
        <div className='p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-xl'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='text-red-400 w-4 h-4 shrink-0' strokeWidth={2} />
            <p className='text-red-300 text-xs sm:text-sm font-medium'>
              La fecha de ingreso no puede ser posterior a la fecha estimada de finalización
            </p>
          </div>
        </div>
      )}

      {/* Fechas */}
      <div className='bg-amber-500/8 p-2 sm:p-3 rounded-xl border border-amber-500/20'>
        <h4 className='text-amber-300 font-semibold mb-2 text-xs sm:text-sm flex items-center gap-1.5'>
          <CalendarDays className='w-3.5 h-3.5' strokeWidth={2} />
          Fechas
        </h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <div>
            <label className='block text-zinc-400 text-xs sm:text-sm mb-1'>Fecha ingreso *</label>
            <input
              type='date'
              value={formatDate(
                isEdit && 'entryDate' in vehicle
                  ? vehicle.entryDate
                  : 'createdAt' in vehicle
                  ? vehicle.createdAt
                  : undefined
              )}
              onChange={e => {
                const fieldName = isEdit ? 'entryDate' : 'createdAt'
                const localDate = e.target.value ? new Date(e.target.value + 'T12:00:00') : new Date()
                handleVehicleUpdate({ [fieldName]: localDate })
              }}
              className={inputClass(!!hasDateError)}
            />
          </div>
          <div>
            <label className='text-zinc-400 text-xs sm:text-sm mb-1 flex items-start'>
              Fecha estimada finalización
            </label>
            <input
              type='date'
              value={formatDate(vehicle.estimatedCompletionDate)}
              onChange={e =>
                handleVehicleUpdate({
                  estimatedCompletionDate: e.target.value
                    ? new Date(e.target.value + 'T12:00:00')
                    : null,
                })
              }
              className={inputClass(!!hasDateError)}
            />
          </div>
        </div>
      </div>

      {/* Cliente */}
      <div className='bg-zinc-800/50 p-2 sm:p-3 rounded-xl border border-zinc-700/50'>
        <h4 className='text-zinc-200 font-semibold mb-2 text-xs sm:text-sm flex items-center gap-1.5'>
          <User className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          Cliente
        </h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <input
            type='text'
            placeholder='Cliente *'
            value={vehicle.clientName}
            onChange={e => handleVehicleUpdate({ clientName: e.target.value })}
            className={inputClass()}
          />
          <input
            type='text'
            placeholder='Teléfono'
            value={vehicle.clientPhone || ''}
            onChange={e => handleVehicleUpdate({ clientPhone: e.target.value })}
            className={inputClass()}
          />
        </div>
      </div>

      {/* Vehículo */}
      <div className='bg-zinc-800/50 p-2 sm:p-3 rounded-xl border border-zinc-700/50'>
        <h4 className='text-zinc-200 font-semibold mb-2 text-xs sm:text-sm flex items-center gap-1.5'>
          <Car className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          Vehículo
        </h4>

        <div className='mb-2 sm:mb-3'>
          <label className='block text-zinc-400 text-xs sm:text-sm mb-1'>Patente *</label>
          <input
            type='text'
            placeholder='ABC 123 o AB 123 CD'
            value={vehicle.plateNumber}
            onChange={e => {
              const formattedPlate = formatPlateNumber(e.target.value)
              handleVehicleUpdate({ plateNumber: formattedPlate })
              if (!isEdit && onPatenteChange && formattedPlate.length >= 6) {
                onPatenteChange(formattedPlate)
              }
            }}
            maxLength={9}
            className={`${inputClass()} font-mono`}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3'>
          <input
            type='text'
            placeholder='Marca'
            value={vehicle.brand || ''}
            onChange={e => handleVehicleUpdate({ brand: e.target.value })}
            className={inputClass()}
          />
          <input
            type='text'
            placeholder='Modelo'
            value={vehicle.model || ''}
            onChange={e => handleVehicleUpdate({ model: e.target.value })}
            className={inputClass()}
          />
        </div>

        <div className='grid grid-cols-2 gap-2 sm:gap-3'>
          <input
            type='number'
            placeholder='Año'
            value={vehicle.year || ''}
            onChange={e =>
              handleVehicleUpdate({ year: parseInt(e.target.value) || new Date().getFullYear() })
            }
            className={inputClass()}
          />
          <input
            type='number'
            placeholder='KM'
            value={vehicle.km || ''}
            onChange={e => handleVehicleUpdate({ km: parseFloat(e.target.value) || 0 })}
            className={inputClass()}
          />
        </div>
      </div>

      {/* Info adicional */}
      <div className='bg-zinc-800/50 p-2 sm:p-3 rounded-xl border border-zinc-700/50'>
        <h4 className='text-zinc-200 font-semibold mb-2 text-xs sm:text-sm flex items-center gap-1.5'>
          <ClipboardList className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          Información adicional
        </h4>
        <div className='space-y-2 sm:space-y-3'>
          <input
            type='text'
            placeholder='Tipo de servicio'
            value={vehicle.serviceType || ''}
            onChange={e => handleVehicleUpdate({ serviceType: e.target.value })}
            className={inputClass()}
          />
          <input
            type='text'
            placeholder='N° de chasis (opcional)'
            value={vehicle.chassisNumber || ''}
            onChange={e => handleVehicleUpdate({ chassisNumber: e.target.value })}
            className={inputClass()}
          />
        </div>
      </div>

      {/* Tip */}
      <div className='bg-amber-500/8 p-2 rounded-xl border border-amber-500/20'>
        <div className='flex items-start gap-2'>
          <Lightbulb className='text-amber-400 w-3.5 h-3.5 mt-0.5 shrink-0' strokeWidth={2} />
          <div className='text-amber-200 text-xs space-y-1'>
            <p>• Los campos marcados con * son obligatorios</p>
            <p>• La patente se formatea automáticamente</p>
            <p className='hidden sm:block'>
              • Los datos del historial se cargan automáticamente si existen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
