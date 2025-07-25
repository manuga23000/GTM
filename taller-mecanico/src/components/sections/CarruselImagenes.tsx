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
    <section className='py-12 bg-white'>
      <div className='max-w-4xl mx-auto flex flex-col items-center'>
        <div className='flex items-center gap-4'>
          <button
            onClick={anterior}
            className='text-red-600 text-3xl font-bold'
          >
            &lt;
          </button>
          <div className='flex gap-4'>
            {imagenes.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`Imagen taller ${idx + 1}`}
                className={`w-56 h-40 object-cover rounded-xl border-4 ${
                  idx === actual ? 'border-red-600' : 'border-transparent'
                } transition-all`}
                style={{
                  display: Math.abs(idx - actual) <= 1 ? 'block' : 'none',
                }}
              />
            ))}
          </div>
          <button
            onClick={siguiente}
            className='text-red-600 text-3xl font-bold'
          >
            &gt;
          </button>
        </div>
        <div className='mt-4 flex gap-2'>
          {imagenes.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx === actual ? 'bg-red-600' : 'bg-gray-300'
              }`}
            ></span>
          ))}
        </div>
      </div>
    </section>
  )
}
