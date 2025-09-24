'use client'
import Navbar from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import HeroDesarrollo from '@/components/sections/Desarrollo/HeroDesarrollo'
import React from 'react'

export default function DesarrolloPage() {
  return (
    <div className='bg-black text-white'>
      <Navbar />
      <main className='flex flex-col gap-12 items-center justify-center px-2 sm:px-4 mt-20 w-full bg-gradient-to-b from-black via-gray-900 to-black'>
        <HeroDesarrollo />
      </main>
      <WhatsAppButton />
    </div>
  )
}
