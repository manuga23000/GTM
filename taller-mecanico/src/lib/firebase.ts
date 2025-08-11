import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC8DpDcgvvVUWl7O_vMCtOgCKpDx_73Qvs",
  authDomain: "gtm-sn.firebaseapp.com",
  projectId: "gtm-sn",
  storageBucket: "gtm-sn.appspot.com",
  messagingSenderId: "931181938365",
  appId: "1:931181938365:web:572bdf4b54dfafe67599d4",
}

// Log simple para verificar que todo funciona
console.log('🔥 Firebase inicializado correctamente')

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export { app }
