'use client'
import Navbar from '@/components/layout/Navbar'
import { TurnosHero, TurnosFormulario } from '@/components/sections'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function TurnosPage() {
  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden'>
      <Navbar />
      <TurnosHero />
      <TurnosFormulario />
      <WhatsAppButton />
    </div>
  )
}
