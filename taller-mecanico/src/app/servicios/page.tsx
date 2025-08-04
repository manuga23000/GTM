'use client'
import Navbar from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import {
  BookingSection,
  ContactanosHoyMismo,
  ServiciosHero,
  ServiciosBasicos,
  ServiciosPrincipales,
  ProgramacionModulos,
  CapacitacionTecnica,
} from '@/components/sections'

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
