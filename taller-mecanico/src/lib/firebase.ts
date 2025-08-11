import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 🔍 Console log para verificar que las variables llegan
console.log('🔑 Firebase Variables Check:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API ? '✅ SET' : '❌ MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN ? '✅ SET' : '❌ MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ? '✅ SET'
    : '❌ MISSING',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ? '✅ SET'
    : '❌ MISSING',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    ? '✅ SET'
    : '❌ MISSING',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ SET' : '❌ MISSING',
})

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log('🔥 Firebase inicializado correctamente')

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export { app }
