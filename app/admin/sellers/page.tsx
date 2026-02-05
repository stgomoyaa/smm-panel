'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi'

interface Seller {
  id: number
  email: string
  name: string
  role: string
  commissionRate: number
  status: boolean
  createdAt: string
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers')
      const data = await res.json()
      setSellers(data)
    } catch (error) {
      toast.error('Error al cargar vendedores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSeller = async (sellerData: any) => {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData),
      })

      if (res.ok) {
        toast.success('Vendedor creado exitosamente')
        fetchSellers()
        setShowCreateModal(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al crear vendedor')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleUpdateSeller = async (sellerId: number, updates: any) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast.success('Vendedor actualizado')
        fetchSellers()
        setEditingSeller(null)
      } else {
        toast.error('Error al actualizar vendedor')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleDeleteSeller = async (sellerId: number) => {
    if (!confirm('¿Estás seguro de eliminar este vendedor?')) return

    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Vendedor eliminado')
        fetchSellers()
      } else {
        toast.error('Error al eliminar vendedor')
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
        <h1 className="text-3xl font-bold text-white">Vendedores</h1>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
        >
          <FiUserPlus />
          <span>Nuevo Vendedor</span>
        </button>
      </div>

      {sellers.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
          <p className="text-gray-400">No hay vendedores registrados</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Vendedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Comisión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{seller.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {seller.commissionRate}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          seller.status
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {seller.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          seller.role === 'admin'
                            ? 'bg-purple-900 text-purple-300'
                            : 'bg-blue-900 text-blue-300'
                        }`}
                      >
                        {seller.role === 'admin' ? 'Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingSeller(seller)}
                          className="p-2 text-blue-400 hover:bg-dark-600 rounded-lg transition-colors"
                        >
                          <FiEdit2 />
                        </button>
                        {seller.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteSeller(seller.id)}
                            className="p-2 text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSellerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSeller}
        />
      )}

      {/* Edit Modal */}
      {editingSeller && (
        <EditSellerModal
          seller={editingSeller}
          onClose={() => setEditingSeller(null)}
          onUpdate={handleUpdateSeller}
        />
      )}
    </div>
  )
}

function CreateSellerModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
    commissionRate: '20',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Crear Vendedor</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comisión (%)
            </label>
            <input
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="seller">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditSellerModal({ seller, onClose, onUpdate }: any) {
  const [formData, setFormData] = useState({
    commissionRate: seller.commissionRate,
    status: seller.status,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(seller.id, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Editar Vendedor</h2>
        <p className="text-gray-400 mb-6">{seller.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comisión (%)
            </label>
            <input
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={formData.status ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
