import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 🔍 DEBUG COMPLETO
console.log('🌍 Environment:', process.env.NODE_ENV)
console.log(
  '🔑 All NEXT_PUBLIC vars:',
  Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC'))
    .reduce<Record<string, string>>((obj, key) => {
      obj[key] = process.env[key] ? '✅ SET' : '❌ UNDEFINED'
      return obj
    }, {})
)

console.log('FIREBASE CONFIG:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '❌ MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ MISSING',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ MISSING',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ MISSING',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ MISSING',
})

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export { app }
