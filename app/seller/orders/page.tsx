'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrderStatusDisplay, formatDate } from '@/lib/utils'
import { FiPlus, FiCalendar, FiDollarSign, FiPackage, FiExternalLink, FiFilter } from 'react-icons/fi'

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
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommissions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'completed') return order.status === 'completed'
    if (filter === 'pending') return order.status === 'pending' || order.status === 'processing'
    if (filter === 'failed') return order.status === 'failed' || order.status === 'canceled'
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-dark-700 rounded w-16"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton Cards */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-32 mb-2"></div>
              <div className="h-6 bg-dark-700 rounded w-full mb-3"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-dark-700 rounded w-20"></div>
                <div className="h-6 bg-dark-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Mis Ventas</h1>
        <button
          onClick={() => router.push('/seller')}
          className="md:hidden flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-transform"
        >
          <FiPlus className="text-lg" />
          <span>Nueva</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-gradient-to-br from-dark-800 to-dark-800/50 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center mb-2">
            <FiPackage className="text-blue-400 text-lg md:text-xl mr-2" />
            <h3 className="text-gray-400 text-xs md:text-sm">Total Ventas</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{summary.totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-dark-800 to-dark-800/50 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center mb-2">
            <FiDollarSign className="text-primary-400 text-lg md:text-xl mr-2" />
            <h3 className="text-gray-400 text-xs md:text-sm">Vendido</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary-400">
            ${summary.totalSales.toLocaleString()}
          </p>
        </div>
        
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center mb-2">
            <FiDollarSign className="text-green-400 text-lg md:text-xl mr-2" />
            <h3 className="text-gray-400 text-xs md:text-sm">Tu Comisión</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-400">
            ${summary.totalCommissions.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'all', label: 'Todas', count: orders.length },
          { id: 'completed', label: 'Completadas', count: orders.filter(o => o.status === 'completed').length },
          { id: 'pending', label: 'Pendientes', count: orders.filter(o => o.status === 'pending' || o.status === 'processing').length },
          { id: 'failed', label: 'Fallidas', count: orders.filter(o => o.status === 'failed' || o.status === 'canceled').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === f.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            {f.label} <span className="ml-1.5 opacity-75">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gradient-to-br from-dark-800 to-dark-800/50 border border-dark-700 rounded-xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="text-4xl text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === 'all' ? 'No hay ventas aún' : `No hay ventas ${filter === 'completed' ? 'completadas' : filter === 'pending' ? 'pendientes' : 'fallidas'}`}
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' ? 'Registra tu primera venta para comenzar' : 'Intenta con otro filtro'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => router.push('/seller')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-lg shadow-lg hover:shadow-primary-500/50 transition-all"
            >
              <FiPlus />
              <span>Registrar Primera Venta</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const statusDisplay = getOrderStatusDisplay(order.status)
              return (
                <div
                  key={order.id}
                  className="bg-dark-800 border border-dark-700 rounded-xl p-4 active:scale-[0.99] transition-transform"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base mb-1 truncate">
                        {order.serviceName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {order.categoryName} › {order.subcategoryName}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 ml-3 px-3 py-1 text-xs font-bold rounded-full ${statusDisplay.color}`}
                    >
                      {statusDisplay.label}
                    </span>
                  </div>

                  {/* ID y Link */}
                  <div className="bg-dark-700/50 rounded-lg p-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white font-mono text-xs">{order.orderId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Link:</span>
                      <a
                        href={order.link.startsWith('http') ? order.link : `https://${order.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-400 hover:text-primary-300 font-medium"
                      >
                        <span className="truncate max-w-[150px]">{order.link}</span>
                        <FiExternalLink className="ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Precio y Comisión */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Precio Venta</p>
                      <p className="text-lg font-bold text-white">
                        ${order.salePrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tu Comisión</p>
                      <p className="text-lg font-bold text-green-400">
                        ${order.commission.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-dark-700">
                    <FiCalendar className="mr-1.5" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Servicio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Link</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Precio</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Comisión</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredOrders.map((order) => {
                    const statusDisplay = getOrderStatusDisplay(order.status)
                    return (
                      <tr key={order.id} className="hover:bg-dark-700 transition-colors">
                        <td className="px-4 py-4">
                          <div className="text-white font-mono text-sm">{order.orderId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white font-medium">{order.serviceName}</div>
                          <div className="text-xs text-gray-500">
                            {order.categoryName} › {order.subcategoryName}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={order.link.startsWith('http') ? order.link : `https://${order.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 truncate max-w-xs flex items-center"
                          >
                            <span className="truncate">{order.link}</span>
                            <FiExternalLink className="ml-1 flex-shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-white font-bold">${order.salePrice.toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-green-400 font-bold">${order.commission.toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusDisplay.color}`}>
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button - Desktop only, mobile has it in header */}
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
