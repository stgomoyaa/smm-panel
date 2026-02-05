'use client'

import { SessionProvider } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { FiHome, FiServer, FiShoppingCart, FiGrid, FiLogOut, FiLayers, FiUsers } from 'react-icons/fi'
import { signOut } from 'next-auth/react'

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'seller') {
      router.push('/seller')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-dark-800 border-r border-dark-700">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">PuraFama Admin</h1>
            
            <nav className="space-y-2">
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiHome className="text-xl" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/admin/providers"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiServer className="text-xl" />
                <span>Proveedores</span>
              </Link>
              
              <Link
                href="/admin/categories"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiLayers className="text-xl" />
                <span>Categorías</span>
              </Link>
              
              <Link
                href="/admin/services"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiGrid className="text-xl" />
                <span>Servicios</span>
              </Link>
              
              <Link
                href="/admin/sellers"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiUsers className="text-xl" />
                <span>Vendedores</span>
              </Link>
              
              <Link
                href="/admin/orders"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <FiShoppingCart className="text-xl" />
                <span>Órdenes</span>
              </Link>
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors w-full"
              >
                <FiLogOut className="text-xl" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  )
}
