'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Transaction } from '@/actions/types/types'
import { Plus } from 'lucide-react'

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
        className='bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl'
      >
        <h3 className='text-xl font-bold mb-6 text-center text-white'>
          Agregar Movimiento
        </h3>

        <div className='space-y-5'>
          {/* Tipo */}
          <div>
            <label className='block text-sm font-medium mb-2 text-zinc-300'>
              Tipo de Movimiento
            </label>
            <div className='flex gap-3'>
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
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm ${
                    newTransaction.type === type
                      ? type === 'expense'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-emerald-600 text-white shadow-md'
                      : isSubmitting
                      ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
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
            <label className='block text-sm font-medium text-zinc-300'>
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
              className={`w-full p-3 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:outline-none text-white transition-all text-sm ${
                isSubmitting
                  ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                  : 'bg-zinc-900 hover:border-zinc-600'
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
            <label className='block text-sm font-medium mb-2 text-zinc-300'>
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
              className={`w-full p-3 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all text-sm ${
                isSubmitting
                  ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                  : 'bg-zinc-900 hover:border-zinc-600'
              }`}
              placeholder='0.00'
            />
          </div>

          {/* Fecha */}
          <div>
            <label className='block text-sm font-medium mb-2 text-zinc-300'>
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
              className={`w-full p-3 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:outline-none text-white transition-all text-sm ${
                isSubmitting
                  ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                  : 'bg-zinc-900 hover:border-zinc-600'
              }`}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`relative w-full py-3.5 font-bold rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 cursor-not-allowed text-zinc-900'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-900 shadow-lg shadow-amber-900/30'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {/* Loading background animation */}
            {isSubmitting && (
              <motion.div
                className='absolute inset-0'
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className='w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full'
                  />
                  <motion.span
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className='text-zinc-900 font-bold'
                  >
                    Procesando...
                  </motion.span>
                  <div className='flex space-x-1'>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                        className='w-1.5 h-1.5 bg-zinc-900 rounded-full'
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Plus className='w-5 h-5' strokeWidth={2.5} />
                  <span className='text-zinc-900 font-bold'>Agregar Movimiento</span>
                </>
              )}
            </div>

            {isSubmitting && (
              <motion.div
                className='absolute inset-0 bg-white'
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
