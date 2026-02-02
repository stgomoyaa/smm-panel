'use client'

import { useEffect, useState } from 'react'
import { FiServer, FiShoppingCart, FiGrid, FiDollarSign } from 'react-icons/fi'

interface Stats {
  totalProviders: number
  totalServices: number
  totalOrders: number
  completedOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProviders: 0,
    totalServices: 0,
    totalOrders: 0,
    completedOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Aquí podrías crear un endpoint específico para stats
      // Por ahora mostramos datos estáticos
      setStats({
        totalProviders: 0,
        totalServices: 0,
        totalOrders: 0,
        completedOrders: 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Comenzar</h2>
        <div className="space-y-3 text-gray-300">
          <p>✅ 1. Ve a <strong>Proveedores</strong> y añade tu primer proveedor SMM</p>
          <p>✅ 2. Sincroniza los servicios del proveedor</p>
          <p>✅ 3. Personaliza precios en <strong>Servicios</strong></p>
          <p>✅ 4. ¡Listo! Tu panel está funcionando</p>
        </div>
      </div>
    </div>
  )
}
