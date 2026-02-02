'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiPlus, FiRefreshCw, FiTrash2, FiCheck, FiX } from 'react-icons/fi'

interface Provider {
  id: number
  name: string
  url: string
  apiKey: string
  balance: number
  currency: string
  status: boolean
  createdAt: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [syncing, setSyncing] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    apiKey: '',
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/providers')
      const data = await res.json()
      setProviders(data)
    } catch (error) {
      toast.error('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Proveedor añadido exitosamente')
        setShowModal(false)
        setFormData({ name: '', url: '', apiKey: '' })
        fetchProviders()
      } else {
        toast.error(data.error || 'Error al añadir proveedor')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleSync = async (providerId: number) => {
    setSyncing(providerId)
    
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/sync`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`${data.syncedCount} servicios sincronizados`)
      } else {
        toast.error(data.error || 'Error al sincronizar')
      }
    } catch (error) {
      toast.error('Error al sincronizar servicios')
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (providerId: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return

    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Proveedor eliminado')
        fetchProviders()
      } else {
        toast.error('Error al eliminar proveedor')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  if (loading) {
    return (
      <div className="text-white">Cargando...</div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Proveedores SMM</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <FiPlus />
          <span>Añadir Proveedor</span>
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No hay proveedores configurados</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Añadir tu primer proveedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-400 break-all">{provider.url}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.status ? (
                    <span className="flex items-center space-x-1 text-green-400 text-sm">
                      <FiCheck />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-red-400 text-sm">
                      <FiX />
                      <span>Inactivo</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-dark-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Balance:</span>
                  <span className="text-lg font-bold text-primary-400">
                    {provider.balance} {provider.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSync(provider.id)}
                  disabled={syncing === provider.id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={syncing === provider.id ? 'animate-spin' : ''} />
                  <span>{syncing === provider.id ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>
                
                <button
                  onClick={() => handleDelete(provider.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Añadir Proveedor</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="1x Panel"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de la API
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://api.provider.com/v2"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="tu-api-key-aqui"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '', url: '', apiKey: '' })
                  }}
                  className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
