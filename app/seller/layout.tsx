'use client'

import { SessionProvider } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiHome, FiShoppingBag, FiDollarSign, FiLogOut, FiUser, FiTrendingUp } from 'react-icons/fi'
import { signOut } from 'next-auth/react'

function SellerLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sellerInfo, setSellerInfo] = useState({ commissionRate: 20, todayEarnings: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'admin') {
      router.push('/admin')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'seller') {
      fetchSellerInfo()
    }
  }, [session])

  const fetchSellerInfo = async () => {
    try {
      const res = await fetch('/api/seller/info')
      if (res.ok) {
        const data = await res.json()
        setSellerInfo(data)
      }
    } catch (error) {
      console.error('Error fetching seller info:', error)
    }
  }

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

  const navItems = [
    { href: '/seller', icon: FiHome, label: 'Registrar', shortLabel: 'Vender', color: 'primary' },
    { href: '/seller/orders', icon: FiShoppingBag, label: 'Mis Ventas', shortLabel: 'Ventas', color: 'blue' },
    { href: '/seller/stats', icon: FiTrendingUp, label: 'Mis Ganancias', shortLabel: 'Ganancias', color: 'green' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:flex md:w-64 min-h-screen bg-dark-800 border-r border-dark-700 flex-col">
          <div className="p-6 flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">Envios Vendedores</h1>
            <p className="text-sm text-gray-400 mb-6">Panel de Ventas</p>
            
            {/* Emotional Status */}
            <div className="bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="text-2xl mr-2">👋</div>
                <div>
                  <div className="text-sm text-gray-400">Hola,</div>
                  <div className="text-white font-bold">{session.user.name}</div>
                </div>
              </div>
              <div className="border-t border-primary-700/30 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Comisión hoy:</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${sellerInfo.todayEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Tu tasa:</span>
                  <span className="text-primary-400 font-bold">
                    {sellerInfo.commissionRate}%
                  </span>
                </div>
              </div>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-dark-700">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors w-full"
            >
              <FiLogOut className="text-xl" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Bottom Navigation - Mobile only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800/95 backdrop-blur-lg border-t border-dark-700 z-50 safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-2 pb-safe">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[72px] ${
                    isActive
                      ? 'text-primary-400'
                      : 'text-gray-400 active:bg-dark-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary-500/20 shadow-lg shadow-primary-500/30' 
                      : ''
                  }`}>
                    <Icon className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-xs font-semibold transition-all ${
                    isActive ? 'text-primary-400' : 'text-gray-500'
                  }`}>
                    {item.shortLabel}
                  </span>
                  {isActive && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-b-full" />
                  )}
                </Link>
              )
            })}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl text-gray-400 active:bg-dark-700 active:scale-95 transition-all min-w-[72px]"
            >
              <div className="p-2">
                <FiUser className="text-2xl" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Perfil</span>
            </button>
          </div>
        </nav>
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
