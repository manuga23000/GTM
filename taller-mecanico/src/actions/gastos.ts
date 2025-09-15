import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp, 
  orderBy 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Transaction, 
  TransactionInput, 
  TransactionResponse, 
  TransactionStats,
  DateRange
} from './types/types'

const COLLECTION_NAME = 'transactions'

// Helper to convert Firestore data to Transaction
const toTransaction = (id: string, data: any): Transaction => ({
  id,
  type: data.type,
  category: data.category,
  amount: Number(data.amount),
  date: data.date,
  description: data.description,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
  createdBy: data.createdBy
})

// Helper to prepare transaction data for Firestore
const prepareTransactionData = (data: Partial<Transaction>) => ({
  ...data,
  amount: Number(data.amount),
  createdAt: data.createdAt ? Timestamp.fromDate(
    data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt)
  ) : Timestamp.now(),
  updatedAt: Timestamp.now()
})

/**
 * Create a new transaction
 */
export async function createTransaction(
  transactionData: TransactionInput,
  userId?: string
): Promise<TransactionResponse> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME))
    const transaction = {
      ...transactionData,
      ...(userId && { createdBy: userId }), // Only include createdBy if userId is provided
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    await setDoc(docRef, transaction)
    
    return {
      success: true,
      message: 'Transacción creada exitosamente',
      transaction: toTransaction(docRef.id, transaction)
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return {
      success: false,
      message: 'Error al crear la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Get a transaction by ID
 */
export async function getTransaction(
  id: string
): Promise<Transaction | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toTransaction(docSnap.id, docSnap.data())
  } catch (error) {
    console.error('Error getting transaction:', error)
    return null
  }
}

/**
 * Get all transactions with optional filtering
 */
export async function getTransactions(
  filters: {
    type?: 'income' | 'expense'
    category?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<Transaction[]> {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'desc')
    )

    // Apply filters
    const conditions = []
    if (filters.type) conditions.push(where('type', '==', filters.type))
    if (filters.category) conditions.push(where('category', '==', filters.category))
    if (filters.startDate) conditions.push(where('date', '>=', filters.startDate))
    if (filters.endDate) conditions.push(where('date', '<=', filters.endDate))

    // Add all conditions to the query
    if (conditions.length > 0) {
      q = query(q, ...conditions)
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => toTransaction(doc.id, doc.data()))
  } catch (error) {
    console.error('Error getting transactions:', error)
    return []
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string,
  updateData: Partial<TransactionInput>
): Promise<TransactionResponse> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return {
        success: false,
        message: 'Transacción no encontrada'
      }
    }

    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.now()
    }

    await updateDoc(docRef, updatedData)

    return {
      success: true,
      message: 'Transacción actualizada exitosamente',
      transaction: toTransaction(id, { ...docSnap.data(), ...updatedData })
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return {
      success: false,
      message: 'Error al actualizar la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  id: string
): Promise<TransactionResponse> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return {
        success: false,
        message: 'Transacción no encontrada'
      }
    }

    await deleteDoc(docRef)

    return {
      success: true,
      message: 'Transacción eliminada exitosamente'
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return {
      success: false,
      message: 'Error al eliminar la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(
  dateRange?: DateRange
): Promise<TransactionStats> {
  try {
    const filters: any = {}
    
    if (dateRange) {
      filters.startDate = dateRange.start.toISOString().split('T')[0]
      filters.endDate = dateRange.end.toISOString().split('T')[0]
    }

    const transactions = await getTransactions(filters)
    
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    // Group by category
    const incomeByCategory = incomeTransactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    
    const expensesByCategory = expenseTransactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({
        category,
        amount
      })),
      expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount
      }))
    }
  } catch (error) {
    console.error('Error getting transaction stats:', error)
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeByCategory: [],
      expensesByCategory: []
    }
  }
}
