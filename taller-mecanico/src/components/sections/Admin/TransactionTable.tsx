'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction } from '@/actions/types/types'
import EditTransactionModal from './EditTransactionModal'
import { updateTransaction, deleteTransaction } from '@/actions/gastos'
import { Pencil, Trash2, BarChart2 } from 'lucide-react'

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
      <div className='bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden'>
        <div className='p-4 sm:p-6 border-b border-zinc-800'>
          <h3 className='text-lg sm:text-xl font-bold text-white'>
            Últimos Movimientos
          </h3>
        </div>

        {/* Vista móvil — tarjetas */}
        <div className='block lg:hidden'>
          <div className='p-3 space-y-3'>
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-zinc-800/80 rounded-xl border-l-4 border-l-amber-500 overflow-hidden'
              >
                {/* Header compacto */}
                <div className='p-3 pb-2'>
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            expense.type === 'income'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {expense.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                        <span className='text-zinc-500 text-xs truncate'>
                          {expense.date}
                        </span>
                      </div>
                      <h4 className='text-white font-semibold text-sm truncate'>
                        {expense.category}
                      </h4>
                    </div>
                    <div
                      className={`text-right font-bold text-lg ml-2 ${
                        expense.type === 'income'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {formatCurrencyLocal(expense.amount)}
                    </div>
                  </div>

                  {expense.description && expense.description !== expense.category && (
                    <div className='mb-2'>
                      <p className='text-zinc-400 text-xs line-clamp-2'>
                        {expense.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className='px-3 pb-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEditTransaction(expense)}
                      className='flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 rounded-xl transition-colors text-sm font-medium'
                    >
                      <Pencil className='h-4 w-4' strokeWidth={2} />
                      Editar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeleteTransaction(expense.id!)}
                      disabled={deletingId === expense.id}
                      className='flex items-center justify-center gap-2 py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[40px]'
                    >
                      {deletingId === expense.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className='h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full'
                          />
                          <span className='text-xs'>Eliminando...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className='h-4 w-4' strokeWidth={2} />
                          Eliminar
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {expenses.length === 0 && (
              <div className='text-center py-12 text-zinc-500'>
                <BarChart2 className='w-12 h-12 mx-auto mb-3 opacity-30' strokeWidth={1.5} />
                <p className='text-base'>No hay transacciones para mostrar</p>
                <p className='text-sm mt-1 opacity-75'>
                  Agrega tu primera transacción para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vista desktop — tabla */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-zinc-800'>
              <tr>
                {['Fecha', 'Categoría', 'Descripción', 'Monto', 'Tipo', 'Acciones'].map(h => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider ${
                      h === 'Monto' || h === 'Acciones' ? 'text-right' : h === 'Tipo' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors'
                >
                  <td className='px-6 py-4 text-zinc-300 text-sm'>{expense.date}</td>
                  <td className='px-6 py-4 text-white font-medium text-sm'>{expense.category}</td>
                  <td className='px-6 py-4 text-zinc-400 text-sm'>{expense.description}</td>
                  <td
                    className={`px-6 py-4 text-right font-bold text-sm ${
                      expense.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrencyLocal(expense.amount)}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.type === 'income'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {expense.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center space-x-2'>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditTransaction(expense)}
                        className='p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors border border-amber-500/25'
                        title='Editar'
                      >
                        <Pencil className='h-4 w-4' strokeWidth={2} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTransaction(expense.id!)}
                        disabled={deletingId === expense.id}
                        className='p-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20'
                        title='Eliminar'
                      >
                        {deletingId === expense.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className='h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full'
                          />
                        ) : (
                          <Trash2 className='h-4 w-4' strokeWidth={2} />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-6 py-10 text-center text-zinc-500'>
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
