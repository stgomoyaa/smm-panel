'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiFilter, FiRefreshCw } from 'react-icons/fi'
import { getOrderStatusDisplay, formatDate } from '@/lib/utils'

interface Order {
  id: number
  orderId: string
  customerName: string | null
  customerContact: string | null
  serviceName: string
  link: string
  quantity: number
  salePrice: number
  providerCost: number
  commission: number
  profit: number
  status: string
  statusApi?: string
  remains?: number
  createdAt: string
  service: {
    category: {
      name: string
    }
  }
  seller: {
    name: string
    email: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus, pagination.page])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white">Cargando...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Órdenes</h1>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg hover:bg-dark-700 transition-colors"
          >
            <FiRefreshCw />
            <span>Actualizar</span>
          </button>

          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="awaiting">Esperando</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="inprogress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="partial">Parcial</option>
              <option value="canceled">Cancelado</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
          <p className="text-gray-400">No hay órdenes aún</p>
        </div>
      ) : (
        <>
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Vendedor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Precio Venta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Comisión
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Costo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Ganancia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                      Estado
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
                          <div className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-300">
                            {order.customerContact || order.customerName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {order.link}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-300">{order.seller?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.seller?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">{order.serviceName}</div>
                          <div className="text-xs text-gray-500">
                            {order.quantity.toLocaleString()} unidades
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-bold">
                            ${order.salePrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-orange-400">
                            ${order.commission.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">20%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-red-400">
                            ${Math.round(order.providerCost * 950).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">${order.providerCost.toFixed(2)} USD</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-bold ${order.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${order.profit.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((order.profit / order.salePrice) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${statusDisplay.color}`}
                          >
                            {statusDisplay.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-dark-800 border border-dark-700 rounded-xl">
              <div className="text-gray-400 text-sm">
                Mostrando {orders.length} de {pagination.total} órdenes
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-white">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
