'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
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
import { es } from 'date-fns/locale'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import {
  TransactionInput,
  TransactionStats,
  DateRange as DateRangeType,
  Transaction,
} from '@/actions/types/types'
import {
  getTransactions,
  createTransaction as createTransactionApi,
  deleteTransaction as deleteTransactionApi,
  getTransactionStats,
} from '@/actions/gastos'

type TransactionFormData = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt' | 'description'
>

// Using Transaction type from types.ts instead of redefining it here
// This ensures consistency across the application

type DateRange = 'hoy' | 'mes' | 'año' | 'personalizado'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#8D6E63',
  '#78909C',
  '#4DB6AC',
  '#7986CB',
  '#9575CD',
]

export default function ExpenseManager() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>('mes')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeByCategory: [],
    expensesByCategory: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  type CategoryType = 'expense' | 'income'

  const [categories, setCategories] = useState<Record<CategoryType, string[]>>({
    expense: [
      'Alquiler',
      'Sueldos',
      'Servicios',
      'Insumos',
      'Mantenimiento',
      'Impuestos',
      'Empleados',
      'Publicidad',
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
  })

  // Cargar transacciones
  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError('')

      // Calcular fechas según el rango seleccionado
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

      // Cargar transacciones
      const transactions = await getTransactions({
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
      })

      setExpenses(transactions)

      // Cargar estadísticas
      const stats = await getTransactionStats(
        startDate && endDate ? { start: startDate, end: endDate } : undefined
      )
      setStats(stats)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError(
        'Error al cargar las transacciones. Por favor, intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Cargar transacciones al montar el componente o cambiar el rango de fechas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        // Calcular fechas según el rango seleccionado
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

        // Formatear fechas para la API
        const startDate = start.toISOString().split('T')[0]
        const endDate = end.toISOString().split('T')[0]

        // Cargar transacciones y estadísticas
        const [transactions, stats] = await Promise.all([
          getTransactions({ startDate, endDate }),
          getTransactionStats({ start, end }),
        ])

        setExpenses(transactions || [])
        setStats(stats)
      } catch (error) {
        console.error('Error loading transactions:', error)
        setError(
          'Error al cargar las transacciones. Por favor, intente nuevamente.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange, customStartDate, customEndDate])

  // Usar estadísticas cargadas
  const { totalIncome, totalExpenses, balance } = stats

  // Filtrar transacciones por rango de fechas con manejo seguro de fechas
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

  const expensePieData = Object.entries(
    filteredExpenses
      .filter(e => e.amount < 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + Math.abs(amount)
        return acc
      }, {})
  ).map(([name, value]) => ({ name, value }))

  const incomePieData = Object.entries(
    filteredExpenses
      .filter(e => e.amount > 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {})
  ).map(([name, value]) => ({ name, value }))

  // Formatear datos para el gráfico de barras mensual
  const monthlyData = expenses.reduce((acc: any, expense) => {
    const month = expense.date.substring(0, 7)
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 }
    }
    if (expense.type === 'income') {
      acc[month].income += expense.amount
    } else {
      acc[month].expenses += Math.abs(expense.amount)
    }
    return acc
  }, {})

  const lineData = Object.values(monthlyData).map((item: any) => ({
    month: format(new Date(item.month + '-01'), 'MMM yyyy', { locale: es }),
    income: item.income,
    expenses: item.expenses,
  }))

  const COLORS = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#F97316',
    '#06B6D4',
    '#84CC16',
  ]

  const handleTypeChange = (type: CategoryType) => {
    setNewTransaction(prev => ({
      ...prev,
      type,
      category: '', // Reset category when type changes
    }))

    // Actualizar las categorías disponibles
    if (!categories[type].includes(newTransaction.category)) {
      setNewTransaction(prev => ({
        ...prev,
        category: '',
      }))
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Permitir solo números y un punto decimal opcional
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      // Convertir a número y limitar a 2 decimales
      const numericValue = value === '' ? 0 : parseFloat(value)
      const formattedValue = parseFloat(numericValue.toFixed(2))

      setNewTransaction(prev => ({
        ...prev,
        amount: formattedValue,
      }))
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta transacción?')) {
      return
    }

    try {
      const result = await deleteTransactionApi(id)
      if (result.success) {
        // Filtrar transacciones por categoría y tipo con tipo seguro
        const filteredTransactions =
          activeTab === 'all'
            ? filteredExpenses
            : filteredExpenses.filter(
                t => t.type === (activeTab as CategoryType)
              )
        // Recargar transacciones
        await loadTransactions()
      } else {
        alert(result.message || 'Error al eliminar la transacción')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Error al eliminar la transacción. Por favor, intente nuevamente.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones del formulario
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
        description: newTransaction.category, // Usamos la categoría como descripción
        createdBy: 'admin', // TODO: Replace with actual user ID from authentication
      }

      const result = await createTransactionApi(transactionData)

      if (!result.success) {
        throw new Error(result.message || 'Error al crear la transacción')
      }

      // Recargar transacciones
      await loadTransactions()

      // Reset form
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
      })

      setActiveTab('transactions')
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      alert('Error al crear la transacción. Por favor, intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  return (
    <div className='space-y-6'>
      {/* Navigation Tabs */}
      <div className='flex flex-wrap bg-gray-800 rounded-xl p-2 gap-2'>
        {[
          { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
          { id: 'transactions', label: 'Movimientos', emoji: '📝' },
          { id: 'add', label: 'Agregar', emoji: '➕' },
        ].map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className='mr-2'>{tab.emoji}</span>
            {tab.label}
          </motion.button>
        ))}
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
            <div className='space-y-6'>
              {/* Date Range Selector */}
              <div className='bg-gray-800 p-4 rounded-xl'>
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
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          dateRange === range
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>

                  {showCustomDateRange && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>
                          Fecha de inicio
                        </label>
                        <input
                          type='date'
                          value={customStartDate}
                          onChange={e => setCustomStartDate(e.target.value)}
                          className='w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>
                          Fecha de fin
                        </label>
                        <input
                          type='date'
                          value={customEndDate}
                          onChange={e => setCustomEndDate(e.target.value)}
                          className='w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
                          min={customStartDate}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className='bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-xl'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-green-100'>Ingresos</p>
                      <p className='text-2xl font-bold text-white'>
                        {formatCurrency(totalIncome)}
                      </p>
                    </div>
                    <div className='text-4xl'>💰</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className='bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl shadow-xl'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-red-100'>Gastos</p>
                      <p className='text-2xl font-bold text-white'>
                        {formatCurrency(totalExpenses)}
                      </p>
                    </div>
                    <div className='text-4xl'>💸</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-r p-6 rounded-xl shadow-xl ${
                    balance >= 0
                      ? 'from-blue-600 to-blue-700'
                      : 'from-orange-600 to-orange-700'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p
                        className={
                          balance >= 0 ? 'text-blue-100' : 'text-orange-100'
                        }
                      >
                        Balance
                      </p>
                      <p className='text-2xl font-bold text-white'>
                        {formatCurrency(balance)}
                      </p>
                    </div>
                    <div className='text-4xl'>{balance >= 0 ? '📈' : '📉'}</div>
                  </div>
                </motion.div>
              </div>

              {/* Charts */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Expense Pie Chart */}
                <div className='bg-gray-800 p-6 rounded-xl shadow-xl'>
                  <h3 className='text-xl font-bold mb-4 text-center text-white'>
                    Gastos por Categoría
                  </h3>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx='50%'
                        cy='50%'
                        outerRadius={100}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }: any) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell
                            key={`expense-cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Income Pie Chart */}
                <div className='bg-gray-800 p-6 rounded-xl shadow-xl'>
                  <h3 className='text-xl font-bold mb-4 text-center text-white'>
                    Ingresos por Categoría
                  </h3>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={incomePieData}
                        cx='50%'
                        cy='50%'
                        outerRadius={100}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }: any) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {incomePieData.map((entry, index) => (
                          <Cell
                            key={`income-cell-${index}`}
                            fill={COLORS[(index + 3) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className='bg-gray-800 rounded-xl shadow-xl overflow-hidden'>
              <div className='p-6 border-b border-gray-700'>
                <h3 className='text-xl font-bold text-white'>
                  Últimos Movimientos
                </h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-700'>
                    <tr>
                      <th className='px-6 py-3 text-left text-white'>Fecha</th>
                      <th className='px-6 py-3 text-left text-white'>
                        Categoría
                      </th>
                      <th className='px-6 py-3 text-left text-white'>
                        Descripción
                      </th>
                      <th className='px-6 py-3 text-right text-white'>Monto</th>
                      <th className='px-6 py-3 text-center text-white'>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='border-b border-gray-700 hover:bg-gray-700/50'
                      >
                        <td className='px-6 py-4 text-white'>{expense.date}</td>
                        <td className='px-6 py-4 text-white'>
                          {expense.category}
                        </td>
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
                          {formatCurrency(expense.amount)}
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
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
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
                      {(
                        categories[newTransaction.type as CategoryType] || []
                      ).map((cat: string) => (
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
                      value={
                        newTransaction.amount === 0
                          ? ''
                          : newTransaction.amount.toString()
                      }
                      onChange={e => {
                        const value = e.target.value
                        // Allow only numbers and one decimal point
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          const numericValue =
                            value === '' ? 0 : parseFloat(value)
                          setNewTransaction({
                            ...newTransaction,
                            amount: isNaN(numericValue) ? 0 : numericValue,
                          })
                        }
                      }}
                      onBlur={e => {
                        // Format the number to 2 decimal places when input loses focus
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
          )}

          {activeTab === 'reports' && (
            <div className='space-y-6'>
              <div className='bg-gray-800 p-6 rounded-xl shadow-xl'>
                <h3 className='text-xl font-bold mb-4 text-white'>
                  Resumen Financiero
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='bg-gray-700 p-4 rounded-lg text-center'>
                    <p className='text-gray-400'>Promedio Ingresos/Mes</p>
                    <p className='text-2xl font-bold text-green-400'>
                      {formatCurrency(totalIncome / (lineData.length || 1))}
                    </p>
                  </div>
                  <div className='bg-gray-700 p-4 rounded-lg text-center'>
                    <p className='text-gray-400'>Promedio Gastos/Mes</p>
                    <p className='text-2xl font-bold text-red-400'>
                      {formatCurrency(totalExpenses / (lineData.length || 1))}
                    </p>
                  </div>
                  <div className='bg-gray-700 p-4 rounded-lg text-center'>
                    <p className='text-gray-400'>Total Movimientos</p>
                    <p className='text-2xl font-bold text-blue-400'>
                      {expenses.length}
                    </p>
                  </div>
                  <div className='bg-gray-700 p-4 rounded-lg text-center'>
                    <p className='text-gray-400'>Margen Promedio</p>
                    <p className='text-2xl font-bold text-yellow-400'>
                      {((balance / (totalIncome || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className='bg-gray-800 p-6 rounded-xl shadow-xl'>
                <h3 className='text-xl font-bold mb-4 text-center text-white'>
                  Comparación por Mes
                </h3>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart data={lineData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                    <XAxis dataKey='month' stroke='#9CA3AF' />
                    <YAxis stroke='#9CA3AF' />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                      labelFormatter={label => `Mes: ${label}`}
                    />
                    <Bar dataKey='income' fill='#10B981' name='Ingresos' />
                    <Bar dataKey='expenses' fill='#EF4444' name='Gastos' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
