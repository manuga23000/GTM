// components/sections/Seguimiento/FileViewer.tsx
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaTimes, FaChevronLeft, FaChevronRight, FaImage, FaVideo } from 'react-icons/fa'
import { StepFile } from '@/actions/seguimiento'

interface FileViewerProps {
  archivos: StepFile[]
}

// Hook para precargar imágenes
const useImagePreloader = (urls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    if (!urls.length) return
    
    const imageUrls = urls.filter(url => url.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    if (!imageUrls.length) return
    
    const imagePromises = imageUrls.map(url => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(url)
        img.src = url
      })
    })

    Promise.allSettled(imagePromises).then(results => {
      const loaded = new Set<string>()
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          loaded.add(result.value)
        }
      })
      setLoadedImages(loaded)
    })
  }, [urls.join(',')]) // Usar join para evitar referencias cambiantes del array

  return loadedImages
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
  const [isZooming, setIsZooming] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const currentFile = archivos[currentIndex]
  
  // Memoizar URLs para evitar re-renders
  const imageUrls = useMemo(() => 
    archivos.filter(f => f.type === 'image').map(f => f.url), 
    [archivos]
  )
  const loadedImages = useImagePreloader(imageUrls)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Reset image loaded state when changing images
  useEffect(() => {
    if (currentFile?.type === 'image') {
      setImageLoaded(loadedImages.has(currentFile.url))
    } else {
      setImageLoaded(true) // Videos no necesitan precarga
    }
  }, [currentFile?.url, currentFile?.type, loadedImages])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % archivos.length)
  }, [archivos.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + archivos.length) % archivos.length)
  }, [archivos.length])

  // Navegación con teclado - memoizar la función
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [goToPrevious, goToNext, onClose])

  useEffect(() => {
    if (!isOpen) return

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, handleKeyPress])

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

  // Detectar si es un gesto de zoom (dos dedos)
  const detectZoomGesture = (e: React.TouchEvent) => {
    return e.touches.length > 1
  }

  // Mejorado manejo táctil
  const onTouchStart = (e: React.TouchEvent) => {
    if (detectZoomGesture(e)) {
      setIsZooming(true)
      return
    }
    
    setIsZooming(false)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (isZooming || detectZoomGesture(e)) {
      return
    }
    
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (isZooming || !touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && archivos.length > 1) {
      goToNext()
    } else if (isRightSwipe && archivos.length > 1) {
      goToPrevious()
    }

    // Reset
    setTouchStart(null)
    setTouchEnd(null)
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
          style={{ touchAction: 'pan-x pan-y' }} // Permitir zoom nativo
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

          {/* Flechas de navegación - Solo si hay más de 1 archivo y no está haciendo zoom */}
          {archivos.length > 1 && !isZooming && (
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
            {/* Indicador de carga para imágenes */}
            {currentFile.type === 'image' && !imageLoaded && (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            )}

            {/* Contenido principal - Sin AnimatePresence para evitar parpadeos */}
            <div className={imageLoaded || currentFile.type === 'video' ? 'block' : 'hidden'}>
              {currentFile.type === 'image' ? (
                <img
                  src={currentFile.url}
                  alt={currentFile.fileName}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  style={{ 
                    touchAction: 'pinch-zoom', // Permitir zoom en imágenes
                    userSelect: 'none'
                  }}
                  onLoad={() => setImageLoaded(true)}
                  loading="eager" // Carga inmediata para mejor UX
                />
              ) : (
                <video
                  src={currentFile.url}
                  controls
                  className="w-full h-auto max-h-[80vh]"
                  preload="metadata"
                  style={{ touchAction: 'manipulation' }}
                >
                  Tu navegador no soporta el elemento video.
                </video>
              )}
            </div>
          </div>

          {/* Footer con información */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 rounded-b-lg">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">{currentFile.fileName}</h3>
              <p className="text-sm text-gray-300">
                {archivos.length > 1 && !isZooming 
                  ? 'Usa las flechas o desliza para navegar • '
                  : ''
                }
                Pellizca para hacer zoom • Haz clic en "Descargar" para guardar
              </p>
            </div>
          </div>

          {/* Indicadores de puntos - Solo si hay más de 1 archivo y no está haciendo zoom */}
          {archivos.length > 1 && !isZooming && (
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