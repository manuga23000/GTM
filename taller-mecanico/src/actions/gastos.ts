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
  orderBy,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Transaction,
  TransactionInput,
  TransactionResponse,
  TransactionStats,
  DateRange,
} from './types/types'

const COLLECTION_NAME = 'transactions'

interface FirestoreTransactionData extends DocumentData {
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  description: string
  createdAt?: Timestamp 
  updatedAt?: Timestamp 
  createdBy: string
}

interface TransactionFilters {
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
}

const toTransaction = (
  id: string,
  data: FirestoreTransactionData
): Transaction => ({
  id,
  type: data.type,
  category: data.category,
  amount: Number(data.amount),
  date: data.date,
  description: data.description,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
  createdBy: data.createdBy,
})


export async function createTransaction(
  transactionData: TransactionInput,
  userId?: string
): Promise<TransactionResponse> {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME))
    const transaction = {
      ...transactionData,
      ...(userId && { createdBy: userId }), 
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await setDoc(docRef, transaction)

    return {
      success: true,
      message: 'Transacción creada exitosamente',
      transaction: toTransaction(
        docRef.id,
        transaction as FirestoreTransactionData
      ),
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return {
      success: false,
      message: 'Error al crear la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Get a transaction by ID
 */
export async function getTransaction(id: string): Promise<Transaction | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toTransaction(docSnap.id, docSnap.data() as FirestoreTransactionData)
  } catch (error) {
    console.error('Error getting transaction:', error)
    return null
  }
}


export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  try {
    let q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'))

    const conditions = []
    if (filters.type) conditions.push(where('type', '==', filters.type))
    if (filters.category)
      conditions.push(where('category', '==', filters.category))
    if (filters.startDate)
      conditions.push(where('date', '>=', filters.startDate))
    if (filters.endDate) conditions.push(where('date', '<=', filters.endDate))

    if (conditions.length > 0) {
      q = query(q, ...conditions)
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc =>
      toTransaction(doc.id, doc.data() as FirestoreTransactionData)
    )
  } catch (error) {
    console.error('Error getting transactions:', error)
    return []
  }
}

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
        message: 'Transacción no encontrada',
      }
    }

    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.now(),
    }

    await updateDoc(docRef, updatedData)

    const existingData = docSnap.data() as FirestoreTransactionData
    const mergedData = { ...existingData, ...updatedData }

    return {
      success: true,
      message: 'Transacción actualizada exitosamente',
      transaction: toTransaction(id, mergedData as FirestoreTransactionData),
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return {
      success: false,
      message: 'Error al actualizar la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function deleteTransaction(
  id: string
): Promise<TransactionResponse> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return {
        success: false,
        message: 'Transacción no encontrada',
      }
    }

    await deleteDoc(docRef)

    return {
      success: true,
      message: 'Transacción eliminada exitosamente',
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return {
      success: false,
      message: 'Error al eliminar la transacción',
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}


export async function getTransactionStats(
  dateRange?: DateRange
): Promise<TransactionStats> {
  try {
    const filters: TransactionFilters = {}

    if (dateRange) {
      filters.startDate = dateRange.start.toISOString().split('T')[0]
      filters.endDate = dateRange.end.toISOString().split('T')[0]
    }

    const transactions = await getTransactions(filters)

    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )

    const incomeByCategory = incomeTransactions.reduce<Record<string, number>>(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {}
    )

    const expensesByCategory = expenseTransactions.reduce<
      Record<string, number>
    >((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory: Object.entries(incomeByCategory).map(
        ([category, amount]) => ({
          category,
          amount,
        })
      ),
      expensesByCategory: Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
          category,
          amount,
        })
      ),
    }
  } catch (error) {
    console.error('Error getting transaction stats:', error)
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeByCategory: [],
      expensesByCategory: [],
    }
  }
}
