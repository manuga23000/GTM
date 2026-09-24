'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Cog,
  Droplets,
  Filter,
  Camera,
  X,
  Loader2,
} from 'lucide-react'
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  validateFileType,
  validateFileSize,
} from '@/lib/storageUtils'
import type {
  ServiceData,
  ServiceDataCaja,
  ServiceDataMotor,
} from '@/actions/types/types'

interface ServiceDataFormProps {
  serviceType?: string
  formType?: 'motor' | 'caja'
  serviceData?: ServiceData
  onChange: (data: ServiceData) => void
  plateNumber: string
}

const DEFAULT_CAJA: ServiceDataCaja = {
  type: 'caja',
  aceite: { marca: '', tipo: '' },
  filtro: false,
  cartucho: false,
}

const DEFAULT_MOTOR: ServiceDataMotor = {
  type: 'motor',
  aceite: { marca: '', tipo: '' },
  filtros: {
    aceite: false,
    aire: false,
    combustible: false,
    habitaculo: false,
  },
}

function isServicioCaja(serviceType: string): boolean {
  const lower = serviceType.toLowerCase()
  return (
    lower.includes('caja') ||
    lower.includes('transmisi') ||
    lower.includes('automatica') ||
    lower.includes('automática')
  )
}

function isServicioMotor(serviceType: string): boolean {
  const lower = serviceType.toLowerCase()
  return lower.includes('motor') || lower.includes('servicio de motor')
}

function isPartMotor(part: string): boolean {
  const lower = part.trim().toLowerCase()
  return lower.includes('motor') || lower.includes('servicio de motor')
}

function isPartCaja(part: string): boolean {
  const lower = part.trim().toLowerCase()
  return (
    lower.includes('caja') ||
    lower.includes('transmisi') ||
    lower.includes('automatica') ||
    lower.includes('automática')
  )
}

export function getDetectedServiceType(
  serviceType: string
): 'caja' | 'motor' | null {
  if (isServicioCaja(serviceType)) return 'caja'
  if (isServicioMotor(serviceType)) return 'motor'
  return null
}

export function getDetectedServiceTypes(
  serviceType: string
): { motor: boolean; caja: boolean } {
  return {
    motor: isServicioMotor(serviceType),
    caja: isServicioCaja(serviceType),
  }
}

export function getReparacionesTitulo(serviceType: string): string {
  const parts = serviceType.split(/\s+y\s+/i)
  const repairParts = parts.filter(p => !isPartMotor(p) && !isPartCaja(p))
  if (repairParts.length > 0) return repairParts.map(p => p.trim()).join(' y ')
  return serviceType
}

export function getServiceTitulo(serviceType: string, type: 'motor' | 'caja'): string {
  const parts = serviceType.split(/\s+y\s+/i)
  const check = type === 'motor' ? isPartMotor : isPartCaja
  const matched = parts.filter(p => check(p))
  if (matched.length > 0) return matched.map(p => p.trim()).join(' y ')
  return type === 'motor' ? 'Servicio de Motor' : 'Servicio de Caja'
}

const inputClass =
  'w-full h-8 sm:h-9 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all'

const toggleClass = (active: boolean) =>
  `relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
    active ? 'bg-amber-500' : 'bg-zinc-700'
  }`

const toggleDot = (active: boolean) =>
  `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
    active ? 'translate-x-5' : ''
  }`

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
}) {
  return (
    <label className='flex items-center justify-between gap-3 cursor-pointer'>
      <span className='text-zinc-300 text-xs sm:text-sm'>{label}</span>
      <div
        className={toggleClass(checked)}
        onClick={() => onChange(!checked)}
      >
        <div className={toggleDot(checked)} />
      </div>
    </label>
  )
}

