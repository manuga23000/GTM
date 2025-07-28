'use client'
import Navbar from '@/components/layout/Navbar'
import ContactoHero from '@/components/sections/ContactoHero'
import ContactoInfo from '@/components/sections/ContactoInfo'
import ContactoFormulario from '@/components/sections/ContactoFormulario'

export default function ContactoPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <ContactoHero />
      <ContactoInfo />
      <ContactoFormulario />
    </div>
  )
}
