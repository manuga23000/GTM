'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import {
  Hero,
  QualitySolutions,
  ServiciosParticulares,
  ServiciosEmpresariales,
  Marcas,
  ServiciosEspecializados,
  ContactanosHoyMismo,
  BookingSection,
} from '@/components/sections'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
          duration={3000}
        />
      )}

      <div className='min-h-screen bg-black text-white'>
        <Navbar />
        <Hero />
        <QualitySolutions />
        <ServiciosParticulares />
        <ServiciosEmpresariales />
        <Marcas />
        <ServiciosEspecializados />
        <ContactanosHoyMismo />
        <BookingSection />
        <WhatsAppButton />
      </div>
    </>
  )
}
