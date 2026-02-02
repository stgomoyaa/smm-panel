'use client'

import { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'

interface Stats {
  totalOrders: number
  totalSales: number
  totalCommissions: number
}

export default function SellerStatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalSales: 0,
    totalCommissions: 0,
  })
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
    return <div className="text-white">Cargando...</div>
  }

  const avgSale = stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Mis Ganancias</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FiShoppingBag className="text-2xl text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Ventas</h3>
          <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <FiDollarSign className="text-2xl text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Monto Total Vendido</h3>
          <p className="text-3xl font-bold text-white">
            ${stats.totalSales.toLocaleString()}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <FiTrendingUp className="text-2xl text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Tu Comisión Total</h3>
          <p className="text-3xl font-bold text-green-400">
            ${stats.totalCommissions.toLocaleString()}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <FiDollarSign className="text-2xl text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Venta Promedio</h3>
          <p className="text-3xl font-bold text-white">
            ${avgSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Explicación */}
      <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">💰 Tu Comisión</h2>
        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-green-400">Ganas el 20%</strong> de cada venta que registres.
          </p>
          <p>
            <strong>Ejemplo:</strong> Si vendes un servicio de $5,000, ganas $1,000.
          </p>
          <p className="text-sm text-gray-400">
            Las comisiones se calculan automáticamente con cada venta.
          </p>
        </div>
      </div>
    </div>
  )
}
