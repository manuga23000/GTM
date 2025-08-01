'use client'
import Navbar from '@/components/layout/Navbar'
import {
  ContactoHero,
  ContactoInfo,
  ContactoFormulario,
} from '@/components/sections'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function ContactoPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <ContactoHero />
      <ContactoInfo />
      <ContactoFormulario />
      <WhatsAppButton />
    </div>
  )
}
