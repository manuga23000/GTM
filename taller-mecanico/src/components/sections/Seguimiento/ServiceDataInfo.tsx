'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  FaOilCan,
  FaFilter,
  FaCheck,
  FaTachometerAlt,
  FaCalendarAlt,
  FaArrowRight,
  FaCar,
  FaUser,
  FaTimes,
  FaSearchPlus,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaDownload,
} from 'react-icons/fa'
import SpaceBackground from './SpaceBackground'
import type {
  ServiceData,
  ServiceDataCaja,
  ServiceDataMotor,
} from '@/actions/types/types'

interface VehicleInfo {
  patente: string
  marca: string
  modelo: string
  año: string
  cliente: string
  fechaIngreso: string
  fotoVehiculo?: string
}

interface ServiceDataInfoProps {
  serviceData: ServiceData
  tipoServicio?: string
  fechaEstimadaEntrega?: string
  proximoPaso?: string
  updatedAt?: string
  km?: number
  vehiculo?: VehicleInfo
  compact?: boolean
}

const formatearFecha = (fecha: string) => {
  if (!fecha || isNaN(new Date(fecha).getTime())) return null
  return new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatearFechaCorta = (fecha: string) => {
  if (!fecha) return null
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function GlowLine({ color }: { color: 'orange' | 'blue' }) {
  const gradient =
    color === 'orange'
      ? 'from-transparent via-orange-500 to-transparent'
      : 'from-transparent via-blue-500 to-transparent'
  const shadow =
    color === 'orange'
      ? '0 0 20px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.2)'
      : '0 0 20px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2)'
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className={`h-[2px] bg-gradient-to-r ${gradient}`}
      style={{ boxShadow: shadow }}
    />
  )
}

// ─── PhotoLightbox ──────────────────────────────────────────

function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: {
  photos: { url: string; label: string }[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1)
        onNavigate(currentIndex + 1)
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [currentIndex, photos.length, onClose, onNavigate])

  const photo = photos[currentIndex]
  if (!photo) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${photo.label.replace(/\s+/g, '_')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      window.open(photo.url, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex items-center justify-center'
      onClick={onClose}
      role='dialog'
      aria-label='Visor de foto'
    >
      <div className='absolute top-4 right-4 z-10 flex items-center gap-2'>
        <button
          onClick={e => { e.stopPropagation(); handleDownload() }}
          className='w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors'
          aria-label='Descargar foto'
          title='Descargar'
        >
          <FaDownload className='w-4 h-4' />
        </button>
        <button
          onClick={onClose}
          className='w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors'
          aria-label='Cerrar visor'
        >
          <FaTimes className='w-5 h-5' />
        </button>
      </div>

      {photos.length > 1 && currentIndex > 0 && (
        <button
          onClick={e => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className='absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors'
          aria-label='Foto anterior'
        >
          <FaChevronLeft className='w-4 h-4' />
        </button>
      )}

      {photos.length > 1 && currentIndex < photos.length - 1 && (
        <button
          onClick={e => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className='absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors'
          aria-label='Foto siguiente'
        >
          <FaChevronRight className='w-4 h-4' />
        </button>
      )}

      <motion.div
        key={currentIndex}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className='relative max-w-3xl max-h-[85vh] w-full mx-4'
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.label}
          width={1200}
          height={900}
          className='w-full h-auto rounded-2xl object-contain max-h-[80vh]'
          priority
        />
        <p className='text-zinc-400 text-sm text-center mt-4'>{photo.label}</p>
        {photos.length > 1 && (
          <div className='flex justify-center gap-2 mt-3'>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={e => {
                  e.stopPropagation()
                  onNavigate(i)
                }}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── VehicleInfoBar ─────────────────────────────────────────

function VehicleInfoBar({
  vehiculo,
  accentColor,
}: {
  vehiculo: VehicleInfo
  accentColor: 'orange' | 'blue'
}) {
  const badgeBg = accentColor === 'orange' ? 'bg-orange-600' : 'bg-blue-600'
  const borderColor =
    accentColor === 'orange' ? 'border-orange-500/20' : 'border-blue-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`bg-white/5 backdrop-blur-md rounded-2xl border ${borderColor} p-4 sm:p-5`}
    >
      {/* Mobile */}
      <div className='flex flex-col items-center gap-3 sm:hidden'>
        <div
          className={`${badgeBg} px-5 py-2 rounded-lg flex items-center gap-2`}
        >
          <FaCar className='text-white text-sm' />
          <span className='text-white font-black text-xl tracking-wider'>
            {vehiculo.patente}
          </span>
        </div>
        <div className='text-center'>
          <p className='text-white font-bold text-lg'>
            {vehiculo.marca} {vehiculo.modelo}
          </p>
          <p className='text-zinc-400 text-sm'>Año {vehiculo.año}</p>
        </div>
        <div className='flex items-center gap-4 text-sm'>
          <span className='text-zinc-400 flex items-center gap-1.5'>
            <FaUser className='text-xs text-zinc-500' />
            {vehiculo.cliente}
          </span>
          <span className='text-zinc-600'>|</span>
          <span className='text-zinc-500'>
            {formatearFechaCorta(vehiculo.fechaIngreso)}
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className='hidden sm:grid sm:grid-cols-3 items-center'>
        <div>
          <div
            className={`inline-flex items-center gap-2.5 ${badgeBg} px-5 py-2.5 rounded-lg`}
          >
            <FaCar className='text-white text-lg' />
            <span className='text-white font-black text-2xl tracking-wider'>
              {vehiculo.patente}
            </span>
          </div>
        </div>
        <div className='text-center'>
          <p className='text-white font-bold text-xl'>
            {vehiculo.marca} {vehiculo.modelo}
          </p>
          <p className='text-zinc-400 text-sm'>Año {vehiculo.año}</p>
          <p className='text-zinc-400 text-sm mt-1 flex items-center justify-center gap-1.5'>
            <FaUser className='text-xs text-zinc-500' />
            {vehiculo.cliente}
          </p>
        </div>
        <div className='text-right'>
          <div className='inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg'>
            <FaCalendarAlt className='text-zinc-500 text-sm' />
            <div>
              <div className='text-zinc-500 text-xs'>Ingreso</div>
              <div className='text-white font-semibold text-sm'>
                {formatearFechaCorta(vehiculo.fechaIngreso)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── OilHeroCard ────────────────────────────────────────────

function OilHeroCard({
  aceite,
  accentColor,
  fallbackImageUrl,
}: {
  aceite: { marca: string; tipo: string; fotoUrl?: string }
  accentColor: 'orange' | 'blue'
  fallbackImageUrl?: string
}) {
  const [photoOpen, setPhotoOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const hasContent = aceite.marca || aceite.tipo
  if (!hasContent) return null

  const imageUrl = aceite.fotoUrl
  const isClickable = !!aceite.fotoUrl
  const isOrange = accentColor === 'orange'

  const iconFrom = isOrange ? 'from-orange-500' : 'from-blue-500'
  const iconTo = isOrange ? 'to-amber-600' : 'to-cyan-600'
  const iconShadow = isOrange ? 'shadow-orange-500/25' : 'shadow-blue-500/25'
  const borderColor = isOrange ? 'border-orange-500/20' : 'border-blue-500/20'
  const hoverBorder = isOrange
    ? 'hover:border-orange-400/40'
    : 'hover:border-blue-400/40'
  const hoverGlow = isOrange
    ? 'hover:shadow-[0_0_30px_rgba(249,115,22,0.12)]'
    : 'hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]'
  const pillBg = isOrange
    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
  const badgeBg = isOrange ? 'bg-orange-500/20' : 'bg-blue-500/20'
  const badgeBorder = isOrange ? 'border-orange-400/30' : 'border-blue-400/30'
  const badgeGlow = isOrange
    ? 'shadow-[0_0_12px_rgba(249,115,22,0.2)]'
    : 'shadow-[0_0_12px_rgba(59,130,246,0.2)]'
  const badgeIcon = isOrange ? 'text-orange-400' : 'text-blue-400'
  const badgeText = isOrange ? 'text-orange-300' : 'text-blue-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.35 }}
      className='space-y-6'
    >
      {/* Section header */}
      <div className='flex items-center gap-4'>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${iconFrom} ${iconTo} rounded-xl flex items-center justify-center shadow-lg ${iconShadow}`}
        >
          <FaOilCan className='text-white text-lg' />
        </div>
        <h3 className='text-white font-bold text-xl sm:text-2xl'>
          Aceite Utilizado
        </h3>
      </div>

      {/* Card — same aesthetic as FilterCard, capped on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 100,
          delay: 0.45,
        }}
        className={`group relative rounded-2xl overflow-hidden border ${borderColor} bg-white/[0.03] ${hoverBorder} transition-all duration-300 ${hoverGlow} hover:-translate-y-1 sm:max-w-md`}
      >
        {imageUrl ? (
          <div className='relative' style={{ aspectRatio: '4 / 3' }}>
            <div className='absolute inset-0 overflow-hidden'>
              {!imageLoaded && (
                <div className='absolute inset-0 shimmer-skeleton' />
              )}
              <Image
                src={imageUrl}
                alt='Aceite utilizado'
                fill
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

            <div className='absolute bottom-0 inset-x-0 p-4 sm:p-6'>
              {aceite.marca && (
                <p className='text-white font-black text-2xl sm:text-3xl tracking-tight leading-none mb-2 drop-shadow-lg'>
                  {aceite.marca}
                </p>
              )}
              {aceite.tipo && (
                <div className='mb-3'>
                  <span
                    className={`inline-block ${pillBg} text-zinc-900 font-bold text-sm px-4 py-1.5 rounded-full`}
                  >
                    {aceite.tipo}
                  </span>
                </div>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 ${badgeBg} backdrop-blur-sm border ${badgeBorder} rounded-full ${badgeGlow}`}
              >
                <FaShieldAlt className={`${badgeIcon} text-[10px]`} />
                <span className={`${badgeText} text-xs font-semibold`}>
                  Aceite certificado aplicado
                </span>
              </span>
            </div>

            {isClickable && (
              <button
                onClick={() => setPhotoOpen(true)}
                className='absolute top-3 right-3 w-10 h-10 bg-black/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-black/50'
                aria-label='Ver foto del aceite'
              >
                <FaSearchPlus className='text-sm' />
              </button>
            )}
          </div>
        ) : (
          <div className='p-5 sm:p-6'>
            <div className='space-y-3'>
              {aceite.marca && (
                <p className='text-white font-black text-2xl sm:text-3xl tracking-tight leading-none'>
                  {aceite.marca}
                </p>
              )}
              {aceite.tipo && (
                <span
                  className={`inline-block ${pillBg} text-zinc-900 font-bold text-sm px-4 py-1.5 rounded-full`}
                >
                  {aceite.tipo}
                </span>
              )}
              <div className='pt-1'>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 ${badgeBg} border ${badgeBorder} rounded-full`}
                >
                  <FaShieldAlt className={`${badgeIcon} text-[10px]`} />
                  <span className={`${badgeText} text-xs font-semibold`}>
                    Aceite certificado aplicado
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {photoOpen && aceite.fotoUrl && (
          <PhotoLightbox
            photos={[{ url: aceite.fotoUrl, label: 'Aceite utilizado' }]}
            currentIndex={0}
            onClose={() => setPhotoOpen(false)}
            onNavigate={() => {}}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── FilterCard ─────────────────────────────────────────────

function FilterCard({
  label,
  fotoUrl,
  index,
  onPhotoClick,
}: {
  label: string
  fotoUrl?: string
  index: number
  onPhotoClick?: () => void
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 100,
        delay: 0.5 + index * 0.1,
      }}
      className='group relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-white/[0.03] hover:border-emerald-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] hover:-translate-y-1'
    >
      {fotoUrl ? (
        <div className='relative' style={{ aspectRatio: '4 / 3' }}>
          <div className='absolute inset-0 overflow-hidden'>
            {!imageLoaded && (
              <div className='absolute inset-0 shimmer-skeleton' />
            )}
            <Image
              src={fotoUrl}
              alt={label}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

          <div className='absolute bottom-0 inset-x-0 p-4'>
            <p className='text-white font-bold text-base sm:text-lg mb-2 drop-shadow-lg'>
              {label}
            </p>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]'>
              <FaCheck className='text-emerald-400 text-[10px]' />
              <span className='text-emerald-300 text-xs font-semibold'>
                Reemplazado
              </span>
            </span>
          </div>

          <button
            onClick={onPhotoClick}
            className='absolute top-3 right-3 w-10 h-10 bg-black/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-black/50'
            aria-label={`Ver foto de ${label}`}
          >
            <FaSearchPlus className='text-sm' />
          </button>
        </div>
      ) : (
        <div className='p-5'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center'>
              <FaCheck className='text-emerald-400' />
            </div>
            <div>
              <p className='text-white font-bold'>{label}</p>
              <span className='text-emerald-400 text-sm font-medium'>
                Reemplazado
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── FilterSection ──────────────────────────────────────────

function FilterSection({
  filtrosActivos,
}: {
  filtrosActivos: { key: string; label: string; fotoUrl?: string }[]
}) {
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null)

  const photosForLightbox = filtrosActivos
    .map((f, i) => ({ url: f.fotoUrl, label: f.label, filterIndex: i }))
    .filter(
      (f): f is { url: string; label: string; filterIndex: number } => !!f.url
    )

  const lightboxPhotoIndex =
    selectedFilter !== null
      ? photosForLightbox.findIndex(p => p.filterIndex === selectedFilter)
      : -1

  const handleNavigate = (photoIndex: number) => {
    const photo = photosForLightbox[photoIndex]
    if (photo) setSelectedFilter(photo.filterIndex)
  }

  if (filtrosActivos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='bg-white/[0.03] backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-8 sm:p-10 text-center'
      >
        <div className='w-14 h-14 bg-zinc-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4'>
          <FaFilter className='text-zinc-600 text-xl' />
        </div>
        <p className='text-zinc-500 font-medium'>
          No se reemplazaron filtros en este servicio
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className='space-y-6'
    >
      <div className='flex items-center gap-4'>
        <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25'>
          <FaFilter className='text-white' />
        </div>
        <div>
          <h3 className='text-white font-bold text-xl sm:text-2xl'>
            Filtros Reemplazados
          </h3>
          <p className='text-emerald-400 text-sm font-medium'>
            {filtrosActivos.length}{' '}
            {filtrosActivos.length === 1
              ? 'filtro reemplazado'
              : 'filtros reemplazados'}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filtrosActivos.map((f, i) => (
          <FilterCard
            key={f.key}
            label={f.label}
            fotoUrl={f.fotoUrl}
            index={i}
            onPhotoClick={f.fotoUrl ? () => setSelectedFilter(i) : undefined}
          />
        ))}
      </div>

      <AnimatePresence>
        {lightboxPhotoIndex >= 0 && (
          <PhotoLightbox
            photos={photosForLightbox.map(p => ({ url: p.url, label: p.label }))}
            currentIndex={lightboxPhotoIndex}
            onClose={() => setSelectedFilter(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── CajaView ───────────────────────────────────────────────

function CajaView({
  data,
  tipoServicio,
  fechaEstimadaEntrega,
  proximoPaso,
  km,
  vehiculo,
  compact,
}: {
  data: ServiceDataCaja
  tipoServicio?: string
  fechaEstimadaEntrega?: string
  proximoPaso?: string
  km?: number
  vehiculo?: VehicleInfo
  compact?: boolean
}) {
  const filtrosActivos: { key: string; label: string; fotoUrl?: string }[] = []
  if (data.filtro)
    filtrosActivos.push({
      key: 'filtro',
      label: 'Filtro de Caja',
      fotoUrl: data.filtroFotoUrl,
    })
  if (data.cartucho)
    filtrosActivos.push({
      key: 'cartucho',
      label: 'Cartucho',
      fotoUrl: data.cartuchoFotoUrl,
    })

  if (compact) {
    return (
      <div className='p-5 bg-zinc-900/60 border-t border-orange-500/10 space-y-4'>
        {(data.aceite.marca || data.aceite.tipo) && (
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 bg-orange-500/15 rounded-lg flex items-center justify-center'>
              <FaOilCan className='text-orange-400 text-sm' />
            </div>
            <div>
              {data.aceite.marca && <span className='text-white font-bold text-sm'>{data.aceite.marca}</span>}
              {data.aceite.tipo && <span className='text-orange-300 ml-2 text-xs bg-orange-500/15 px-2 py-0.5 rounded-full'>{data.aceite.tipo}</span>}
            </div>
          </div>
        )}
        {filtrosActivos.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <FaFilter className='text-emerald-400 text-xs' />
              <span className='text-zinc-400 text-xs uppercase tracking-wider'>Filtros reemplazados</span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {filtrosActivos.map(f => (
                <span key={f.key} className='inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-xs font-medium'>
                  <FaCheck className='text-[8px]' /> {f.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen relative'>
      <SpaceBackground />
      {/* HERO */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0'>
          <Image
            src='/images/servicios/servicescaja.png'
            alt='Servicio de Caja'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950' />
          <div className='absolute inset-0 bg-gradient-to-r from-orange-900/30 via-transparent to-amber-900/20' />
        </div>

        <div className='relative max-w-4xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='flex flex-col items-center'
          >
            {(data.fotoVehiculo || vehiculo?.fotoVehiculo) ? (
              <div className='relative w-28 h-28 sm:w-36 sm:h-36 mb-4 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.3)]'>
                <Image
                  src={(data.fotoVehiculo || vehiculo?.fotoVehiculo)!}
                  alt='Vehículo'
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            ) : (
              <div className='w-28 h-28 sm:w-36 sm:h-36 mb-4 rounded-full bg-zinc-800/60 border-2 border-orange-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]'>
                <span className='text-5xl sm:text-6xl'>🚗</span>
              </div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='text-3xl sm:text-5xl font-black text-white text-center tracking-tight'
            >
              {tipoServicio || 'Servicio de Caja'}
            </motion.h1>

            {km && km > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='mt-3'
              >
                <span className='inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 font-bold text-sm backdrop-blur-sm'>
                  <FaTachometerAlt className='text-xs' />
                  {km.toLocaleString()} km
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {vehiculo && (
          <div className='relative max-w-4xl mx-auto px-4 pb-8'>
            <VehicleInfoBar vehiculo={vehiculo} accentColor='orange' />
          </div>
        )}

        <GlowLine color='orange' />
      </div>

      {/* CONTENT */}
      <div className='max-w-4xl mx-auto px-4 py-10 space-y-8'>
        <OilHeroCard
          aceite={data.aceite}
          accentColor='orange'
          fallbackImageUrl='/images/home/atf.png'
        />

        <FilterSection filtrosActivos={filtrosActivos} />

        {/* Próximo Servicio */}
        {km && km > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className='relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-zinc-900 to-amber-500/5'
          >
            <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500' />
            <div className='p-6 sm:p-8'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25'>
                  <FaCalendarAlt className='text-white text-sm' />
                </div>
                <h3 className='text-white font-bold text-lg sm:text-xl'>
                  Próximo Servicio
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40'>
                  <div className='flex items-center gap-2 mb-2'>
                    <FaTachometerAlt className='text-orange-400 text-xs' />
                    <span className='text-zinc-500 text-xs uppercase tracking-wider'>
                      Por kilometraje
                    </span>
                  </div>
                  <p className='text-white font-black text-2xl'>
                    {(km + 50000).toLocaleString()} km
                  </p>
                  <p className='text-zinc-500 text-xs mt-1'>
                    +50.000 km desde este servicio
                  </p>
                </div>
                {vehiculo?.fechaIngreso && (
                  <div className='bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40'>
                    <div className='flex items-center gap-2 mb-2'>
                      <FaCalendarAlt className='text-orange-400 text-xs' />
                      <span className='text-zinc-500 text-xs uppercase tracking-wider'>
                        Por tiempo
                      </span>
                    </div>
                    <p className='text-orange-300 font-bold text-lg capitalize'>
                      {(() => {
                        const base = new Date(vehiculo.fechaIngreso)
                        base.setFullYear(base.getFullYear() + 3)
                        return base.toLocaleDateString('es-AR', {
                          month: 'long',
                          year: 'numeric',
                        })
                      })()}
                    </p>
                    <p className='text-zinc-500 text-xs mt-1'>
                      3 años desde este servicio
                    </p>
                  </div>
                )}
              </div>
              <p className='text-zinc-600 text-xs mt-4'>
                Lo que ocurra primero. Las fechas son estimativas.
              </p>
            </div>
          </motion.div>
        )}

        {/* Próximo paso + Entrega */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {proximoPaso &&
            proximoPaso !== 'Sin información' &&
            proximoPaso !== 'Sin definir' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className='rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6'
              >
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center'>
                    <FaArrowRight className='text-amber-400 text-xs' />
                  </div>
                  <span className='text-zinc-500 text-xs uppercase tracking-wider font-semibold'>
                    Próximo Paso
                  </span>
                </div>
                <p className='text-white font-medium'>{proximoPaso}</p>
              </motion.div>
            )}

          {fechaEstimadaEntrega && formatearFecha(fechaEstimadaEntrega) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className='rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-5 sm:p-6'
            >
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-7 h-7 bg-orange-500/15 rounded-lg flex items-center justify-center'>
                  <FaCalendarAlt className='text-orange-400 text-xs' />
                </div>
                <span className='text-zinc-500 text-xs uppercase tracking-wider font-semibold'>
                  Entrega Estimada
                </span>
              </div>
              <p className='text-orange-300 font-bold capitalize'>
                {formatearFecha(fechaEstimadaEntrega)}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MotorView ──────────────────────────────────────────────

function MotorView({
  data,
  tipoServicio,
  fechaEstimadaEntrega,
  proximoPaso,
  km,
  vehiculo,
  compact,
}: {
  data: ServiceDataMotor
  tipoServicio?: string
  fechaEstimadaEntrega?: string
  proximoPaso?: string
  km?: number
  vehiculo?: VehicleInfo
  compact?: boolean
}) {
  const filtroLabels: Record<string, string> = {
    aceite: 'Filtro de Aceite',
    aire: 'Filtro de Aire',
    combustible: 'Filtro de Combustible',
    habitaculo: 'Filtro de Habitáculo',
  }
  const filtrosActivos = Object.entries(data.filtros)
    .filter(([, v]) => v)
    .map(([key]) => ({
      key,
      label: filtroLabels[key] || key,
      fotoUrl: data.filtrosFotos?.[key as keyof typeof data.filtrosFotos],
    }))

  if (compact) {
    return (
      <div className='p-5 bg-zinc-900/60 border-t border-blue-500/10 space-y-4'>
        {(data.aceite.marca || data.aceite.tipo) && (
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center'>
              <FaOilCan className='text-blue-400 text-sm' />
            </div>
            <div>
              {data.aceite.marca && <span className='text-white font-bold text-sm'>{data.aceite.marca}</span>}
              {data.aceite.tipo && <span className='text-blue-300 ml-2 text-xs bg-blue-500/15 px-2 py-0.5 rounded-full'>{data.aceite.tipo}</span>}
            </div>
          </div>
        )}
        {filtrosActivos.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <FaFilter className='text-emerald-400 text-xs' />
              <span className='text-zinc-400 text-xs uppercase tracking-wider'>Filtros reemplazados</span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {filtrosActivos.map(f => (
                <span key={f.key} className='inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-xs font-medium'>
                  <FaCheck className='text-[8px]' /> {f.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen relative'>
      <SpaceBackground />
      {/* HERO */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0'>
          <Image
            src='/images/servicios/servicemotor.png'
            alt='Servicio de Motor'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950' />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-900/25 via-transparent to-indigo-900/20' />
        </div>

        <div className='relative max-w-4xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='flex flex-col items-center'
          >
            {(data.fotoVehiculo || vehiculo?.fotoVehiculo) ? (
              <div className='relative w-28 h-28 sm:w-36 sm:h-36 mb-4 rounded-full overflow-hidden border-2 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]'>
                <Image
                  src={(data.fotoVehiculo || vehiculo?.fotoVehiculo)!}
                  alt='Vehículo'
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            ) : (
              <div className='w-28 h-28 sm:w-36 sm:h-36 mb-4 rounded-full bg-zinc-800/60 border-2 border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]'>
                <span className='text-5xl sm:text-6xl'>🚗</span>
              </div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='text-3xl sm:text-5xl font-black text-white text-center tracking-tight'
            >
              {tipoServicio || 'Servicio de Motor'}
            </motion.h1>

            {km && km > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='mt-3'
              >
                <span className='inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 font-bold text-sm backdrop-blur-sm'>
                  <FaTachometerAlt className='text-xs' />
                  {km.toLocaleString()} km
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {vehiculo && (
          <div className='relative max-w-4xl mx-auto px-4 pb-8'>
            <VehicleInfoBar vehiculo={vehiculo} accentColor='blue' />
          </div>
        )}

        <GlowLine color='blue' />
      </div>

      {/* CONTENT */}
      <div className='max-w-4xl mx-auto px-4 py-10 space-y-8'>
        <OilHeroCard aceite={data.aceite} accentColor='blue' />

        <FilterSection filtrosActivos={filtrosActivos} />

        {/* Próximo Servicio */}
        {km && km > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className='relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-indigo-500/5'
          >
            <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500' />
            <div className='p-6 sm:p-8'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25'>
                  <FaCalendarAlt className='text-white text-sm' />
                </div>
                <h3 className='text-white font-bold text-lg sm:text-xl'>
                  Próximo Servicio
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40'>
                  <div className='flex items-center gap-2 mb-2'>
                    <FaTachometerAlt className='text-blue-400 text-xs' />
                    <span className='text-zinc-500 text-xs uppercase tracking-wider'>
                      Por kilometraje
                    </span>
                  </div>
                  <p className='text-white font-black text-2xl'>
                    {(km + 10000).toLocaleString()} km
                  </p>
                  <p className='text-zinc-500 text-xs mt-1'>
                    +10.000 km desde este servicio
                  </p>
                </div>
                {vehiculo?.fechaIngreso && (
                  <div className='bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40'>
                    <div className='flex items-center gap-2 mb-2'>
                      <FaCalendarAlt className='text-blue-400 text-xs' />
                      <span className='text-zinc-500 text-xs uppercase tracking-wider'>
                        Por tiempo
                      </span>
                    </div>
                    <p className='text-blue-300 font-bold text-lg capitalize'>
                      {(() => {
                        const base = new Date(vehiculo.fechaIngreso)
                        base.setFullYear(base.getFullYear() + 1)
                        return base.toLocaleDateString('es-AR', {
                          month: 'long',
                          year: 'numeric',
                        })
                      })()}
                    </p>
                    <p className='text-zinc-500 text-xs mt-1'>
                      1 año desde este servicio
                    </p>
                  </div>
                )}
              </div>
              <p className='text-zinc-600 text-xs mt-4'>
                Lo que ocurra primero. Las fechas son estimativas.
              </p>
            </div>
          </motion.div>
        )}

        {/* Próximo paso + Entrega */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {proximoPaso &&
            proximoPaso !== 'Sin información' &&
            proximoPaso !== 'Sin definir' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className='rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6'
              >
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-7 h-7 bg-blue-500/15 rounded-lg flex items-center justify-center'>
                    <FaArrowRight className='text-blue-400 text-xs' />
                  </div>
                  <span className='text-zinc-500 text-xs uppercase tracking-wider font-semibold'>
                    Próximo Paso
                  </span>
                </div>
                <p className='text-white font-medium'>{proximoPaso}</p>
              </motion.div>
            )}

          {fechaEstimadaEntrega && formatearFecha(fechaEstimadaEntrega) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className='rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5 sm:p-6'
            >
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-7 h-7 bg-blue-500/15 rounded-lg flex items-center justify-center'>
                  <FaCalendarAlt className='text-blue-400 text-xs' />
                </div>
                <span className='text-zinc-500 text-xs uppercase tracking-wider font-semibold'>
                  Entrega Estimada
                </span>
              </div>
              <p className='text-blue-300 font-bold capitalize'>
                {formatearFecha(fechaEstimadaEntrega)}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────

export default function ServiceDataInfo({
  serviceData,
  tipoServicio,
  fechaEstimadaEntrega,
  proximoPaso,
  km,
  vehiculo,
  compact,
}: ServiceDataInfoProps) {
  if (!serviceData) return null

  if (serviceData.type === 'caja') {
    return (
      <CajaView
        data={serviceData as ServiceDataCaja}
        tipoServicio={tipoServicio}
        fechaEstimadaEntrega={fechaEstimadaEntrega}
        proximoPaso={proximoPaso}
        km={km}
        vehiculo={vehiculo}
        compact={compact}
      />
    )
  }

  if (serviceData.type === 'motor') {
    return (
      <MotorView
        data={serviceData as ServiceDataMotor}
        tipoServicio={tipoServicio}
        fechaEstimadaEntrega={fechaEstimadaEntrega}
        proximoPaso={proximoPaso}
        km={km}
        vehiculo={vehiculo}
        compact={compact}
      />
    )
  }

  return null
}
