'use client'
import React from 'react'

interface AdminHeroProps {
  children: React.ReactNode
}

export default function AdminHero({ children }: AdminHeroProps) {
  return (
    <section
      className='relative min-h-screen flex items-center justify-center'
      style={{
        backgroundImage: "url('/images/turnos/turnos.png')",
        backgroundSize: 'cover',
        backgroundPosition: '80% center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            background-position: right center !important;
            background-attachment: scroll !important;
            min-height: 100vh !important;
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
            align-items: center !important;
          }
        }
      `}</style>
      <div className='absolute inset-0 bg-black/80 z-0'></div>
      <div className='relative z-10 flex items-start sm:items-center justify-center h-full w-full px-2 sm:px-4 py-2 sm:py-0 overflow-y-auto sm:overflow-hidden'>
        {children}
      </div>
    </section>
  )
}
