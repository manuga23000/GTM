'use client'
import React, { useState } from 'react'
import TestSections from '@/components/sections/Test/TestSections'
import TestModal from '@/components/sections/Test/TestModal'

export default function TesteoPage() {
  // ✅ ESTADO CENTRALIZADO PARA TODOS LOS MODALES
  const [showModal1, setShowModal1] = useState(false)
  const [showModal2, setShowModal2] = useState(false)
  const [showModal3, setShowModal3] = useState(false)

  const modalProps = {
    showModal1,
    setShowModal1,
    showModal2,
    setShowModal2,
    showModal3,
    setShowModal3,
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Header simple */}

      {/* Contenido principal */}
      <main className='pt-20'>
        <TestSections {...modalProps} />
        <TestModal {...modalProps} />
      </main>
    </div>
  )
}