function PhotoUpload({
  currentUrl,
  onUpload,
  onRemove,
  plateNumber,
  label,
  storagePath,
}: {
  currentUrl?: string
  onUpload: (url: string) => void
  onRemove: () => void
  plateNumber: string
  label: string
  storagePath: string
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateFileType(file)) {
      alert('Tipo de archivo no permitido')
      return
    }
    if (!validateFileSize(file, 10)) {
      alert('Archivo muy grande (máx 10MB)')
      return
    }

    setUploading(true)
    try {
      const cleanPlate = plateNumber.replace(/\s+/g, '').toLowerCase()
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `vehicles/${cleanPlate}/service/${storagePath}_${Date.now()}.${ext}`
      const result = await uploadFileToStorage(file, path)
      onUpload(result.url)
    } catch (err) {
      console.error('Error uploading photo:', err)
      alert('Error al subir la foto')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (currentUrl) {
      try {
        await deleteFileFromStorage(currentUrl)
      } catch (err) {
        console.error('Error deleting photo:', err)
      }
    }
    onRemove()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
      />

      {currentUrl ? (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPreview(true)}
            className='relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-600 hover:border-amber-500/50 transition-colors cursor-pointer'
          >
            <Image src={currentUrl} alt={label} fill className='object-cover' />
          </button>
          <button
            type='button'
            onClick={handleRemove}
            className='p-1.5 text-zinc-500 hover:text-red-400 transition-colors'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className='flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all text-xs disabled:opacity-50'
        >
          {uploading ? (
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
          ) : (
            <Camera className='w-3.5 h-3.5' />
          )}
          Foto
        </button>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {preview && currentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4'
            onClick={() => setPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className='relative max-w-lg max-h-[80vh] w-full'
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreview(false)}
                className='absolute -top-3 -right-3 z-10 w-8 h-8 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center text-white hover:bg-zinc-700'
              >
                <X className='w-4 h-4' />
              </button>
              <Image
                src={currentUrl}
                alt={label}
                width={800}
                height={600}
                className='w-full h-auto rounded-xl object-contain max-h-[80vh]'
              />
              <p className='text-zinc-400 text-xs text-center mt-2'>{label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function VehiclePhotoUpload({
  fotoUrl,
  onChange,
  plateNumber,
}: {
  fotoUrl?: string
  onChange: (url?: string) => void
  plateNumber: string
}) {
  return (
    <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50 mb-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Camera className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          <span className='text-zinc-300 font-medium text-xs sm:text-sm'>
            Foto del Vehículo
          </span>
        </div>
        <PhotoUpload
          currentUrl={fotoUrl}
          onUpload={url => onChange(url)}
          onRemove={() => onChange(undefined)}
          plateNumber={plateNumber}
          label='Foto del vehículo'
          storagePath='vehiculo'
        />
      </div>
    </div>
  )
}

function CajaForm({
  data,
  onChange,
  plateNumber,
}: {
  data: ServiceDataCaja
  onChange: (data: ServiceDataCaja) => void
  plateNumber: string
}) {
  return (
    <div className='space-y-3'>
      {/* Aceite */}
      <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Droplets className='w-3.5 h-3.5 text-blue-400' strokeWidth={2} />
            <span className='text-zinc-300 font-medium text-xs sm:text-sm'>
              Aceite de Caja
            </span>
          </div>
          <PhotoUpload
            currentUrl={data.aceite.fotoUrl}
            onUpload={url => onChange({ ...data, aceite: { ...data.aceite, fotoUrl: url } })}
            onRemove={() => onChange({ ...data, aceite: { ...data.aceite, fotoUrl: undefined } })}
            plateNumber={plateNumber}
            label='Foto del aceite'
            storagePath='aceite_caja'
          />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          <div>
            <label className='block text-zinc-500 text-xs mb-1'>Marca</label>
            <input
              type='text'
              placeholder='Ej: Mobil, Shell, Valvoline...'
              value={data.aceite.marca}
              onChange={e =>
                onChange({
                  ...data,
                  aceite: { ...data.aceite, marca: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className='block text-zinc-500 text-xs mb-1'>Tipo</label>
            <input
              type='text'
              placeholder='Ej: ATF+4, Dexron VI, CVT...'
              value={data.aceite.tipo}
              onChange={e =>
                onChange({
                  ...data,
                  aceite: { ...data.aceite, tipo: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50'>
        <div className='flex items-center gap-2 mb-3'>
          <Filter className='w-3.5 h-3.5 text-orange-400' strokeWidth={2} />
          <span className='text-zinc-300 font-medium text-xs sm:text-sm'>
            Filtros
          </span>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Toggle
              label='Filtro de caja'
              checked={data.filtro}
              onChange={val => onChange({ ...data, filtro: val })}
            />
            {data.filtro && (
              <PhotoUpload
                currentUrl={data.filtroFotoUrl}
                onUpload={url => onChange({ ...data, filtroFotoUrl: url })}
                onRemove={() => onChange({ ...data, filtroFotoUrl: undefined })}
                plateNumber={plateNumber}
                label='Foto del filtro'
                storagePath='filtro_caja'
              />
            )}
          </div>
          <div className='flex items-center justify-between'>
            <Toggle
              label='Cartucho'
              checked={data.cartucho}
              onChange={val => onChange({ ...data, cartucho: val })}
            />
            {data.cartucho && (
              <PhotoUpload
                currentUrl={data.cartuchoFotoUrl}
                onUpload={url => onChange({ ...data, cartuchoFotoUrl: url })}
                onRemove={() => onChange({ ...data, cartuchoFotoUrl: undefined })}
                plateNumber={plateNumber}
                label='Foto del cartucho'
                storagePath='cartucho_caja'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MotorForm({
  data,
  onChange,
  plateNumber,
}: {
  data: ServiceDataMotor
  onChange: (data: ServiceDataMotor) => void
  plateNumber: string
}) {
  const filtroKeys = ['aceite', 'aire', 'combustible', 'habitaculo'] as const
  const filtroLabels: Record<string, string> = {
    aceite: 'Filtro de aceite',
    aire: 'Filtro de aire',
    combustible: 'Filtro de combustible',
    habitaculo: 'Filtro de habitáculo',
  }

  return (
    <div className='space-y-3'>

      {/* Aceite */}
      <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Droplets className='w-3.5 h-3.5 text-blue-400' strokeWidth={2} />
            <span className='text-zinc-300 font-medium text-xs sm:text-sm'>
              Aceite de Motor
            </span>
          </div>
          <PhotoUpload
            currentUrl={data.aceite.fotoUrl}
            onUpload={url => onChange({ ...data, aceite: { ...data.aceite, fotoUrl: url } })}
            onRemove={() => onChange({ ...data, aceite: { ...data.aceite, fotoUrl: undefined } })}
            plateNumber={plateNumber}
            label='Foto del aceite'
            storagePath='aceite_motor'
          />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          <div>
            <label className='block text-zinc-500 text-xs mb-1'>Marca</label>
            <input
              type='text'
              placeholder='Ej: Mobil, Castrol, Shell...'
              value={data.aceite.marca}
              onChange={e =>
                onChange({
                  ...data,
                  aceite: { ...data.aceite, marca: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className='block text-zinc-500 text-xs mb-1'>Tipo</label>
            <input
              type='text'
              placeholder='Ej: 5W-30, 10W-40, 0W-20...'
              value={data.aceite.tipo}
              onChange={e =>
                onChange({
                  ...data,
                  aceite: { ...data.aceite, tipo: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50'>
        <div className='flex items-center gap-2 mb-3'>
          <Filter className='w-3.5 h-3.5 text-orange-400' strokeWidth={2} />
          <span className='text-zinc-300 font-medium text-xs sm:text-sm'>
            Filtros Reemplazados
          </span>
        </div>
        <div className='space-y-3'>
          {filtroKeys.map(key => (
            <div key={key} className='flex items-center justify-between'>
              <Toggle
                label={filtroLabels[key]}
                checked={data.filtros[key]}
                onChange={val =>
                  onChange({
                    ...data,
                    filtros: { ...data.filtros, [key]: val },
                  })
                }
              />
              {data.filtros[key] && (
                <PhotoUpload
                  currentUrl={data.filtrosFotos?.[key]}
                  onUpload={url =>
                    onChange({
                      ...data,
                      filtrosFotos: { ...data.filtrosFotos, [key]: url },
                    })
                  }
                  onRemove={() =>
                    onChange({
                      ...data,
                      filtrosFotos: { ...data.filtrosFotos, [key]: undefined },
                    })
                  }
                  plateNumber={plateNumber}
                  label={`Foto ${filtroLabels[key]}`}
                  storagePath={`filtro_${key}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ServiceDataForm({
  serviceType,
  formType,
  serviceData,
  onChange,
  plateNumber,
}: ServiceDataFormProps) {
  const detectedType = formType || (serviceType ? getDetectedServiceType(serviceType) : null)

  if (!detectedType) return null

  const currentData =
    serviceData && serviceData.type === detectedType
      ? serviceData
      : detectedType === 'caja'
        ? DEFAULT_CAJA
        : DEFAULT_MOTOR

  const icon =
    detectedType === 'caja' ? (
      <Cog className='w-4 h-4 text-amber-400' strokeWidth={2} />
    ) : (
      <Cog className='w-4 h-4 text-amber-400' strokeWidth={2} />
    )

  const title =
    detectedType === 'caja'
      ? 'Datos del Servicio de Caja'
      : 'Datos del Servicio de Motor'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className='bg-amber-500/8 p-3 sm:p-4 rounded-xl border border-amber-500/20'
    >
      <div className='flex items-center gap-2 mb-3'>
        {icon}
        <h4 className='text-amber-300 font-semibold text-xs sm:text-sm'>
          {title}
        </h4>
      </div>

      {detectedType === 'caja' ? (
        <CajaForm
          data={currentData as ServiceDataCaja}
          onChange={onChange}
          plateNumber={plateNumber}
        />
      ) : (
        <MotorForm
          data={currentData as ServiceDataMotor}
          onChange={onChange}
          plateNumber={plateNumber}
        />
      )}
    </motion.div>
  )
}

export function ServiceDataDisplay({
  serviceData,
}: {
  serviceData: ServiceData
}) {
  if (!serviceData) return null

  if (serviceData.type === 'caja') {
    const data = serviceData as ServiceDataCaja
    const hasAceite = data.aceite.marca || data.aceite.tipo
    const filtrosActivos: string[] = []
    if (data.filtro) filtrosActivos.push('Filtro')
    if (data.cartucho) filtrosActivos.push('Cartucho')
    if (!hasAceite && filtrosActivos.length === 0) return null

    return (
      <div className='bg-amber-500/8 border border-amber-500/20 p-3 sm:p-4 rounded-xl'>
        <div className='flex items-center gap-2 mb-3'>
          <Cog className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          <h5 className='text-amber-400/90 font-semibold text-xs'>
            Servicio de Caja
          </h5>
        </div>
        <div className='space-y-2'>
          {hasAceite && (
            <div className='bg-zinc-900/50 p-2.5 rounded-lg'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Droplets className='w-3 h-3 text-blue-400' strokeWidth={2} />
                <span className='text-zinc-500 text-xs'>Aceite</span>
              </div>
              <span className='text-white font-medium text-xs sm:text-sm'>
                {[data.aceite.marca, data.aceite.tipo]
                  .filter(Boolean)
                  .join(' - ') || 'No especificado'}
              </span>
            </div>
          )}
          {filtrosActivos.length > 0 && (
            <div className='bg-zinc-900/50 p-2.5 rounded-lg'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Filter className='w-3 h-3 text-orange-400' strokeWidth={2} />
                <span className='text-zinc-500 text-xs'>Filtros cambiados</span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {filtrosActivos.map(f => (
                  <span key={f} className='px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-xs border border-emerald-500/25'>
                    {f} ✓
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (serviceData.type === 'motor') {
    const data = serviceData as ServiceDataMotor
    const hasAceite = data.aceite.marca || data.aceite.tipo
    const filtroLabels: Record<string, string> = {
      aceite: 'Aceite',
      aire: 'Aire',
      combustible: 'Combustible',
      habitaculo: 'Habitáculo',
    }
    const filtrosActivos = Object.entries(data.filtros)
      .filter(([, v]) => v)
      .map(([key]) => ({ key, label: filtroLabels[key] || key }))
    if (!hasAceite && filtrosActivos.length === 0) return null

    return (
      <div className='bg-amber-500/8 border border-amber-500/20 p-3 sm:p-4 rounded-xl'>
        <div className='flex items-center gap-2 mb-3'>
          <Cog className='w-3.5 h-3.5 text-amber-400' strokeWidth={2} />
          <h5 className='text-amber-400/90 font-semibold text-xs'>
            Servicio de Motor
          </h5>
        </div>
        <div className='space-y-2'>
          {hasAceite && (
            <div className='bg-zinc-900/50 p-2.5 rounded-lg'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Droplets className='w-3 h-3 text-blue-400' strokeWidth={2} />
                <span className='text-zinc-500 text-xs'>Aceite</span>
              </div>
              <span className='text-white font-medium text-xs sm:text-sm'>
                {[data.aceite.marca, data.aceite.tipo]
                  .filter(Boolean)
                  .join(' - ') || 'No especificado'}
              </span>
            </div>
          )}
          {filtrosActivos.length > 0 && (
            <div className='bg-zinc-900/50 p-2.5 rounded-lg'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Filter className='w-3 h-3 text-orange-400' strokeWidth={2} />
                <span className='text-zinc-500 text-xs'>Filtros cambiados</span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {filtrosActivos.map(f => (
                  <span key={f.key} className='px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-xs border border-emerald-500/25'>
                    {f.label} ✓
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
