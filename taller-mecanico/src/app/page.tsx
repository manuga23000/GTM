'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import QualitySolutions from '@/components/sections/QualitySolutions'
import ServiciosParticulares from '@/components/sections/ServiciosParticulares'
import ServiciosEmpresariales from '@/components/sections/ServiciosEmpresariales'
import Marcas from '@/components/sections/Marcas'
import ServiciosEspecializados from '@/components/sections/ServiciosEspecializados'
import ContactanosHoyMismo from '@/components/sections/ContactanosHoyMismo'
import BookingSection from '@/components/sections/BookingSection'
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
