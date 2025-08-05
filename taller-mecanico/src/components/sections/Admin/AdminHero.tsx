'use client'
import React from 'react'

interface AdminHeroProps {
  children: React.ReactNode
}

export default function AdminHero({ children }: AdminHeroProps) {
  return (
    <section
      className='relative min-h-[100vh] flex items-center justify-center'
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
            min-height: 81vh !important;
            padding-top: 11rem !important;
            padding-bottom: 5rem !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
      <div className='absolute inset-0 bg-black/80 z-0'></div>
      <div className='relative z-10 flex items-center justify-center min-h-screen'>
        {children}
      </div>
    </section>
  )
}
