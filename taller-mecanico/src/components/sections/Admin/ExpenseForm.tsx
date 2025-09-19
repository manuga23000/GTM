'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Transaction } from '@/actions/types/types'

type CategoryType = 'expense' | 'income'

interface ExpenseFormProps {
  newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  setNewTransaction: React.Dispatch<
    React.SetStateAction<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  >
  categories: Record<CategoryType, string[]>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
}

export default function ExpenseForm({
  newTransaction,
  setNewTransaction,
  categories,
  handleSubmit,
  isSubmitting,
}: ExpenseFormProps) {
  return (
    <div className='max-w-2xl mx-auto'>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='bg-gray-800 p-8 rounded-xl shadow-xl'
      >
        <h3 className='text-2xl font-bold mb-6 text-center text-white'>
          Agregar Movimiento
        </h3>

        <div className='space-y-6'>
          {/* Tipo */}
          <div>
            <label className='block text-sm font-medium mb-2 text-white'>
              Tipo de Movimiento
            </label>
            <div className='flex gap-4'>
              {(['expense', 'income'] as const).map(type => (
                <motion.button
                  key={type}
                  type='button'
                  disabled={isSubmitting}
                  onClick={() =>
                    setNewTransaction({
                      ...newTransaction,
                      type,
                      category: '',
                    })
                  }
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    newTransaction.type === type
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
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-white'>
              Categoría
            </label>
            <select
              value={newTransaction.category}
              onChange={e =>
                setNewTransaction({
                  ...newTransaction,
                  category: e.target.value,
                })
              }
              disabled={isSubmitting}
              className={`w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-700 hover:bg-gray-650'
              }`}
              required
            >
              <option value=''>Seleccionar categoría</option>
              {(categories[newTransaction.type as CategoryType] || []).map(
                (cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
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
              value={
                newTransaction.amount === 0
                  ? ''
                  : newTransaction.amount.toString()
              }
              onChange={e => {
                const value = e.target.value

                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  const numericValue = value === '' ? 0 : parseFloat(value)
                  setNewTransaction({
                    ...newTransaction,
                    amount: isNaN(numericValue) ? 0 : numericValue,
                  })
                }
              }}
              onBlur={e => {
                const value = parseFloat(e.target.value) || 0
                setNewTransaction({
                  ...newTransaction,
                  amount: parseFloat(value.toFixed(2)),
                })
              }}
              className={`w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-700 hover:bg-gray-650'
              }`}
              placeholder='0.00'
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
              value={newTransaction.date}
              onChange={e =>
                setNewTransaction({
                  ...newTransaction,
                  date: e.target.value,
                })
              }
              className={`w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-700 hover:bg-gray-650'
              }`}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`relative w-full py-4 font-bold rounded-lg transition-all duration-300 overflow-hidden ${
              isSubmitting
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {/* Loading background animation */}
            {isSubmitting && (
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
              />
            )}

            {/* Button content */}
            <div className='relative flex items-center justify-center space-x-2'>
              {isSubmitting ? (
                <>
                  {/* Cool spinning loader */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='w-5 h-5 border-2 border-white border-t-transparent rounded-full'
                  />
                  <motion.span
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className='text-white font-medium'
                  >
                    Procesando...
                  </motion.span>
                  {/* Floating dots animation */}
                  <div className='flex space-x-1'>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: 'easeInOut',
                        }}
                        className='w-1.5 h-1.5 bg-white rounded-full'
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <span className='text-white'>Agregar Movimiento</span>
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className='text-xl'
                  >
                    ✨
                  </motion.span>
                </>
              )}
            </div>

            {/* Subtle pulse effect when loading */}
            {isSubmitting && (
              <motion.div
                className='absolute inset-0 bg-white'
                animate={{
                  opacity: [0, 0.1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
