'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiTarget, FiPlus, FiAward } from 'react-icons/fi'

interface Stats {
  totalOrders: number
  totalSales: number
  totalCommissions: number
}

export default function SellerStatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalSales: 0,
    totalCommissions: 0,
  })
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seller/orders')
      const data = await res.json()
      setStats(data.summary)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 animate-pulse">
              <div className="h-10 bg-dark-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-dark-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-dark-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const avgSale = stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0
  const weeklyGoal = 50000 // Meta semanal ejemplo
  const weeklyProgress = (stats.totalCommissions / weeklyGoal) * 100

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Mis Ganancias</h1>
        <button
          onClick={() => router.push('/seller')}
          className="md:hidden flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-transform"
        >
          <FiPlus className="text-lg" />
          <span>Vender</span>
        </button>
      </div>

      {/* Period Selector
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'today', label: 'Hoy' },
          { id: 'week', label: 'Esta Semana' },
          { id: 'month', label: 'Este Mes' },
          { id: 'all', label: 'Todo el Tiempo' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              period === p.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      */}

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {/* Total Ventas */}
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
            <FiShoppingBag className="text-2xl text-blue-400" />
          </div>
          <h3 className="text-gray-400 text-xs md:text-sm mb-1">Total Ventas</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalOrders}</p>
          <p className="text-xs text-blue-400 mt-1">pedidos registrados</p>
        </div>

        {/* Monto Vendido */}
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
            <FiDollarSign className="text-2xl text-purple-400" />
          </div>
          <h3 className="text-gray-400 text-xs md:text-sm mb-1">Monto Vendido</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">
            ${(stats.totalSales / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-purple-400 mt-1">${stats.totalSales.toLocaleString()} CLP</p>
        </div>

        {/* Comisión Total */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
            <FiTrendingUp className="text-2xl text-green-400" />
          </div>
          <h3 className="text-gray-400 text-xs md:text-sm mb-1">Tu Comisión</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-400">
            ${stats.totalCommissions.toLocaleString()}
          </p>
          <p className="text-xs text-green-400 mt-1">20% de cada venta</p>
        </div>

        {/* Venta Promedio */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-700/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
            <FiAward className="text-2xl text-orange-400" />
          </div>
          <h3 className="text-gray-400 text-xs md:text-sm mb-1">Venta Promedio</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">
            ${avgSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-orange-400 mt-1">por pedido</p>
        </div>
      </div>

      {/* Progress to Goal */}
      <div className="bg-gradient-to-br from-primary-900/20 to-purple-900/20 border border-primary-700/50 rounded-xl p-5 md:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mr-3">
              <FiTarget className="text-xl text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">Meta Semanal</h3>
              <p className="text-xs text-gray-400">Objetivo: ${weeklyGoal.toLocaleString()} CLP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-400">{Math.min(weeklyProgress, 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-400">${stats.totalCommissions.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
          />
        </div>

        {/* Milestone Messages */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {weeklyProgress >= 100 ? '🎉 ¡Meta alcanzada!' : weeklyProgress >= 75 ? '🔥 ¡Casi lo logras!' : weeklyProgress >= 50 ? '💪 ¡Vas por la mitad!' : weeklyProgress >= 25 ? '👍 Buen comienzo' : '🚀 ¡A por ello!'}
          </span>
          <span className="text-primary-400 font-semibold">
            Faltan ${Math.max(0, weeklyGoal - stats.totalCommissions).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-5 md:p-8">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
            <FiDollarSign className="text-2xl text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">💰 Tu Comisión</h2>
            <div className="space-y-2 text-sm md:text-base text-gray-300">
              <p>
                <strong className="text-green-400">Ganas el 20%</strong> de la ganancia neta de cada venta.
              </p>
              <p>
                <strong>Ejemplo:</strong> Vendes un servicio de $5.990 (costo proveedor $757)
              </p>
              <div className="bg-dark-800/50 rounded-lg p-3 mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio venta:</span>
                  <span className="text-white font-semibold">$5.990</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Costo proveedor:</span>
                  <span className="text-red-400">-$757</span>
                </div>
                <div className="flex justify-between border-t border-dark-700 pt-1">
                  <span className="text-gray-400">Ganancia bruta:</span>
                  <span className="text-white">$5.233</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tu comisión (20%):</span>
                  <span className="text-green-400 font-bold text-base">$1.047</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                💡 Las comisiones se calculan automáticamente y se actualizan en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <button
          onClick={() => router.push('/seller')}
          className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-700/50 rounded-xl active:scale-95 transition-transform"
        >
          <FiPlus className="text-3xl text-primary-400 mb-2" />
          <span className="text-white font-semibold text-sm">Nueva Venta</span>
        </button>
        <button
          onClick={() => router.push('/seller/orders')}
          className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-xl active:scale-95 transition-transform"
        >
          <FiShoppingBag className="text-3xl text-blue-400 mb-2" />
          <span className="text-white font-semibold text-sm">Ver Ventas</span>
        </button>
      </div>

      {/* Floating Action Button - Desktop */}
      <button
        onClick={() => router.push('/seller')}
        className="hidden md:flex fixed bottom-8 right-8 items-center space-x-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-full shadow-2xl shadow-primary-500/50 transition-all hover:scale-105 z-40"
      >
        <FiPlus className="text-xl" />
        <span>Nueva Venta</span>
      </button>
    </div>
  )
}
