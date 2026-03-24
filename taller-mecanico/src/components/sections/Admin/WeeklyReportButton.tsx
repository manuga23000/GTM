'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateWeeklyPDF } from '@/actions/utils/pdfGenerator'
import { FileDown, Loader2 } from 'lucide-react'

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
      const lastMonday = new Date(today)
      lastMonday.setDate(today.getDate() - today.getDay() - 6)
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6)
      return { startDate: lastMonday, endDate: lastSunday }
    } else if (option === 'this-week') {
      const thisMonday = new Date(today)
      thisMonday.setDate(today.getDate() - today.getDay() + 1)
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

      const startTimestamp = new Date(startDate)
      startTimestamp.setHours(0, 0, 0, 0)

      const endTimestamp = new Date(endDate)
      endTimestamp.setHours(23, 59, 59, 999)

      const vehiclesInRef = collection(db, 'vehicles')
      const vehiclesInQuery = query(
        vehiclesInRef,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      )

      const vehiclesInSnapshot = await getDocs(vehiclesInQuery)
      const vehiclesInFromVehicles = vehiclesInSnapshot.docs.map(doc => {
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

      const historialIngresosSemanaRef = collection(db, 'timeline')
      const historialIngresosSemanaQuery = query(
        historialIngresosSemanaRef,
        where('entryDate', '>=', startTimestamp),
        where('entryDate', '<=', endTimestamp),
        orderBy('entryDate', 'desc')
      )

      const historialIngresosSnapshot = await getDocs(
        historialIngresosSemanaQuery
      )
      const vehiclesInFromTimeline = historialIngresosSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          plateNumber: data.plateNumber || 'Sin patente',
          brand: data.brand || 'Sin marca',
          model: data.model || 'Sin modelo',
          year: data.year || new Date().getFullYear(),
          clientName: data.clientName || 'Cliente',
          clientPhone: data.clientPhone,
          serviceType: data.serviceType,
          entryDate:
            data.entryDate?.toDate?.() ||
            data.createdAt?.toDate?.() ||
            new Date(),
          estimatedCompletionDate: data.estimatedCompletionDate?.toDate(),
          status: 'Finalizado',
          km: data.km,
        }
      })

      const vehiclesIn = [
        ...vehiclesInFromVehicles,
        ...vehiclesInFromTimeline,
      ].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime())

      const vehiclesOutQuery = query(
        collection(db, 'timeline'),
        where('finalizedAt', '>=', startTimestamp),
        where('finalizedAt', '<=', endTimestamp),
        orderBy('finalizedAt', 'desc')
      )

      const vehiclesOutSnapshot = await getDocs(vehiclesOutQuery)

      const vehiclesOut = vehiclesOutSnapshot.docs
        .map(doc => {
          const data = doc.data()
          return {
            plateNumber: data.plateNumber || 'Sin patente',
            brand: data.brand || 'Sin marca',
            model: data.model || 'Sin modelo',
            year: data.year || new Date().getFullYear(),
            clientName: data.clientName || 'Cliente',
            clientPhone: data.clientPhone,
            serviceType: data.serviceType,
            entryDate:
              data.entryDate?.toDate?.() ||
              data.createdAt?.toDate?.() ||
              new Date(),
            finalizedAt: data.finalizedAt?.toDate?.() || new Date(),
            status: 'Finalizado',
            km: data.km,
          }
        })
        .sort((a, b) => a.finalizedAt.getTime() - b.finalizedAt.getTime())

      const allVehiclesInWorkshopQuery = query(
        collection(db, 'vehicles'),
        orderBy('createdAt', 'desc')
      )

      const allVehiclesInWorkshopSnapshot = await getDocs(
        allVehiclesInWorkshopQuery
      )
      const vehiclesInWorkshop = allVehiclesInWorkshopSnapshot.docs.map(doc => {
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

      generateWeeklyPDF({
        vehiclesIn,
        vehiclesOut,
        vehiclesInWorkshop,
        startDate,
        endDate,
      })

      onMessage?.(
        `✅ Reporte generado: ${vehiclesIn.length} ingresos, ${vehiclesOut.length} entregas, ${vehiclesInWorkshop.length} en taller`
      )
    } catch (error) {
      console.error('Error generando reporte:', error)
      onMessage?.('❌ Error al generar el reporte')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='relative z-10'>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => generateReport('this-week')}
        disabled={isGenerating}
        className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
      >
        {isGenerating ? (
          <>
            <Loader2 className='h-5 w-5 animate-spin' strokeWidth={2} />
            Generando...
          </>
        ) : (
          <>
            <FileDown className='h-5 w-5' strokeWidth={2} />
            <span>Generar reporte semanal</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
