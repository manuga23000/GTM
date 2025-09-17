'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction } from '@/actions/types/types'
import EditTransactionModal from './EditTransactionModal'
import { updateTransaction, deleteTransaction } from '@/actions/gastos'

interface TransactionTableProps {
  expenses: Transaction[]
  formatCurrencyLocal: (amount: number) => string
  onTransactionUpdated: () => void
  categories: Record<'expense' | 'income', string[]>
}

export default function TransactionTable({
  expenses,
  formatCurrencyLocal,
  onTransactionUpdated,
  categories,
}: TransactionTableProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditModal(true)
  }

  const handleUpdateTransaction = async (
    id: string,
    updateData: Partial<Transaction>
  ) => {
    try {
      const result = await updateTransaction(id, updateData)
      if (result.success) {
        onTransactionUpdated()
        setShowEditModal(false)
        setEditingTransaction(null)
      } else {
        alert(result.message || 'Error al actualizar la transacción')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Error al actualizar la transacción')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return
    }

    setDeletingId(id)
    try {
      const result = await deleteTransaction(id)
      if (result.success) {
        onTransactionUpdated()
      } else {
        alert(result.message || 'Error al eliminar la transacción')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Error al eliminar la transacción')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className='bg-gray-800 rounded-xl shadow-xl overflow-hidden'>
        <div className='p-4 sm:p-6 border-b border-gray-700'>
          <h3 className='text-lg sm:text-xl font-bold text-white'>
            Últimos Movimientos
          </h3>
        </div>

        {/* Vista móvil - Tarjetas optimizadas */}
        <div className='block lg:hidden'>
          <div className='p-3 space-y-3'>
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-gray-700 rounded-lg border-l-4 border-l-blue-500 overflow-hidden'
              >
                {/* Header compacto */}
                <div className='p-3 pb-2'>
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            expense.type === 'income'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}
                        >
                          {expense.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                        <span className='text-gray-400 text-xs truncate'>
                          {expense.date}
                        </span>
                      </div>
                      <h4 className='text-white font-medium text-sm truncate'>
                        {expense.category}
                      </h4>
                    </div>
                    <div
                      className={`text-right font-bold text-lg ml-2 ${
                        expense.type === 'income'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {formatCurrencyLocal(expense.amount)}
                    </div>
                  </div>

                  {/* Descripción si existe */}
                  {expense.description &&
                    expense.description !== expense.category && (
                      <div className='mb-2'>
                        <p className='text-gray-300 text-xs line-clamp-2'>
                          {expense.description}
                        </p>
                      </div>
                    )}
                </div>

                {/* Botones de acción optimizados */}
                <div className='px-3 pb-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEditTransaction(expense)}
                      className='flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                      Editar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeleteTransaction(expense.id!)}
                      disabled={deletingId === expense.id}
                      className='flex items-center justify-center gap-2 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[40px]'
                    >
                      {deletingId === expense.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className='h-4 w-4 border-2 border-white border-t-transparent rounded-full'
                          />
                          <span className='text-xs'>Eliminando...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                          Eliminar
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {expenses.length === 0 && (
              <div className='text-center py-12 text-gray-400'>
                <div className='mb-3 text-5xl opacity-50'>📊</div>
                <p className='text-base'>No hay transacciones para mostrar</p>
                <p className='text-sm mt-1 opacity-75'>
                  Agrega tu primera transacción para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vista desktop - Tabla tradicional */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-white'>Fecha</th>
                <th className='px-6 py-3 text-left text-white'>Categoría</th>
                <th className='px-6 py-3 text-left text-white'>Descripción</th>
                <th className='px-6 py-3 text-right text-white'>Monto</th>
                <th className='px-6 py-3 text-center text-white'>Tipo</th>
                <th className='px-6 py-3 text-center text-white'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='border-b border-gray-700 hover:bg-gray-700/50'
                >
                  <td className='px-6 py-4 text-white'>{expense.date}</td>
                  <td className='px-6 py-4 text-white'>{expense.category}</td>
                  <td className='px-6 py-4 text-white'>
                    {expense.description}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-bold ${
                      expense.type === 'income'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrencyLocal(expense.amount)}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.type === 'income'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {expense.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center space-x-2'>
                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditTransaction(expense)}
                        className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                        title='Editar'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTransaction(expense.id!)}
                        disabled={deletingId === expense.id}
                        className='p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Eliminar'
                      >
                        {deletingId === expense.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className='h-4 w-4 border-2 border-white border-t-transparent rounded-full'
                          />
                        ) : (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-8 text-center text-gray-400'
                  >
                    No hay transacciones para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction}
            categories={categories}
            onSave={handleUpdateTransaction}
            onCancel={() => {
              setShowEditModal(false)
              setEditingTransaction(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
