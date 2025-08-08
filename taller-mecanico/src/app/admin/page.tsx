'use client'
import { useState } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { app } from '@/lib/firebase'
import React from 'react'
import AdminHero from '@/components/sections/Admin/AdminHero'
import AdminLogin from '@/components/sections/Admin/AdminLogin'
import AdminDashboard from '@/components/sections/Admin/AdminDashboard'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)

  React.useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className='min-h-screen bg-black text-white'>
      <AdminHero>
        {!user ? <AdminLogin /> : <AdminDashboard />}
      </AdminHero>
    </div>
  )
}
