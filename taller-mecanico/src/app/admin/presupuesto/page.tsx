'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import AdminLogin from '@/components/sections/Admin/AdminLogin';
import BudgetCalculator from '@/components/sections/Admin/BudgetCalculator';
import { motion } from 'framer-motion';

export default function PresupuestoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-3xl font-bold mb-8 text-center">
              Acceso Restringido
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Debe iniciar sesión como administrador para acceder a esta página
            </p>
            <AdminLogin />
            <div className="mt-6 text-center">
              <Link
                href="/admin"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Volver al Panel de Administración
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header with Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Volver al Panel</span>
            </Link>
            <div className="text-gray-400 text-sm">
              👤 {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Calculator */}
      <BudgetCalculator />
    </div>
  );
}
