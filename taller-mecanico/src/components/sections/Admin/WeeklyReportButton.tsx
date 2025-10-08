// src/components/sections/Admin/WeeklyReportButton.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateWeeklyPDF } from '@/actions/utils/pdfGenerator'

interface WeeklyReportButtonProps {
  onMessage?: (message: string) => void
}

export default function WeeklyReportButton({
  onMessage,
}: WeeklyReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const getDateRange = (option: 'last-week' | 'this-week' | 'custom') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (option === 'last-week') {
      // Semana pasada (lunes a domingo)
      const lastMonday = new Date(today)
      lastMonday.setDate(today.getDate() - today.getDay() - 6) // Lunes de la semana pasada

      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6) // Domingo de la semana pasada

      return { startDate: lastMonday, endDate: lastSunday }
    } else if (option === 'this-week') {
      // Esta semana (lunes a hoy)
      const thisMonday = new Date(today)
      thisMonday.setDate(today.getDate() - today.getDay() + 1) // Lunes de esta semana

      return { startDate: thisMonday, endDate: today }
    }

    return { startDate: today, endDate: today }
  }

  const generateReport = async (option: 'last-week' | 'this-week') => {
    setIsGenerating(true)
    setShowOptions(false)
    onMessage?.('Generando reporte...')

    try {
      const { startDate, endDate } = getDateRange(option)

      // Ajustar fechas para incluir todo el día
      const startTimestamp = new Date(startDate)
      startTimestamp.setHours(0, 0, 0, 0)

      const endTimestamp = new Date(endDate)
      endTimestamp.setHours(23, 59, 59, 999)

      // Obtener vehículos ingresados
      const vehiclesInRef = collection(db, 'vehicles')
      const vehiclesInQuery = query(
        vehiclesInRef,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      )

      const vehiclesInSnapshot = await getDocs(vehiclesInQuery)
      const vehiclesIn = vehiclesInSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          plateNumber: data.plateNumber || doc.id,
          brand: data.brand || 'Sin marca',
          model: data.model || 'Sin modelo',
          year: data.year || new Date().getFullYear(),
          clientName: data.clientName || 'Cliente',
          clientPhone: data.clientPhone,
          serviceType: data.serviceType,
          entryDate: data.createdAt?.toDate() || new Date(),
          estimatedCompletionDate: data.estimatedCompletionDate?.toDate(),
          status: 'En proceso',
          km: data.km,
        }
      })

      // Obtener vehículos finalizados/entregados
      const historialRef = collection(db, 'timeline') // Cambiar 'historial' → 'timeline'
      const vehiclesOutQuery = query(
        historialRef,
        where('finalizedAt', '>=', startTimestamp), // Cambiar a Date en vez de ISO string
        where('finalizedAt', '<=', endTimestamp),
        orderBy('finalizedAt', 'desc')
      )

      const vehiclesOutSnapshot = await getDocs(vehiclesOutQuery)
      const vehiclesOut = vehiclesOutSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          plateNumber: data.plateNumber || 'Sin patente', // Cambiar 'patente' → 'plateNumber'
          brand: data.brand || 'Sin marca', // Cambiar 'marca' → 'brand'
          model: data.model || 'Sin modelo', // Cambiar 'modelo' → 'model'
          year: data.year || new Date().getFullYear(), // Ya es number, no hace falta parseInt
          clientName: data.clientName || 'Cliente', // Cambiar 'cliente' → 'clientName'
          clientPhone: data.clientPhone, // Cambiar 'telefono' → 'clientPhone'
          serviceType: data.serviceType, // Cambiar 'tipoServicio' → 'serviceType'
          entryDate:
            data.entryDate?.toDate?.() ||
            data.createdAt?.toDate?.() ||
            new Date(),
          finalizedAt: data.finalizedAt?.toDate?.() || new Date(),
          status: 'Finalizado',
          km: data.km,
        }
      })

      // Generar PDF
      generateWeeklyPDF({
        vehiclesIn,
        vehiclesOut,
        startDate,
        endDate,
      })

      onMessage?.(
        `✅ Reporte generado: ${vehiclesIn.length} ingresos, ${vehiclesOut.length} entregas`
      )
    } catch (error) {
      console.error('Error generando reporte:', error)
      onMessage?.('❌ Error al generar el reporte')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='relative'>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowOptions(!showOptions)}
        disabled={isGenerating}
        className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isGenerating ? (
          <>
            <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            Generando...
          </>
        ) : (
          <>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z'
                clipRule='evenodd'
              />
            </svg>
            <span className='hidden sm:inline'>Generar Reporte PDF</span>
            <span className='sm:hidden'>Reporte PDF</span>
          </>
        )}
      </motion.button>

      {showOptions && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 min-w-[200px]'
        >
          <button
            onClick={() => generateReport('last-week')}
            className='w-full text-left px-4 py-3 hover:bg-gray-700 text-white transition-colors text-sm flex items-center gap-2'
          >
            <span>📅</span>
            <div>
              <div className='font-semibold'>Semana pasada</div>
              <div className='text-xs text-gray-400'>Lun-Dom anterior</div>
            </div>
          </button>

          <button
            onClick={() => generateReport('this-week')}
            className='w-full text-left px-4 py-3 hover:bg-gray-700 text-white transition-colors text-sm border-t border-gray-700 flex items-center gap-2'
          >
            <span>📆</span>
            <div>
              <div className='font-semibold'>Esta semana</div>
              <div className='text-xs text-gray-400'>Lunes a hoy</div>
            </div>
          </button>
        </motion.div>
      )}
    </div>
  )
}
