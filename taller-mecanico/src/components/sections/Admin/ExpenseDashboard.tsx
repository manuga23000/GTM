'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Transaction } from '@/actions/types/types'

// Custom label renderer for pie charts - Mobile optimized
const renderCustomizedLabel = ({
  name = '',
  percent = 0,
}: {
  name?: string
  percent?: number
}) => {
  // En mobile, solo mostrar porcentaje si es mayor al 10%
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  if (isMobile && percent < 0.1) return ''

  // Truncar nombres largos en mobile
  const displayName =
    isMobile && name.length > 8 ? name.substring(0, 6) + '...' : name
  return `${displayName} ${(percent * 100).toFixed(0)}%`
}

// Custom tooltip for mobile
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-600 max-w-xs'>
        <p className='text-white font-medium text-sm'>{payload[0].name}</p>
        <p className='text-blue-400 text-sm'>
          {new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

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
  const [isMobile, setIsMobile] = useState(false)

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preparar datos para gráficos de torta
  const expensePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount < 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + Math.abs(amount)
        return acc
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Ordenar por valor descendente
    .slice(0, isMobile ? 6 : 10) // Limitar elementos en mobile

  const incomePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount > 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Ordenar por valor descendente
    .slice(0, isMobile ? 6 : 10) // Limitar elementos en mobile

  // Configuración dinámica según el dispositivo
  const chartConfig = {
    height: isMobile ? 250 : 300,
    outerRadius: isMobile ? 70 : 100,
    labelLine: false,
    label: isMobile ? false : renderCustomizedLabel, // Desactivar labels en mobile
  }

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
        <div className='bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl'>
          <h3 className='text-lg sm:text-xl font-bold mb-4 text-center text-white'>
            Gastos por Categoría
          </h3>

          {/* Mobile: Gráfico mini FORZADO */}
          {isMobile ? (
            <div className='space-y-2'>
              <div className='flex justify-center'>
                {/* FORZAMOS dimensiones sin ResponsiveContainer */}
                <PieChart width={280} height={180}>
                  <Pie
                    data={expensePieData}
                    cx={140}
                    cy={90}
                    outerRadius={60}
                    innerRadius={20}
                    fill='#8884d8'
                    dataKey='value'
                    labelLine={false}
                    label={(props: any) => {
                      const { percent } = props
                      return percent > 0.05
                        ? `${(percent * 100).toFixed(0)}%`
                        : ''
                    }}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell
                        key={`expense-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </div>

              {/* Leyenda compacta */}
              <div className='grid grid-cols-2 gap-1 text-xs'>
                {expensePieData.map((entry, index) => (
                  <div key={entry.name} className='flex items-center space-x-1'>
                    <div
                      className='w-2 h-2 rounded-full flex-shrink-0'
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className='text-gray-300 truncate'>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: Chart normal */
            <ResponsiveContainer width='100%' height={chartConfig.height}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx='50%'
                  cy='50%'
                  outerRadius={chartConfig.outerRadius}
                  fill='#8884d8'
                  dataKey='value'
                  label={renderCustomizedLabel}
                  labelLine={false}
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
          )}
        </div>

        {/* Income Pie Chart */}
        <div className='bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl'>
          <h3 className='text-lg sm:text-xl font-bold mb-4 text-center text-white'>
            Ingresos por Categoría
          </h3>

          {/* Mobile: Gráfico mini FORZADO */}
          {isMobile ? (
            <div className='space-y-2'>
              <div className='flex justify-center'>
                {/* FORZAMOS dimensiones sin ResponsiveContainer */}
                <PieChart width={280} height={180}>
                  <Pie
                    data={incomePieData}
                    cx={140}
                    cy={90}
                    outerRadius={60}
                    innerRadius={20}
                    fill='#8884d8'
                    dataKey='value'
                    labelLine={false}
                    label={(props: any) => {
                      const { percent } = props
                      return percent > 0.05
                        ? `${(percent * 100).toFixed(0)}%`
                        : ''
                    }}
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell
                        key={`income-cell-${index}`}
                        fill={COLORS[(index + 3) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </div>

              {/* Leyenda compacta */}
              <div className='grid grid-cols-2 gap-1 text-xs'>
                {incomePieData.map((entry, index) => (
                  <div key={entry.name} className='flex items-center space-x-1'>
                    <div
                      className='w-2 h-2 rounded-full flex-shrink-0'
                      style={{
                        backgroundColor: COLORS[(index + 3) % COLORS.length],
                      }}
                    />
                    <span className='text-gray-300 truncate'>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: Chart normal */
            <ResponsiveContainer width='100%' height={chartConfig.height}>
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx='50%'
                  cy='50%'
                  outerRadius={chartConfig.outerRadius}
                  fill='#8884d8'
                  dataKey='value'
                  label={renderCustomizedLabel}
                  labelLine={false}
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
          )}
        </div>
      </div>

      {/* Mobile: Mensaje explicativo */}
      {isMobile && (
        <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-4'>
          <p className='text-blue-200 text-sm text-center'>
            💡 En móvil se muestran los principales elementos para mejor
            visualización
          </p>
        </div>
      )}
    </div>
  )
}
