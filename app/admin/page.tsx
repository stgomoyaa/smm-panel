'use client'

import { useEffect, useState } from 'react'
import { FiServer, FiShoppingCart, FiGrid, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi'

interface Stats {
  totalProviders: number
  totalServices: number
  totalOrders: number
  completedOrders: number
}

interface SellerProfit {
  sellerId: number
  sellerName: string
  totalRevenue: number
  totalCost: number
  commission: number
  netProfit: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProviders: 0,
    totalServices: 0,
    totalOrders: 0,
    completedOrders: 0,
  })
  const [sellerProfits, setSellerProfits] = useState<SellerProfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchSellerProfits()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalProviders: data.totalProviders || 0,
          totalServices: data.totalServices || 0,
          totalOrders: data.totalOrders || 0,
          completedOrders: data.completedOrders || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSellerProfits = async () => {
    try {
      const res = await fetch('/api/admin/seller-profits')
      if (res.ok) {
        const data = await res.json()
        setSellerProfits(data)
      }
    } catch (error) {
      console.error('Error fetching seller profits:', error)
    }
  }

  const statCards = [
    {
      title: 'Proveedores',
      value: stats.totalProviders,
      icon: FiServer,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Servicios',
      value: stats.totalServices,
      icon: FiGrid,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Órdenes Totales',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Órdenes Completadas',
      value: stats.completedOrders,
      icon: FiDollarSign,
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="text-xl md:text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-gray-400 text-xs md:text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ganancias por Vendedor */}
      {sellerProfits.length > 0 && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center mb-4 md:mb-6">
            <FiTrendingUp className="text-green-500 text-xl md:text-2xl mr-2 md:mr-3" />
            <h2 className="text-lg md:text-xl font-bold text-white">Ganancias por Vendedor</h2>
          </div>
          
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Vendedor
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-400 uppercase">
                      Ventas
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">
                      Costos
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-400 uppercase hidden md:table-cell">
                      Comisión
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-400 uppercase">
                      Ganancia Neta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {sellerProfits.map((seller) => (
                    <tr key={seller.sellerId} className="hover:bg-dark-700 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-900 rounded-lg mr-2 md:mr-3">
                            <FiUsers className="text-primary-400 text-sm md:text-base" />
                          </div>
                          <span className="text-white font-medium text-sm md:text-base">{seller.sellerName}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                        <span className="text-white font-semibold text-sm md:text-base">
                          ${seller.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right hidden sm:table-cell">
                        <span className="text-red-400 text-sm md:text-base">
                          ${seller.totalCost.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right hidden md:table-cell">
                        <span className="text-orange-400 text-sm md:text-base">
                          ${seller.commission.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                        <span className="text-green-400 font-bold text-sm md:text-base">
                          ${seller.netProfit.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Comenzar</h2>
        <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-300">
          <p>✅ 1. Ve a <strong>Proveedores</strong> y añade tu primer proveedor SMM</p>
          <p>✅ 2. Sincroniza los servicios del proveedor</p>
          <p>✅ 3. Personaliza precios en <strong>Servicios</strong></p>
          <p>✅ 4. ¡Listo! Tu panel está funcionando</p>
        </div>
      </div>
    </div>
  )
}
