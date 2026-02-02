'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi'

interface Service {
  id: number
  serviceId: string
  name: string
  price: number
  originalPrice?: number
  discountValue?: number
  min: number
  max: number
  status: boolean
  category: {
    name: string
  }
  provider?: {
    name: string
  }
}

interface Category {
  id: number
  name: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const url = selectedCategory
        ? `/api/admin/services?categoryId=${selectedCategory}`
        : '/api/admin/services'
      
      const res = await fetch(url)
      const data = await res.json()
      setServices(data)
    } catch (error) {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateService = async (serviceId: number, updates: Partial<Service>) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success('Servicio actualizado')
        fetchServices()
        setEditingService(null)
      } else {
        toast.error('Error al actualizar servicio')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Servicio eliminado')
        fetchServices()
      } else {
        toast.error('Error al eliminar servicio')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  if (loading) {
    return <div className="text-white">Cargando...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Servicios</h1>
        
        <div className="flex items-center space-x-3">
          <FiFilter className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No hay servicios disponibles</p>
          <p className="text-sm text-gray-500">
            Ve a Proveedores y sincroniza servicios
          </p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Proveedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Min/Max
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.serviceId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {service.category.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {service.provider?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">${service.price}</div>
                      {service.discountValue && (
                        <div className="text-xs text-gray-500 line-through">
                          ${service.originalPrice}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {service.min} - {service.max}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          service.status
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {service.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingService(service)}
                          className="p-2 text-blue-400 hover:bg-dark-600 rounded-lg transition-colors"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Editar Servicio</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  defaultValue={editingService.price}
                  onChange={(e) =>
                    setEditingService({ ...editingService, price: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={editingService.status ? 'true' : 'false'}
                  onChange={(e) =>
                    setEditingService({ ...editingService, status: e.target.value === 'true' })
                  }
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => handleUpdateService(editingService.id, editingService)}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
