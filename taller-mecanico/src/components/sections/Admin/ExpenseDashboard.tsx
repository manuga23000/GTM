'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Transaction } from '@/actions/types/types'
import { TrendingUp, TrendingDown, BarChart2, PieChart as PieIcon, Info } from 'lucide-react'

const renderCustomizedLabel = ({
  name = '',
  percent = 0,
}: {
  name?: string
  percent?: number
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  if (isMobile && percent < 0.1) return ''
  const displayName = isMobile && name.length > 8 ? name.substring(0, 6) + '...' : name
  return `${displayName} ${(percent * 100).toFixed(0)}%`
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-zinc-900 p-3 rounded-xl shadow-xl border border-zinc-700 max-w-xs'>
        <p className='text-white font-semibold text-sm'>{payload[0].name}</p>
        <p className='text-amber-400 text-sm mt-0.5'>
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
  [key: string]: string | number | boolean | undefined
}

interface ExpenseDashboardProps {
  filteredExpenses: Transaction[]
  expenses: Transaction[]
  totalIncome: number
  totalExpenses: number
  balance: number
  formatCurrencyLocal: (amount: number) => string
}

// Paleta cálida acorde al taller (ambers, oranges, reds, teals)
const COLORS = [
  '#F59E0B', '#F97316', '#EF4444', '#10B981', '#3B82F6',
  '#8B5CF6', '#06B6D4', '#84CC16', '#EC4899', '#14B8A6',
  '#FBBF24', '#FB923C',
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const expensePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount < 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + Math.abs(amount)
        return acc
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, isMobile ? 6 : 10)

  const incomePieData: PieDataItem[] = Object.entries(
    filteredExpenses
      .filter(e => e.amount > 0)
      .reduce<Record<string, number>>((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, isMobile ? 6 : 10)

  return (
    <div className='space-y-5'>

      {/* ── Summary cards ── */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4'>

        {/* Ingresos */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className='bg-zinc-900/80 border border-emerald-500/25 p-5 sm:p-6 rounded-2xl shadow-md overflow-hidden relative'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent pointer-events-none' />
          <div className='relative flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0'>
              <TrendingUp className='w-6 h-6 text-emerald-400' strokeWidth={1.8} />
            </div>
            <div className='min-w-0'>
              <p className='text-zinc-500 text-xs uppercase tracking-wider mb-0.5'>Ingresos</p>
              <p className='text-lg sm:text-xl font-bold text-emerald-300 truncate'>{formatCurrencyLocal(totalIncome)}</p>
            </div>
          </div>
        </motion.div>

        {/* Gastos */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className='bg-zinc-900/80 border border-red-500/25 p-5 sm:p-6 rounded-2xl shadow-md overflow-hidden relative'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none' />
          <div className='relative flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0'>
              <TrendingDown className='w-6 h-6 text-red-400' strokeWidth={1.8} />
            </div>
            <div className='min-w-0'>
              <p className='text-zinc-500 text-xs uppercase tracking-wider mb-0.5'>Gastos</p>
              <p className='text-lg sm:text-xl font-bold text-red-300 truncate'>{formatCurrencyLocal(totalExpenses)}</p>
            </div>
          </div>
        </motion.div>

        {/* Balance */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`bg-zinc-900/80 border p-5 sm:p-6 rounded-2xl shadow-md overflow-hidden relative ${
            balance >= 0 ? 'border-amber-500/25' : 'border-orange-500/25'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
            balance >= 0 ? 'from-amber-600/10' : 'from-orange-600/10'
          } to-transparent`} />
          <div className='relative flex items-center gap-4'>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              balance >= 0 ? 'bg-amber-500/15 border-amber-500/20' : 'bg-orange-500/15 border-orange-500/20'
            }`}>
              <BarChart2 className={`w-6 h-6 ${balance >= 0 ? 'text-amber-400' : 'text-orange-400'}`} strokeWidth={1.8} />
            </div>
            <div className='min-w-0'>
              <p className='text-zinc-500 text-xs uppercase tracking-wider mb-0.5'>Balance</p>
              <p className={`text-lg sm:text-xl font-bold truncate ${balance >= 0 ? 'text-amber-300' : 'text-orange-300'}`}>
                {formatCurrencyLocal(balance)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Pie charts ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

        {/* Expenses by category */}
        <div className='bg-zinc-900/70 border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-md'>
          <div className='flex items-center gap-2 mb-4'>
            <div className='w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center'>
              <PieIcon className='w-3.5 h-3.5 text-red-400' strokeWidth={2} />
            </div>
            <h3 className='text-sm sm:text-base font-bold text-white'>Gastos por Categoría</h3>
          </div>

          {expensePieData.length > 0 ? (
            isMobile ? (
              <div className='space-y-4'>
                <div className='flex justify-center'>
                  <PieChart width={280} height={200}>
                    <Pie data={expensePieData} cx={140} cy={100} outerRadius={70} innerRadius={28} fill='#8884d8' dataKey='value' labelLine={false}>
                      {expensePieData.map((_, index) => (
                        <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  {expensePieData.map((entry, index) => (
                    <div key={entry.name} className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className='text-zinc-400 truncate'>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie data={expensePieData} cx='50%' cy='50%' outerRadius={110} innerRadius={35} fill='#8884d8' dataKey='value' label={renderCustomizedLabel} labelLine={false}>
                    {expensePieData.map((_, index) => (
                      <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrencyLocal(value)} />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className='text-center py-12 text-zinc-600 flex flex-col items-center gap-3'>
              <PieIcon className='w-10 h-10 opacity-20' strokeWidth={1.5} />
              <p className='text-sm'>No hay gastos para mostrar</p>
            </div>
          )}
        </div>

        {/* Income by category */}
        <div className='bg-zinc-900/70 border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-md'>
          <div className='flex items-center gap-2 mb-4'>
            <div className='w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center'>
              <PieIcon className='w-3.5 h-3.5 text-emerald-400' strokeWidth={2} />
            </div>
            <h3 className='text-sm sm:text-base font-bold text-white'>Ingresos por Categoría</h3>
          </div>

          {incomePieData.length > 0 ? (
            isMobile ? (
              <div className='space-y-4'>
                <div className='flex justify-center'>
                  <PieChart width={280} height={200}>
                    <Pie data={incomePieData} cx={140} cy={100} outerRadius={70} innerRadius={28} fill='#8884d8' dataKey='value' labelLine={false}>
                      {incomePieData.map((_, index) => (
                        <Cell key={`income-cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  {incomePieData.map((entry, index) => (
                    <div key={entry.name} className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                      <span className='text-zinc-400 truncate'>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie data={incomePieData} cx='50%' cy='50%' outerRadius={110} innerRadius={35} fill='#8884d8' dataKey='value' label={renderCustomizedLabel} labelLine={false}>
                    {incomePieData.map((_, index) => (
                      <Cell key={`income-cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrencyLocal(value)} />
                </PieChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className='text-center py-12 text-zinc-600 flex flex-col items-center gap-3'>
              <PieIcon className='w-10 h-10 opacity-20' strokeWidth={1.5} />
              <p className='text-sm'>No hay ingresos para mostrar</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile note */}
      {isMobile && (
        <div className='bg-amber-900/15 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3'>
          <Info className='w-4 h-4 text-amber-400 shrink-0' strokeWidth={2} />
          <p className='text-amber-300/80 text-xs'>En móvil se muestran los elementos principales para mejor visualización.</p>
        </div>
      )}
    </div>
  )
}
