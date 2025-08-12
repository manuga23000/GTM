// app/seguimiento/[patente]/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import SeguimientoHeader from '@/components/sections/Seguimiento/SeguimientoHeader'
import EstadoActual from '@/components/sections/Seguimiento/EstadoActual'
import TimelineProgreso from '@/components/sections/Seguimiento/TimelineProgreso'
import GaleriaImagenes from '@/components/sections/Seguimiento/GaleriaImagenes'
import DetallesVehiculo from '@/components/sections/Seguimiento/DetallesVehiculo'
import ContactoTaller from '@/components/sections/Seguimiento/ContactoTaller'

interface SeguimientoData {
  patente: string
  modelo: string
  marca: string
  año: string
  cliente: string
  fechaIngreso: string
  estadoActual: string
  trabajosRealizados: string[]
  proximoPaso: string
  fechaEstimadaEntrega: string
  timeline: TimelineItem[]
  imagenes: ImagenItem[]
}

interface TimelineItem {
  id: number
  fecha: string
  hora: string
  estado: string
  descripcion: string
  completado: boolean
}

interface ImagenItem {
  id: number
  url: string
  fecha: string
  descripcion: string
  tipo: 'antes' | 'proceso' | 'despues'
}

export default function SeguimientoPage() {
  const params = useParams()
  const patente = params.patente as string
  const [seguimientoData, setSeguimientoData] =
    useState<SeguimientoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos - en producción conectarías con tu API
    const cargarDatos = async () => {
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Datos mock - reemplazar con llamada real a la API
        const mockData: SeguimientoData = {
          patente: patente.toUpperCase(),
          modelo: 'Corolla',
          marca: 'Toyota',
          año: '2018',
          cliente: 'Juan Pérez',
          fechaIngreso: '2025-08-10',
          estadoActual: 'En reparación',
          trabajosRealizados: [
            'Diagnóstico completo de caja automática',
            'Cambio de filtro y aceite ATF',
            'Reparación de válvula solenoide',
          ],
          proximoPaso: 'Prueba de manejo y control de calidad',
          fechaEstimadaEntrega: '2025-08-15',
          timeline: [
            {
              id: 1,
              fecha: '2025-08-10',
              hora: '09:00',
              estado: 'Vehículo recibido',
              descripcion: 'Recepción del vehículo y documentación inicial',
              completado: true,
            },
            {
              id: 2,
              fecha: '2025-08-10',
              hora: '14:30',
              estado: 'Diagnóstico iniciado',
              descripcion: 'Inicio del diagnóstico de caja automática',
              completado: true,
            },
            {
              id: 3,
              fecha: '2025-08-11',
              hora: '10:15',
              estado: 'Diagnóstico completado',
              descripcion:
                'Problema identificado: válvula solenoide defectuosa',
              completado: true,
            },
            {
              id: 4,
              fecha: '2025-08-12',
              hora: '08:00',
              estado: 'Reparación en curso',
              descripcion: 'Inicio de reparación y reemplazo de componentes',
              completado: true,
            },
            {
              id: 5,
              fecha: '2025-08-14',
              hora: '16:00',
              estado: 'Control de calidad',
              descripcion: 'Pruebas finales y verificación del funcionamiento',
              completado: false,
            },
            {
              id: 6,
              fecha: '2025-08-15',
              hora: '10:00',
              estado: 'Listo para entrega',
              descripcion: 'Vehículo listo para ser retirado',
              completado: false,
            },
          ],
          imagenes: [
            {
              id: 1,
              url: '/images/seguimiento/antes1.jpg',
              fecha: '2025-08-10',
              descripcion: 'Estado inicial del vehículo',
              tipo: 'antes',
            },
            {
              id: 2,
              url: '/images/seguimiento/proceso1.jpg',
              fecha: '2025-08-12',
              descripcion: 'Desmontaje de la caja automática',
              tipo: 'proceso',
            },
            {
              id: 3,
              url: '/images/seguimiento/proceso2.jpg',
              fecha: '2025-08-12',
              descripcion: 'Válvula solenoide defectuosa identificada',
              tipo: 'proceso',
            },
          ],
        }

        setSeguimientoData(mockData)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [patente])

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full'
        />
        <span className='ml-4 text-gray-600 text-lg'>
          Cargando seguimiento...
        </span>
      </div>
    )
  }

  if (!seguimientoData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>
            Vehículo no encontrado
          </h1>
          <p className='text-gray-600 mb-6'>
            No se encontró información para la patente:{' '}
            <strong>{patente}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className='bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors'
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header con info del vehículo */}
      <SeguimientoHeader data={seguimientoData} />

      <main className='max-w-7xl mx-auto px-4 py-8 space-y-8'>
        {/* Estado actual destacado */}
        <EstadoActual data={seguimientoData} />

        {/* Grid principal */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Columna izquierda - Timeline */}
          <div className='lg:col-span-2 space-y-8'>
            <TimelineProgreso timeline={seguimientoData.timeline} />
            <GaleriaImagenes imagenes={seguimientoData.imagenes} />
          </div>

          {/* Columna derecha - Info del vehículo y contacto */}
          <div className='space-y-8'>
            <DetallesVehiculo data={seguimientoData} />
            <ContactoTaller />
          </div>
        </div>
      </main>
    </div>
  )
}
