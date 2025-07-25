'use client'
import React, { useState } from 'react'

const imagenes = [
  '/images/sobrenosotros/carru1.jpg',
  '/images/sobrenosotros/carru2.jpg',
  '/images/sobrenosotros/carru3.jpg',
  '/images/sobrenosotros/carru4.jpg',
  '/images/sobrenosotros/carru5.jpg',
  '/images/sobrenosotros/carru6.jpg',
  '/images/sobrenosotros/carru7.jpg',
  '/images/sobrenosotros/carru8.jpg',
]

export default function CarruselImagenes() {
  const [actual, setActual] = useState(0)
  const total = imagenes.length

  const siguiente = () => setActual((actual + 1) % total)
  const anterior = () => setActual((actual - 1 + total) % total)

  return (
    <section
      className='py-4'
      style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #ffe5e5 100%)',
      }}
    >
      <div className='max-w-5xl mx-auto flex flex-col items-center'>
        <div className='flex flex-col items-center w-full'>
          {/* Espacio extra entre camioneta y carrusel eliminado */}
          <div className='flex items-center gap-6 mb-4'>
            <button
              onClick={anterior}
              className='rounded-full bg-white shadow-lg border-2 border-red-200 hover:bg-red-600 hover:text-white text-red-600 text-3xl font-bold w-12 h-12 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400'
              aria-label='Anterior'
              style={{ cursor: 'pointer' }}
            >
              &lt;
            </button>
            <div className='flex gap-6 items-center min-h-[180px]'>
              {imagenes.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt={`Imagen taller ${idx + 1}`}
                  className={`w-72 max-w-full h-48 object-cover rounded-2xl shadow-2xl border-4 transition-all duration-700 ease-in-out ${
                    idx === actual
                      ? 'border-red-600 scale-105 opacity-100 z-10'
                      : 'border-transparent scale-90 z-0'
                  }`}
                  style={{
                    display:
                      Math.abs(idx - actual) <= 1 ||
                      (idx === 0 && actual === total - 1) ||
                      (idx === total - 1 && actual === 0)
                        ? 'block'
                        : 'none',
                  }}
                />
              ))}
            </div>
            <button
              onClick={siguiente}
              className='rounded-full bg-white shadow-lg border-2 border-red-200 hover:bg-red-600 hover:text-white text-red-600 text-3xl font-bold w-12 h-12 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400'
              aria-label='Siguiente'
              style={{ cursor: 'pointer' }}
            >
              &gt;
            </button>
          </div>
        </div>
        <div className='mt-6 flex gap-3'>
          {imagenes.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setActual(idx)}
              className={`h-4 w-4 rounded-full border-2 border-red-200 transition-all duration-300 cursor-pointer ${
                idx === actual
                  ? 'bg-red-600 scale-110 shadow-lg border-red-600'
                  : 'bg-gray-300 scale-90'
              }`}
              style={{
                boxShadow: idx === actual ? '0 0 10px #dc2626aa' : 'none',
              }}
            ></span>
          ))}
        </div>
      </div>
    </section>
  )
}
