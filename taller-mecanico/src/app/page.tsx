'use client'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import QualitySolutions from '@/components/sections/QualitySolutions'
import Services from '@/components/sections/Services'
import BookingSection from '@/components/sections/BookingSection'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function Home() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <Hero />
      <QualitySolutions />
      <Services />
      <BookingSection />
      <WhatsAppButton />
    </div>
  )
}
