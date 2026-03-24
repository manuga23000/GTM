'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  subDays,
} from 'date-fns'
import {
  TransactionInput,
  TransactionStats,
  Transaction,
} from '@/actions/types/types'
import {
  getTransactions,
  createTransaction as createTransactionApi,
  getTransactionStats,
} from '@/actions/gastos'
import ExpenseDashboard from './ExpenseDashboard'
import ExpenseForm from './ExpenseForm'
import TransactionTable from './TransactionTable'
import { BarChart2, List, Plus } from 'lucide-react'

type DateRange = 'hoy' | 'mes' | 'año' | 'personalizado'
type CategoryType = 'expense' | 'income'

export default function ExpenseManager() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>('mes')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeByCategory: [],
    expensesByCategory: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [categories] = useState<Record<CategoryType, string[]>>({
    expense: [
      'Alquiler',
      'Sueldos',
      'Servicios',
      'Insumos',
      'Mantenimiento',
      'Impuestos',
      'Empleados',
      'Publicidad',
      'Redes',
      'Otros',
    ],
    income: [
      'Service',
      'Tren delantero',
      'Service de caja',
      'Distribución',
      'Diagnósticos',
      'Motor',
      'Otros',
    ],
  })

  const [newTransaction, setNewTransaction] = useState<
    Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  >({
    type: 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    createdBy: '',
  })

  const loadTransactions = async () => {
    try {
      let startDate: Date | undefined
      let endDate: Date | undefined
      const today = new Date()

      switch (dateRange) {
        case 'hoy':
          startDate = new Date(today.setHours(0, 0, 0, 0))
          endDate = new Date(today.setHours(23, 59, 59, 999))
          break
        case 'mes':
          startDate = startOfMonth(today)
          endDate = endOfMonth(today)
          break
        case 'año':
          startDate = startOfYear(today)
          endDate = endOfYear(today)
          break
        case 'personalizado':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate)
            endDate = new Date(customEndDate)
            endDate.setHours(23, 59, 59, 999)
          }
          break
      }

      const transactions = await getTransactions({
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
      })

      setExpenses(transactions)

      const stats = await getTransactionStats(
        startDate && endDate ? { start: startDate, end: endDate } : undefined
      )
      setStats(stats)
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        let start: Date
        let end = new Date()

        switch (dateRange) {
          case 'hoy':
            start = new Date()
            break
          case 'mes':
            start = startOfMonth(new Date())
            end = endOfMonth(new Date())
            break
          case 'año':
            start = startOfYear(new Date())
            end = endOfYear(new Date())
            break
          case 'personalizado':
            start = customStartDate
              ? new Date(customStartDate)
              : subDays(new Date(), 30)
            end = customEndDate ? new Date(customEndDate) : new Date()
            break
          default:
            start = subDays(new Date(), 30)
        }

        const startDate = start.toISOString().split('T')[0]
        const endDate = end.toISOString().split('T')[0]

        const [transactions, stats] = await Promise.all([
          getTransactions({ startDate, endDate }),
          getTransactionStats({ start, end }),
        ])

        setExpenses(transactions || [])
        setStats(stats)
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    fetchData()
  }, [dateRange, customStartDate, customEndDate])

  const { totalIncome, totalExpenses, balance } = stats

  const filteredExpenses = expenses.filter((expense: Transaction) => {
    try {
      const expenseDate = parseISO(expense.date)
      let start: Date
      let end: Date

      switch (dateRange) {
        case 'hoy':
          start = startOfDay(new Date())
          end = endOfDay(new Date())
          break
        case 'mes':
          start = startOfMonth(new Date())
          end = endOfMonth(new Date())
          break
        case 'año':
          start = startOfYear(new Date())
          end = endOfYear(new Date())
          break
        case 'personalizado':
          start = customStartDate
            ? parseISO(customStartDate)
            : startOfMonth(new Date())
          end = customEndDate ? parseISO(customEndDate) : endOfDay(new Date())
          break
        default:
          start = startOfMonth(new Date())
          end = endOfDay(new Date())
      }

      return isWithinInterval(expenseDate, { start, end })
    } catch (error) {
      console.error('Error filtering expenses by date:', error)
      return false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTransaction.category?.trim()) {
      alert('Por favor seleccione una categoría')
      return
    }

    const amount = Number(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido mayor a cero')
      return
    }

    if (!newTransaction.date) {
      alert('Por favor seleccione una fecha')
      return
    }

    setIsSubmitting(true)

    try {
      const transactionData: TransactionInput = {
        type: newTransaction.type,
        category: newTransaction.category,
        amount:
          newTransaction.type === 'expense'
            ? -Math.abs(Number(newTransaction.amount))
            : Math.abs(Number(newTransaction.amount)),
        date: newTransaction.date,
        description: newTransaction.category,
        createdBy: 'admin',
      }

      const result = await createTransactionApi(transactionData)

      if (!result.success) {
        throw new Error(result.message || 'Error al crear la transacción')
      }

      await loadTransactions()

      setNewTransaction({
        type: 'expense',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        createdBy: '',
      })

      setActiveTab('transactions')
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Error al crear la transacción. Por favor, intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'transactions', label: 'Movimientos', icon: List },
    { id: 'add', label: 'Agregar', icon: Plus },
  ]

  return (
    <div className='space-y-5'>
      {/* Navigation Tabs */}
      <div className='flex flex-wrap bg-zinc-900/70 border border-zinc-800 rounded-2xl p-2 gap-2'>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-zinc-900 shadow-md shadow-amber-900/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className='w-4 h-4' strokeWidth={2.2} />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <div className='space-y-5'>
              {/* Date Range Selector */}
              <div className='bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl'>
                <div className='flex flex-col space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    {(
                      ['hoy', 'mes', 'año', 'personalizado'] as DateRange[]
                    ).map(range => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRange(range)
                          if (range === 'personalizado') {
                            setShowCustomDateRange(true)
                          } else {
                            setShowCustomDateRange(false)
                          }
                        }}
                        className={`px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                          dateRange === range
                            ? 'bg-amber-500 text-zinc-900 font-bold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>

                  {showCustomDateRange && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                      <div>
                        <label className='block text-sm font-medium text-zinc-300 mb-1'>
                          Fecha de inicio
                        </label>
                        <input
                          type='date'
                          value={customStartDate}
                          onChange={e => setCustomStartDate(e.target.value)}
                          className='w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-zinc-300 mb-1'>
                          Fecha de fin
                        </label>
                        <input
                          type='date'
                          value={customEndDate}
                          onChange={e => setCustomEndDate(e.target.value)}
                          className='w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50'
                          min={customStartDate}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <ExpenseDashboard
                filteredExpenses={filteredExpenses}
                expenses={expenses}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                balance={balance}
                formatCurrencyLocal={formatCurrencyLocal}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionTable
              expenses={expenses}
              formatCurrencyLocal={formatCurrencyLocal}
              onTransactionUpdated={loadTransactions}
              categories={categories}
            />
          )}

          {activeTab === 'add' && (
            <ExpenseForm
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              categories={categories}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
