'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const isSeguimientoPage = pathname.startsWith('/seguimiento') || pathname.startsWith('/desarrollo')

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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScrollClose = () => {
      if (isMenuOpen) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setIsMenuOpen(false)
        }, 100)
      }
    }

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScrollClose, { passive: true })
      return () => {
        window.removeEventListener('scroll', handleScrollClose)
        clearTimeout(timeoutId)
      }
    }
  }, [isMenuOpen])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = originalOverflow
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMenuOpen])

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut' as const,
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  }

  const buttonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 },
  }

  const getNavbarBackground = () => {
    if (isSeguimientoPage) {
      return 'bg-black border-b border-gray-800/50'
    }
    return scrolled ? 'bg-black border-b border-gray-800/50' : 'bg-transparent'
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 py-2 transition-colors duration-300 ${getNavbarBackground()}`}
    >
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex items-center justify-between h-14 lg:h-24'>
          <div className='flex items-center'>
            <Link href='/'>
              <Image
                src='/images/header/LOGO GTM.png'
                alt='GTM Logo'
                width={78}
                height={78}
                className='w-14 h-14 lg:w-24 lg:h-24 rounded-full object-cover mr-4 lg:mr-8'
              />
            </Link>
          </div>

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
              href='/turnos'
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

            <Link
              href='/seguimiento'
              className='relative text-white hover:text-red-500 px-4 h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 group whitespace-nowrap'
            >
              SEGUIMIENTO
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
            </Link>
            <Link
              href='/desarrollo'
              className='relative text-white hover:text-red-500 px-4 h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 group whitespace-nowrap'
            >
              DESARROLLO
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></span>
            </Link>
          </div>

          <div className='lg:hidden'>
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-white hover:text-red-500 focus:outline-none focus:text-red-500 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 relative z-50'
              variants={buttonVariants}
              animate={isMenuOpen ? 'open' : 'closed'}
              transition={{ duration: 0.3 }}
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
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className='lg:hidden overflow-hidden'
              variants={menuVariants}
              initial='closed'
              animate='open'
              exit='closed'
            >
              <div className='px-4 pt-4 pb-6 space-y-3 bg-gradient-to-b from-black/98 to-black/95 backdrop-blur-xl border-t border-red-500/30 shadow-2xl rounded-b-2xl'>
                <motion.div variants={menuItemVariants}>
                  <Link
                    href='/servicios'
                    className='flex items-center justify-between text-white hover:text-red-400 px-4 py-4 text-base font-semibold tracking-wide transition-all duration-300 rounded-xl hover:bg-white/10 active:bg-white/20 group'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>SERVICIOS</span>
                    <svg
                      className='w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    href='/sobre-nosotros'
                    className='flex items-center justify-between text-white hover:text-red-400 px-4 py-4 text-base font-semibold tracking-wide transition-all duration-300 rounded-xl hover:bg-white/10 active:bg-white/20 group'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>SOBRE NOSOTROS</span>
                    <svg
                      className='w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants} className='pt-2'>
                  <Link
                    href='/turnos'
                    className='flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 text-base font-bold tracking-wide rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    RESERVAR TURNOS
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    href='/contacto'
                    className='flex items-center justify-between text-white hover:text-red-400 px-4 py-4 text-base font-semibold tracking-wide transition-all duration-300 rounded-xl hover:bg-white/10 active:bg-white/20 group'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>CONTACTO</span>
                    <svg
                      className='w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    href='/seguimiento'
                    className='flex items-center justify-between text-white hover:text-red-400 px-4 py-4 text-base font-semibold tracking-wide transition-all duration-300 rounded-xl hover:bg-white/10 active:bg-white/20 group'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>SEGUIMIENTO</span>
                    <svg
                      className='w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link
                    href='/desarrollo'
                    className='flex items-center justify-between text-white hover:text-red-400 px-4 py-4 text-base font-semibold tracking-wide transition-all duration-300 rounded-xl hover:bg-white/10 active:bg-white/20 group'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>DESARROLLO</span>
                    <svg
                      className='w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
