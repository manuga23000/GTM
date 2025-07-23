'use client'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import QualitySolutions from '@/components/sections/QualitySolutions'
import ServiciosParticulares from '@/components/sections/ServiciosParticulares'
import ServiciosEmpresariales from '@/components/sections/ServiciosEmpresariales'
import BookingSection from '@/components/sections/BookingSection'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function Home() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <Hero />
      <QualitySolutions />
      <ServiciosParticulares />
      <ServiciosEmpresariales />
      <BookingSection />
      <WhatsAppButton />
    </div>
  )
}
