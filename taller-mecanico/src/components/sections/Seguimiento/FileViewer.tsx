// components/sections/Seguimiento/FileViewer.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaTimes, FaChevronLeft, FaChevronRight, FaImage, FaVideo } from 'react-icons/fa'
import { StepFile } from '@/actions/seguimiento'

interface FileViewerProps {
  archivos: StepFile[]
}

// Componente para galería de archivos
const FileGallery = ({ 
  archivos, 
  isOpen, 
  onClose,
  initialIndex = 0
}: { 
  archivos: StepFile[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentFile = archivos[currentIndex]

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, currentIndex])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % archivos.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + archivos.length) % archivos.length)
  }

  const downloadFile = async () => {
    if (!currentFile) return

    try {
      const response = await fetch(currentFile.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = currentFile.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando archivo:', error)
      window.open(currentFile.url, '_blank')
    }
  }

  // Detectar deslizamiento táctil
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  if (!isOpen || !currentFile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl max-h-full w-full mx-4"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header con contador y controles */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            {/* Contador e información */}
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                {currentFile.type === 'image' ? (
                  <FaImage className="text-green-400" />
                ) : (
                  <FaVideo className="text-purple-400" />
                )}
                <span>{currentIndex + 1} de {archivos.length}</span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-2">
              <button
                onClick={downloadFile}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg"
                title="Descargar archivo"
              >
                <FaDownload className="text-lg text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-3 bg-gray-800 hover:bg-gray-900 rounded-full transition-colors shadow-lg"
                title="Cerrar (ESC)"
              >
                <FaTimes className="text-lg text-white" />
              </button>
            </div>
          </div>

          {/* Flechas de navegación */}
          {archivos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all"
                title="Anterior (←)"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all"
                title="Siguiente (→)"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </>
          )}

          {/* Contenido del archivo */}
          <div className="bg-white rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {currentFile.type === 'image' ? (
                  <img
                    src={currentFile.url}
                    alt={currentFile.fileName}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={currentFile.url}
                    controls
                    className="w-full h-auto max-h-[80vh]"
                    preload="metadata"
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer con información */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 rounded-b-lg">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">{currentFile.fileName}</h3>
              <p className="text-sm text-gray-300">
                Usa las flechas o desliza para navegar • Haz clic en "Descargar" para guardar
              </p>
            </div>
          </div>

          {/* Indicadores de puntos (solo si hay más de 1 archivo) */}
          {archivos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
              {archivos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function FileViewer({ archivos }: FileViewerProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  if (!archivos || archivos.length === 0) {
    return null
  }

  const openGallery = (index = 0) => {
    setStartIndex(index)
    setGalleryOpen(true)
  }

  const closeGallery = () => {
    setGalleryOpen(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const totalSize = archivos.reduce((sum, archivo) => sum + archivo.size, 0)
  const imageCount = archivos.filter(a => a.type === 'image').length
  const videoCount = archivos.filter(a => a.type === 'video').length

  return (
    <>
      <div className="mt-3">
        {/* Botón para ver archivos */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => openGallery(0)}
          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-2 transition-all group text-sm"
        >
          <div className="flex items-center gap-1">
            {imageCount > 0 && (
              <div className="flex items-center bg-green-100 text-green-700 p-1 rounded">
                <FaImage className="text-xs" />
              </div>
            )}
            {videoCount > 0 && (
              <div className="flex items-center bg-purple-100 text-purple-700 p-1 rounded">
                <FaVideo className="text-xs" />
              </div>
            )}
          </div>
          <span className="font-medium text-blue-800">
            Ver archivos ({archivos.length})
          </span>
          <FaChevronRight className="text-blue-600 group-hover:text-blue-700 transition-colors text-xs" />
        </motion.button>
      </div>

      {/* Galería de archivos */}
      <FileGallery
        archivos={archivos}
        isOpen={galleryOpen}
        onClose={closeGallery}
        initialIndex={startIndex}
      />
    </>
  )
}