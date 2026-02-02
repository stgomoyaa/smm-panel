'use client'

import { useEffect, useState } from 'react'
import { getOrderStatusDisplay, formatDate } from '@/lib/utils'

interface Order {
  id: number
  orderId: string
  categoryName: string
  subcategoryName: string
  serviceName: string
  link: string
  quantity: number
  salePrice: number
  commission: number
  status: string
  createdAt: string
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommissions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders')
      const data = await res.json()
      setOrders(data.orders)
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white">Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Mis Ventas</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Ventas</h3>
          <p className="text-3xl font-bold text-white">{summary.totalOrders}</p>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Monto Total Vendido</h3>
          <p className="text-3xl font-bold text-primary-400">
            ${summary.totalSales.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Tu Comisión (20%)</h3>
          <p className="text-3xl font-bold text-green-400">
            ${summary.totalCommissions.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Lista de órdenes */}
      {orders.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
          <p className="text-gray-400">No has registrado ventas aún</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Link
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Tu Comisión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {orders.map((order) => {
                  const statusDisplay = getOrderStatusDisplay(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-mono text-sm">
                          {order.orderId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{order.serviceName}</div>
                        <div className="text-xs text-gray-500">
                          {order.categoryName} › {order.subcategoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300 truncate max-w-xs">
                          {order.link}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-bold">
                          ${order.salePrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-green-400 font-bold">
                          ${order.commission.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusDisplay.color}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
