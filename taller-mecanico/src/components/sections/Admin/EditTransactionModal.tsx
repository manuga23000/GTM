'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Transaction } from '@/actions/types/types'

interface EditTransactionModalProps {
  transaction: Transaction
  categories: Record<'expense' | 'income', string[]>
  onSave: (id: string, updateData: Partial<Transaction>) => void
  onCancel: () => void
}

export default function EditTransactionModal({
  transaction,
  categories,
  onSave,
  onCancel,
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    type: transaction.type,
    category: transaction.category,
    amount: Math.abs(transaction.amount),
    date: transaction.date,
    description: transaction.description || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: Math.abs(transaction.amount),
      date: transaction.date,
      description: transaction.description || '',
    })
  }, [transaction])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category.trim()) {
      alert('Por favor seleccione una categoría')
      return
    }

    const amount = Number(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido mayor a cero')
      return
    }

    if (!formData.date) {
      alert('Por favor seleccione una fecha')
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        type: formData.type,
        category: formData.category,
        amount:
          formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        date: formData.date,
        description: formData.description || formData.category,
      }

      await onSave(transaction.id!, updateData)
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Error al actualizar la transacción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setFormData({
      ...formData,
      type: newType,
      category: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onCancel()
        }
      }}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className='relative bg-gray-800 rounded-xl shadow-2xl w-full mx-4 sm:mx-6 max-w-2xl z-10'
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className='flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 bg-gray-800 rounded-t-xl'>
          <h3 className='text-xl sm:text-2xl font-bold text-white'>
            Editar Movimiento
          </h3>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-white transition-colors p-1'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Contenido con scroll */}
        <div
          className='overflow-y-auto p-4 sm:p-6'
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
            {/* Tipo */}
            <div>
              <label className='block text-sm font-medium mb-2 text-white'>
                Tipo de Movimiento
              </label>
              <div className='flex gap-2 sm:gap-4'>
                {(['expense', 'income'] as const).map(type => (
                  <motion.button
                    key={type}
                    type='button'
                    disabled={isSubmitting}
                    onClick={() => handleTypeChange(type)}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      formData.type === type
                        ? type === 'expense'
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                        : isSubmitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {type === 'expense' ? 'Gasto' : 'Ingreso'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className='block text-sm font-medium mb-2 text-white'>
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                disabled={isSubmitting}
                className={`w-full p-2 sm:p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-650'
                }`}
                required
              >
                <option value=''>Seleccionar categoría</option>
                {categories[formData.type].map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto */}
            <div>
              <label className='block text-sm font-medium mb-2 text-white'>
                Monto (ARS)
              </label>
              <input
                type='text'
                inputMode='decimal'
                disabled={isSubmitting}
                value={formData.amount === 0 ? '' : formData.amount.toString()}
                onChange={e => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    const numericValue = value === '' ? 0 : parseFloat(value)
                    setFormData({
                      ...formData,
                      amount: isNaN(numericValue) ? 0 : numericValue,
                    })
                  }
                }}
                onBlur={e => {
                  const value = parseFloat(e.target.value) || 0
                  setFormData({
                    ...formData,
                    amount: parseFloat(value.toFixed(2)),
                  })
                }}
                className={`w-full p-2 sm:p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-650'
                }`}
                placeholder='0.00'
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className='block text-sm font-medium mb-2 text-white'>
                Fecha
              </label>
              <input
                type='date'
                disabled={isSubmitting}
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full p-2 sm:p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-650'
                }`}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className='block text-sm font-medium mb-2 text-white'>
                Descripción (Opcional)
              </label>
              <textarea
                disabled={isSubmitting}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`w-full p-2 sm:p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all resize-none text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-650'
                }`}
                rows={3}
                placeholder='Descripción adicional del movimiento...'
              />
            </div>
          </form>
        </div>

        {/* Footer con botones fijos */}
        <div className='p-4 sm:p-6 border-t border-gray-700 bg-gray-800 rounded-b-xl'>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
            <motion.button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='flex-1 py-2 sm:py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              Cancelar
            </motion.button>

            <motion.button
              type='submit'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2 sm:py-3 px-4 font-medium rounded-lg transition-all text-sm sm:text-base ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className='flex items-center justify-center space-x-2'>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'
                  />
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
