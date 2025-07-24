'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function Hero() {
  const [underline, setUnderline] = useState(false)
  const [showLine, setShowLine] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setUnderline(true)
      setShowLine(false)
      setTimeout(() => {
        setUnderline(false)
        setShowLine(true)
      }, 1200)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className='relative pt-28 min-h-screen flex items-center'
      style={{
        backgroundImage: "url('/images/home/hero-engine.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay para legibilidad del texto */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50'></div>

      <div className='relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-8'>
            <div className='space-y-4'>
              <p className='text-red-500 text-lg font-medium italic'>
                Tu Aliado En Soluciones Automotrices
              </p>
              <h1 className='text-5xl md:text-7xl font-bold leading-tight'>
                MANTENIMIENTO
                <br />
                Y REPARACIÓN
                <br />
                CON
                <br />
                <span className='text-red-500 relative inline-block w-full pb-2'>
                  EXPERIENCIA
                </span>
              </h1>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Button variant='primary' size='lg'>
                RESERVAR TURNO
              </Button>
              <Button variant='outline' size='lg'>
                CONOCER MÁS
              </Button>
            </div>
          </div>

          {/* Right Content - Hidden on mobile, visible on large screens */}
          <div className='hidden lg:block'></div>
        </div>
      </div>

      <style jsx>{`
        /* Elimino estilos relacionados al subrayado animado */
      `}</style>
    </section>
  )
}
