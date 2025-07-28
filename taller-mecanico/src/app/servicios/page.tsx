'use client'
import Navbar from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import BookingSection from '@/components/sections/BookingSection'
import ContactanosHoyMismo from '@/components/sections/ContactanosHoyMismo'
import ServiciosHero from '@/components/sections/ServiciosHero'
import ServiciosBasicos from '@/components/sections/ServiciosBasicos'
import ServiciosPrincipales from '@/components/sections/ServiciosPrincipales'
import ProgramacionModulos from '@/components/sections/ProgramacionModulos'
import CapacitacionTecnica from '@/components/sections/CapacitacionTecnica'

export default function ServiciosPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <ServiciosHero />
      <ServiciosBasicos />
      <ServiciosPrincipales />
      <ProgramacionModulos />
      <CapacitacionTecnica />
      <ContactanosHoyMismo />
      <BookingSection />
      <WhatsAppButton />
    </div>
  )
}
