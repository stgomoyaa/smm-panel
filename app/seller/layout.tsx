'use client'

import { SessionProvider } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { FiHome, FiShoppingBag, FiDollarSign, FiLogOut } from 'react-icons/fi'
import { signOut } from 'next-auth/react'

function SellerLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'admin') {
      router.push('/admin')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'seller') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 min-h-screen bg-dark-800 border-b md:border-b-0 md:border-r border-dark-700">
          <div className="p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Envios Vendedores</h1>
            <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-8">Panel de Ventas</p>
            
            <nav className="space-y-1 md:space-y-2">
              <Link
                href="/seller"
                className="flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiHome className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Registrar Venta</span>
              </Link>
              
              <Link
                href="/seller/orders"
                className="flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiShoppingBag className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Mis Ventas</span>
              </Link>
              
              <Link
                href="/seller/stats"
                className="flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiDollarSign className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Mis Ganancias</span>
              </Link>
            </nav>

            <div className="mt-4 md:absolute md:bottom-6 md:left-6 md:right-6">
              <div className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4">
                <div>Hola, <strong>{session.user.name}</strong></div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors w-full"
              >
                <FiLogOut className="text-lg md:text-xl" />
                <span className="text-sm md:text-base">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </SessionProvider>
  )
}
