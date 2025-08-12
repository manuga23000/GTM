// components/sections/Seguimiento/GaleriaImagenes.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  FaImage,
  FaTimes,
  FaExpand,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import Image from 'next/image'

interface ImagenItem {
  id: number
  url: string
  fecha: string
  descripcion: string
  tipo: 'antes' | 'proceso' | 'despues'
}

interface GaleriaImagenesProps {
  imagenes: ImagenItem[]
}

export default function GaleriaImagenes({ imagenes }: GaleriaImagenesProps) {
  const [imagenSeleccionada, setImagenSeleccionada] =
    useState<ImagenItem | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>('todas')

  const tiposDisponibles = [
    'todas',
    ...Array.from(new Set(imagenes.map(img => img.tipo))),
  ]

  const imagenesFiltradas =
    filtroTipo === 'todas'
      ? imagenes
      : imagenes.filter(img => img.tipo === filtroTipo)

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'antes':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'proceso':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'despues':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'antes':
        return 'Estado Inicial'
      case 'proceso':
        return 'En Proceso'
      case 'despues':
        return 'Finalizado'
      default:
        return tipo
    }
  }

  const navegarImagen = (direccion: 'anterior' | 'siguiente') => {
    if (!imagenSeleccionada) return

    const indiceActual = imagenesFiltradas.findIndex(
      img => img.id === imagenSeleccionada.id
    )
    let nuevoIndice

    if (direccion === 'anterior') {
      nuevoIndice =
        indiceActual > 0 ? indiceActual - 1 : imagenesFiltradas.length - 1
    } else {
      nuevoIndice =
        indiceActual < imagenesFiltradas.length - 1 ? indiceActual + 1 : 0
    }

    setImagenSeleccionada(imagenesFiltradas[nuevoIndice])
  }

  if (imagenes.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center'
      >
        <FaImage className='text-gray-300 text-4xl mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-600 mb-2'>
          Sin imágenes disponibles
        </h3>
        <p className='text-gray-500'>
          Las imágenes del progreso aparecerán aquí conforme avancen los
          trabajos.
        </p>
      </motion.section>
    )
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6'>
          <h2 className='text-2xl font-bold flex items-center mb-4'>
            <FaImage className='mr-3' />
            Galería de Progreso
          </h2>

          {/* Filtros */}
          <div className='flex flex-wrap gap-2'>
            {tiposDisponibles.map(tipo => (
              <motion.button
                key={tipo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filtroTipo === tipo
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-500 text-white hover:bg-purple-400'
                }`}
              >
                {tipo === 'todas' ? 'Todas' : getTipoTexto(tipo)}
                {tipo !== 'todas' && (
                  <span className='ml-2 bg-purple-400 text-white px-2 py-0.5 rounded-full text-xs'>
                    {imagenes.filter(img => img.tipo === tipo).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid de imágenes */}
        <div className='p-6'>
          {imagenesFiltradas.length === 0 ? (
            <div className='text-center py-8'>
              <FaImage className='text-gray-300 text-3xl mx-auto mb-3' />
              <p className='text-gray-500'>No hay imágenes para este filtro</p>
            </div>
          ) : (
            <motion.div
              layout
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            >
              {imagenesFiltradas.map((imagen, index) => (
                <motion.div
                  key={imagen.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className='relative group cursor-pointer bg-gray-50 rounded-lg overflow-hidden border border-gray-200'
                  onClick={() => setImagenSeleccionada(imagen)}
                >
                  {/* Imagen */}
                  <div className='aspect-video relative overflow-hidden'>
                    <Image
                      src={imagen.url}
                      alt={
                        imagen.descripcion ||
                        `Imagen del ${
                          imagen.tipo
                        } del vehículo - ${formatearFecha(imagen.fecha)}`
                      }
                      fill
                      className='object-cover transition-transform group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center'>
                      <FaExpand className='text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl' />
                    </div>
                  </div>

                  {/* Info */}
                  <div className='p-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getTipoColor(
                          imagen.tipo
                        )}`}
                      >
                        {getTipoTexto(imagen.tipo)}
                      </span>
                      <span className='text-xs text-gray-500 flex items-center'>
                        <FaCalendarAlt className='mr-1' />
                        {formatearFecha(imagen.fecha)}
                      </span>
                    </div>
                    <p className='text-sm text-gray-700 line-clamp-2'>
                      {imagen.descripcion}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Nota sobre eliminación automática */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg'
          >
            <p className='text-amber-700 text-sm text-center'>
              <strong>📷 Nota:</strong> Las imágenes se eliminan automáticamente
              después de 15 días. Si necesitás conservar alguna, descargala
              antes de esa fecha.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {imagenSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
            onClick={() => setImagenSeleccionada(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className='relative max-w-4xl w-full bg-white rounded-lg overflow-hidden'
              onClick={e => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className='bg-gray-800 text-white p-4 flex items-center justify-between'>
                <div className='flex items-center'>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium mr-3 ${getTipoColor(
                      imagenSeleccionada.tipo
                    )}`}
                  >
                    {getTipoTexto(imagenSeleccionada.tipo)}
                  </span>
                  <span className='text-gray-300 text-sm'>
                    {formatearFecha(imagenSeleccionada.fecha)}
                  </span>
                </div>
                <button
                  onClick={() => setImagenSeleccionada(null)}
                  className='text-gray-300 hover:text-white text-xl'
                >
                  <FaTimes />
                </button>
              </div>

              {/* Imagen */}
              <div className='relative aspect-video'>
                <Image
                  src={imagenSeleccionada.url}
                  alt={
                    imagenSeleccionada.descripcion ||
                    `Imagen ampliada del ${imagenSeleccionada.tipo} del vehículo`
                  }
                  fill
                  className='object-contain'
                />

                {/* Navegación */}
                {imagenesFiltradas.length > 1 && (
                  <>
                    <button
                      onClick={() => navegarImagen('anterior')}
                      className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all'
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() => navegarImagen('siguiente')}
                      className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all'
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>

              {/* Descripción */}
              <div className='p-4 bg-gray-50'>
                <p className='text-gray-700'>
                  {imagenSeleccionada.descripcion}
                </p>
                <div className='mt-2 text-sm text-gray-500'>
                  Imagen{' '}
                  {imagenesFiltradas.findIndex(
                    img => img.id === imagenSeleccionada.id
                  ) + 1}{' '}
                  de {imagenesFiltradas.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
