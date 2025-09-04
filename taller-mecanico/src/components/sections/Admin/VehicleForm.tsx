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
    <div className='space-y-4'>
      {/* Mostrar error de validación de fechas */}
      {hasDateError && (
        <div className='p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg'>
          <div className='flex items-center gap-2'>
            <span className='text-red-400 text-lg'>⚠️</span>
            <p className='text-red-300 text-sm font-medium'>
              La fecha de ingreso no puede ser posterior a la fecha estimada de
              finalización
            </p>
          </div>
        </div>
      )}

      {/* Fechas */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-gray-300 text-sm mb-1'>
            Fecha de ingreso *
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
            className={`w-full h-9 p-2.5 bg-gray-700 border rounded-lg text-white ${
              hasDateError ? 'border-red-500' : 'border-gray-600'
            }`}
          />
        </div>
        <div>
          <label className='block text-gray-300 text-sm mb-1'>
            Fecha estimada de finalización
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
            className={`w-full h-9 p-2.5 bg-gray-700 border rounded-lg text-white ${
              hasDateError ? 'border-red-500' : 'border-gray-600'
            }`}
          />
        </div>
      </div>

      {/* Cliente y teléfono */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='Cliente *'
          value={vehicle.clientName}
          onChange={e => handleVehicleUpdate({ clientName: e.target.value })}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Teléfono'
          value={vehicle.clientPhone || ''}
          onChange={e => handleVehicleUpdate({ clientPhone: e.target.value })}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Marca y modelo */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='Marca'
          value={vehicle.brand || ''}
          onChange={e => handleVehicleUpdate({ brand: e.target.value })}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Modelo'
          value={vehicle.model || ''}
          onChange={e => handleVehicleUpdate({ model: e.target.value })}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Año y patente */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='number'
          placeholder='Año'
          value={vehicle.year || ''}
          onChange={e =>
            handleVehicleUpdate({
              year: parseInt(e.target.value) || new Date().getFullYear(),
            })
          }
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
        <input
          type='text'
          placeholder='Patente *'
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
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Chasis y KM */}
      <div className='grid grid-cols-2 gap-3'>
        <input
          type='text'
          placeholder='N° de chasis'
          value={vehicle.chassisNumber || ''}
          onChange={e => handleVehicleUpdate({ chassisNumber: e.target.value })}
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
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
          className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
        />
      </div>

      {/* Tipo de servicio */}
      <input
        type='text'
        placeholder='Tipo de servicio'
        value={vehicle.serviceType || ''}
        onChange={e => handleVehicleUpdate({ serviceType: e.target.value })}
        className='w-full h-9 p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white'
      />
    </div>
  )
}
