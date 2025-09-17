'use client'
import React from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Transaction } from '@/actions/types/types'

// Custom label renderer for pie charts
const renderCustomizedLabel = ({
  name = '',
  percent = 0,
}: {
  name?: string
  percent?: number
}) => `${name} ${(percent * 100).toFixed(0)}%`

interface PieDataItem {
  name: string
  value: number
}

interface MonthlyDataItem {
  month: string
  income: number
  expenses: number
}

interface ExpenseDashboardProps {
  filteredExpenses: Transaction[]
  expenses: Transaction[]
  totalIncome: number
  totalExpenses: number
  balance: number
  formatCurrencyLocal: (amount: number) => string
}

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

export default function ExpenseDashboard({
  filteredExpenses,
  expenses,
  totalIncome,
  totalExpenses,
  balance,
  formatCurrencyLocal,
}: ExpenseDashboardProps) {
  // Preparar datos para gráficos de torta
  const expensePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount < 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + Math.abs(amount)
        return acc
      }, {})
  ).map(([name, value]) => ({ name, value }))

  const incomePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount > 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {})
  ).map(([name, value]) => ({ name, value }))

  // Formatear datos para el gráfico de barras mensual
  const monthlyData = expenses.reduce<Record<string, MonthlyDataItem>>(
    (acc, expense) => {
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
    },
    {}
  )

  // Monthly data is processed but not currently used in the UI
  // Keeping the processing in case it's needed later
  Object.values(monthlyData).map((item: MonthlyDataItem) => ({
    month: format(new Date(item.month + '-01'), 'MMM yyyy', { locale: es }),
    income: item.income,
    expenses: item.expenses,
  }))

  return (
    <div className='space-y-6'>
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
                {formatCurrencyLocal(totalIncome)}
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
                {formatCurrencyLocal(totalExpenses)}
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
              <p className={balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>
                Balance
              </p>
              <p className='text-2xl font-bold text-white'>
                {formatCurrencyLocal(balance)}
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
                label={renderCustomizedLabel}
              >
                {expensePieData.map((entry, index) => (
                  <Cell
                    key={`expense-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrencyLocal(value)}
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
                label={renderCustomizedLabel}
              >
                {incomePieData.map((entry, index) => (
                  <Cell
                    key={`income-cell-${index}`}
                    fill={COLORS[(index + 3) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrencyLocal(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
