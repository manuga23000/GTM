import {
  HeroSobreNosotros,
  ConoceLoQueNosDestaca,
  CarruselImagenes,
  TrabajaConNosotros,
  MartinGrandoli,
  ContactanosHoyMismo,
  BookingSection,
} from '@/components/sections'
import Navbar from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function SobreNosotrosPage() {
  return (
    <div className='min-h-screen bg-white text-black'>
      <Navbar />
      <HeroSobreNosotros />
      <ConoceLoQueNosDestaca />
      <CarruselImagenes />
      <TrabajaConNosotros />
      <MartinGrandoli />
      <ContactanosHoyMismo />
      <BookingSection />
      <WhatsAppButton />
    </div>
  )
}
