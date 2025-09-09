'use client'
import React, { useEffect } from 'react'
import { VehicleStep } from './VehicleList'

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
  const {
    vehicle,
    setVehicle,
    isEdit = false,
    onValidationChange,
    onPatenteChange,
  } = props

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
          formatted.slice(0, 2) +
          ' ' +
          formatted.slice(2, 5) +
          ' ' +
          formatted.slice(5, 7)
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

  const handleVehicleUpdate = (
    updates: Partial<NewVehicleData | VehicleInTracking>
  ) => {
    if (isEdit) {
      const editSetter = setVehicle as VehicleInTrackingSetter
      editSetter(
        (prev: VehicleInTracking) =>
          ({
            ...prev,
            ...updates,
          } as VehicleInTracking)
      )
    } else {
      const newSetter = setVehicle as NewVehicleSetter
      newSetter(
        (prev: NewVehicleData) =>
          ({
            ...prev,
            ...updates,
          } as NewVehicleData)
      )
    }
  }

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Mostrar error de validación de fechas */}
      {hasDateError && (
        <div className='p-2 sm:p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg'>
          <div className='flex items-center gap-2'>
            <span className='text-red-400 text-sm sm:text-lg'>⚠️</span>
            <p className='text-red-300 text-xs sm:text-sm font-medium'>
              La fecha de ingreso no puede ser posterior a la fecha estimada de
              finalización
            </p>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: Fechas importantes - PRIORIDAD EN MÓVILES */}
      <div className='bg-blue-900/20 p-2 sm:p-3 rounded-lg border border-blue-500/30'>
        <h4 className='text-blue-300 font-medium mb-2 text-xs sm:text-sm flex items-center gap-1'>
          📅 Fechas
        </h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <div>
            <label className='block text-gray-300 text-xs sm:text-sm mb-1'>
              Fecha ingreso *
            </label>
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
                const localDate = e.target.value
                  ? new Date(e.target.value + 'T12:00:00')
                  : new Date()
                handleVehicleUpdate({ [fieldName]: localDate })
              }}
              className={`w-full h-8 sm:h-9 p-2 bg-gray-700 border rounded-lg text-white text-xs sm:text-sm ${
                hasDateError ? 'border-red-500' : 'border-gray-600'
              }`}
            />
          </div>
          <div>
            <label className='text-gray-300 text-xs sm:text-sm mb-1 flex items-start'>
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
              className={`w-full h-8 sm:h-9 p-2 bg-gray-700 border rounded-lg text-white text-xs sm:text-sm ${
                hasDateError ? 'border-red-500' : 'border-gray-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Datos del cliente - IMPORTANTE EN MÓVILES */}
      <div className='bg-green-900/20 p-2 sm:p-3 rounded-lg border border-green-500/30'>
        <h4 className='text-green-300 font-medium mb-2 text-xs sm:text-sm flex items-center gap-1'>
          👤 Cliente
        </h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <input
            type='text'
            placeholder='Cliente *'
            value={vehicle.clientName}
            onChange={e => handleVehicleUpdate({ clientName: e.target.value })}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
          <input
            type='text'
            placeholder='Teléfono'
            value={vehicle.clientPhone || ''}
            onChange={e => handleVehicleUpdate({ clientPhone: e.target.value })}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
        </div>
      </div>

      {/* SECCIÓN 3: Datos del vehículo */}
      <div className='bg-purple-900/20 p-2 sm:p-3 rounded-lg border border-purple-500/30'>
        <h4 className='text-purple-300 font-medium mb-2 text-xs sm:text-sm flex items-center gap-1'>
          🚗 Vehículo
        </h4>

        {/* Patente - DESTACADA */}
        <div className='mb-2 sm:mb-3'>
          <label className='block text-gray-300 text-xs sm:text-sm mb-1'>
            Patente *
          </label>
          <input
            type='text'
            placeholder='ABC 123 o AB 123 CD'
            value={vehicle.plateNumber}
            onChange={e => {
              const formattedPlate = formatPlateNumber(e.target.value)

              handleVehicleUpdate({
                plateNumber: formattedPlate,
              })

              if (!isEdit && onPatenteChange && formattedPlate.length >= 6) {
                onPatenteChange(formattedPlate)
              }
            }}
            maxLength={9}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm font-mono'
          />
        </div>

        {/* Marca y modelo */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3'>
          <input
            type='text'
            placeholder='Marca'
            value={vehicle.brand || ''}
            onChange={e => handleVehicleUpdate({ brand: e.target.value })}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
          <input
            type='text'
            placeholder='Modelo'
            value={vehicle.model || ''}
            onChange={e => handleVehicleUpdate({ model: e.target.value })}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
        </div>

        {/* Año y KM */}
        <div className='grid grid-cols-2 gap-2 sm:gap-3'>
          <input
            type='number'
            placeholder='Año'
            value={vehicle.year || ''}
            onChange={e =>
              handleVehicleUpdate({
                year: parseInt(e.target.value) || new Date().getFullYear(),
              })
            }
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
          <input
            type='number'
            placeholder='KM'
            value={vehicle.km || ''}
            onChange={e =>
              handleVehicleUpdate({
                km: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
        </div>
      </div>

      {/* SECCIÓN 4: Información adicional - COLAPSABLE EN MÓVILES */}
      <div className='bg-gray-700/30 p-2 sm:p-3 rounded-lg border border-gray-600'>
        <h4 className='text-gray-300 font-medium mb-2 text-xs sm:text-sm flex items-center gap-1'>
          📋 Información adicional
        </h4>

        <div className='space-y-2 sm:space-y-3'>
          {/* Tipo de servicio */}
          <input
            type='text'
            placeholder='Tipo de servicio'
            value={vehicle.serviceType || ''}
            onChange={e => handleVehicleUpdate({ serviceType: e.target.value })}
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />

          {/* Número de chasis */}
          <input
            type='text'
            placeholder='N° de chasis (opcional)'
            value={vehicle.chassisNumber || ''}
            onChange={e =>
              handleVehicleUpdate({ chassisNumber: e.target.value })
            }
            className='w-full h-8 sm:h-9 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm'
          />
        </div>
      </div>

      {/* Información de ayuda - COMPACTA EN MÓVILES */}
      <div className='bg-yellow-900/20 p-2 rounded-lg border border-yellow-500/30'>
        <div className='flex items-start gap-2'>
          <span className='text-yellow-400 text-xs sm:text-sm'>💡</span>
          <div className='text-yellow-200 text-xs space-y-1'>
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
