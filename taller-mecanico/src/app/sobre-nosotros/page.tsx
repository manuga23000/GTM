import HeroSobreNosotros from '@/components/sections/HeroSobreNosotros'
import ConoceLoQueNosDestaca from '@/components/sections/ConoceLoQueNosDestaca'
import CarruselImagenes from '@/components/sections/CarruselImagenes'
import TrabajaConNosotros from '@/components/sections/TrabajaConNosotros'
import MartinGrandoli from '@/components/sections/MartinGrandoli'
import ContactanosHoyMismo from '@/components/sections/ContactanosHoyMismo'
import BookingSection from '@/components/sections/BookingSection'
import Navbar from '@/components/layout/Navbar'

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
    </div>
  )
}
