'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 py-2 transition-colors duration-300 ${
        scrolled ? 'bg-black border-b border-gray-800/50' : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex items-center justify-between h-24'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/'>
              <Image
                src='/images/header/LOGO GTM.png'
                alt='GTM Logo'
                width={78}
                height={78}
                className='w-24 h-24 rounded-full object-cover mr-8'
              />
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <div className='hidden lg:flex items-center space-x-8 h-full flex-1 justify-center'>
            <Link
              href='/servicios'
              className='relative text-white hover:text-red-500 px-4 h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 group whitespace-nowrap'
            >
              SERVICIOS
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
            </Link>
            <Link
              href='/sobre-nosotros'
              className='relative text-white hover:text-red-500 px-4 h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 group whitespace-nowrap'
            >
              SOBRE NOSOTROS
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
            </Link>
            <Link
              href='#reservar-turnos'
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-semibold tracking-wide rounded-lg transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap ml-4'
            >
              RESERVAR TURNOS
            </Link>
            <Link
              href='/contacto'
              className='relative text-white hover:text-red-500 px-4 h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 group whitespace-nowrap'
            >
              CONTACTO
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='lg:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-white hover:text-red-500 focus:outline-none focus:text-red-500 p-2'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='lg:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-md border-t border-gray-800/50'>
              <Link
                href='#servicios'
                className='text-white hover:text-red-500 block px-3 py-2 text-sm font-semibold tracking-wide transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                SERVICIOS
              </Link>
              <Link
                href='#sobre-nosotros'
                className='text-white hover:text-red-500 block px-3 py-2 text-sm font-semibold tracking-wide transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                SOBRE NOSOTROS
              </Link>
              <Link
                href='#reservar-turnos'
                className='bg-red-600 hover:bg-red-700 text-white block px-3 py-2 text-sm font-semibold tracking-wide rounded-lg transition-colors mx-3 mt-2'
                onClick={() => setIsMenuOpen(false)}
              >
                RESERVAR TURNOS
              </Link>
              <Link
                href='/contacto'
                className='text-white hover:text-red-500 block px-3 py-2 text-sm font-semibold tracking-wide transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACTO
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
