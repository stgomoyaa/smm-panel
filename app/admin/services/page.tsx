'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi'

interface Service {
  id: number
  serviceId: string
  name: string
  quantity: number
  salePrice: number
  apiProviderPrice: number
  status: boolean
  category: {
    name: string
  }
  subcategory?: {
    name: string
  } | null
  provider?: {
    name: string
  }
}

interface Category {
  id: number
  name: string
}

interface Subcategory {
  id: number
  name: string
  categoryId: number
}

interface Provider {
  id: number
  name: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  useEffect(() => {
    fetchServices()
    fetchCategories()
    fetchProviders()
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

  const fetchSubcategories = async (categoryId?: number) => {
    try {
      const url = categoryId 
        ? `/api/admin/subcategories?categoryId=${categoryId}`
        : `/api/admin/subcategories`
      const res = await fetch(url)
      const data = await res.json()
      setSubcategories(data)
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/providers')
      const data = await res.json()
      setProviders(data)
    } catch (error) {
      console.error('Error fetching providers:', error)
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

  const handleCreateService = async (serviceData: any) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      })

      if (res.ok) {
        toast.success('Servicio creado')
        fetchServices()
        setShowCreateModal(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al crear servicio')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleBulkCreate = async (bulkText: string) => {
    try {
      // Parse bulk text: formato "quantity|price|apiServiceId|subcategoryId"
      const lines = bulkText.trim().split('\n')
      let successCount = 0
      let errorCount = 0

      for (const line of lines) {
        if (!line.trim()) continue
        
        const [quantity, salePrice, apiServiceId, subcategoryId, providerId] = line.split('|').map(s => s.trim())
        
        if (!quantity || !salePrice || !apiServiceId) {
          errorCount++
          continue
        }

        const serviceData = {
          name: `${quantity} unidades`,
          categoryId: categories[0]?.id, // Usar primera categoría por defecto
          subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
          quantity: parseInt(quantity),
          salePrice: parseFloat(salePrice),
          apiProviderId: providerId ? parseInt(providerId) : providers[0]?.id,
          apiServiceId,
          apiProviderPrice: 0,
        }

        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        })

        if (res.ok) {
          successCount++
        } else {
          errorCount++
        }
      }

      toast.success(`${successCount} servicios creados${errorCount > 0 ? `, ${errorCount} errores` : ''}`)
      fetchServices()
      setShowBulkModal(false)
    } catch (error) {
      toast.error('Error al procesar servicios bulk')
    }
  }

  if (loading) {
    return <div className="text-white">Cargando...</div>
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Servicios</h1>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
          >
            Crear Múltiples
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 md:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
          >
            + Nuevo
          </button>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FiFilter className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm md:text-base focus:ring-2 focus:ring-primary-500"
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
      </div>

      {services.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 md:p-12 text-center">
          <p className="text-gray-400 mb-4">No hay servicios disponibles</p>
          <p className="text-sm text-gray-500">
            Crea servicios desde el botón "+ Nuevo"
          </p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto min-w-full">
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
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Precio
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
                    <td className="px-6 py-4 text-gray-300">
                      {service.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">${service.salePrice.toLocaleString()} CLP</div>
                      <div className="text-xs text-gray-500">
                        Costo: ${Math.round(service.apiProviderPrice * 950).toLocaleString()} CLP
                      </div>
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
                  Precio de Venta
                </label>
                <input
                  type="number"
                  defaultValue={editingService.salePrice}
                  onChange={(e) =>
                    setEditingService({ ...editingService, salePrice: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  defaultValue={editingService.quantity}
                  onChange={(e) =>
                    setEditingService({ ...editingService, quantity: parseInt(e.target.value) })
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

      {/* Create Service Modal */}
      {showCreateModal && (
        <CreateServiceModal
          categories={categories}
          subcategories={subcategories}
          providers={providers}
          onFetchSubcategories={fetchSubcategories}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateService}
        />
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onCreate={handleBulkCreate}
        />
      )}
    </div>
  )
}

// Create Service Modal Component
function CreateServiceModal({ categories, subcategories, providers, onFetchSubcategories, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    quantity: '',
    salePrice: '',
    apiProviderId: '',
    apiServiceId: '',
    apiProviderPrice: '',
  })
  const [providerServices, setProviderServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [usdToClpRate, setUsdToClpRate] = useState(950)
  const [searchTerm, setSearchTerm] = useState('')

  // Obtener tasa de cambio al montar el componente
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
      .then(res => res.json())
      .then(data => {
        if (data.usd.clp) {
          setUsdToClpRate(data.usd.clp)
        }
      })
      .catch(() => {
        console.log('Using fallback rate: 950')
      })
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, categoryId, subcategoryId: '' })
    if (categoryId) {
      onFetchSubcategories(parseInt(categoryId))
    }
  }

  const handleProviderChange = async (providerId: string) => {
    setFormData({ ...formData, apiProviderId: providerId, apiServiceId: '', apiProviderPrice: '' })
    setProviderServices([])
    setSearchTerm('')
    
    if (!providerId) return
    
    setLoadingServices(true)
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/services`)
      if (res.ok) {
        const services = await res.json()
        console.log('📦 Servicios recibidos del proveedor:', services.length)
        console.log('🔍 Primeros 3 servicios:', services.slice(0, 3))
        console.log('🔍 Tipos de datos del campo service:', services.slice(0, 5).map((s: any) => ({
          service: s.service,
          type: typeof s.service
        })))
        setProviderServices(services)
      } else {
        toast.error('Error al cargar servicios del proveedor')
      }
    } catch (error) {
      console.error('❌ Error cargando servicios:', error)
      toast.error('Error al cargar servicios')
    } finally {
      setLoadingServices(false)
    }
  }

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value
    console.log('🔍 Servicio seleccionado:', serviceId, 'Tipo:', typeof serviceId)
    console.log('📋 Total servicios disponibles:', providerServices.length)
    
    if (!serviceId) {
      console.log('⚠️ Sin servicio seleccionado - reseteando formulario')
      setFormData({
        ...formData,
        apiServiceId: '',
        apiProviderPrice: '',
        name: '',
        quantity: '',
        salePrice: '',
      })
      return
    }
    
    // Comparar tanto como string como número
    const selectedService = providerServices.find(s => {
      const svcId = String(s.service)
      const selectedId = String(serviceId)
      console.log('🔍 Comparando:', svcId, '===', selectedId, '?', svcId === selectedId)
      return svcId === selectedId
    })
    console.log('🎯 Servicio encontrado:', selectedService)
    console.log('🔍 IDs disponibles (primeros 10):', providerServices.slice(0, 10).map((s: any) => s.service))
    
    if (selectedService) {
      const costUSD = parseFloat(selectedService.rate)
      const costCLP = Math.round(costUSD * usdToClpRate)
      
      console.log('💰 Costo USD:', costUSD)
      console.log('💵 Costo CLP:', costCLP)
      console.log('📊 Tasa de cambio:', usdToClpRate)
      
      const newFormData = {
        ...formData,
        name: selectedService.name,
        quantity: selectedService.min || '100',
        apiServiceId: selectedService.service,
        apiProviderPrice: costUSD.toString(),
        salePrice: Math.round(costCLP * 1.5).toString(),
      }
      
      console.log('✅ Nuevo formData:', newFormData)
      setFormData(newFormData)
    } else {
      console.error('❌ No se encontró el servicio con ID:', serviceId)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Servicio</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                Cantidad
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio de Venta (CLP)
              </label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                required
                placeholder="Precio final para el cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Costo Proveedor (CLP)
              </label>
              <div className="w-full px-4 py-3 bg-dark-600 border border-dark-600 rounded-lg text-gray-300">
                {formData.apiProviderPrice 
                  ? `$${Math.round(parseFloat(formData.apiProviderPrice) * usdToClpRate).toLocaleString()}`
                  : 'Se completa al seleccionar servicio'
                }
              </div>
              {formData.apiProviderPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  ${parseFloat(formData.apiProviderPrice).toFixed(2)} USD × ${usdToClpRate.toFixed(0)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subcategoría
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                disabled={!formData.categoryId}
              >
                <option value="">Sin subcategoría</option>
                {subcategories.map((sub: Subcategory) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Proveedor
            </label>
            <select
              value={formData.apiProviderId}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona un proveedor</option>
              {providers.map((prov: Provider) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {formData.apiProviderId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Servicio del Proveedor
              </label>
              
              {/* Campo de búsqueda */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID o nombre..."
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500"
              />
              
              {loadingServices ? (
                <div className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-400">
                  Cargando servicios...
                </div>
              ) : (
                <>
                  <select
                    value={formData.apiServiceId}
                    onChange={handleServiceSelect}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                    required
                    size={8}
                  >
                    <option value="">Selecciona un servicio</option>
                    {providerServices
                      .filter((service: any) => {
                        if (!searchTerm) return true
                        const search = searchTerm.toLowerCase()
                        return (
                          String(service.service).includes(search) ||
                          service.name.toLowerCase().includes(search)
                        )
                      })
                      .map((service: any) => {
                        const costCLP = Math.round(parseFloat(service.rate) * usdToClpRate)
                        return (
                          <option key={String(service.service)} value={String(service.service)}>
                            ID: {service.service} - {service.name} (${costCLP.toLocaleString()} CLP)
                          </option>
                        )
                      })}
                  </select>
                  <p className="text-xs text-gray-500">
                    {providerServices.filter((service: any) => {
                      if (!searchTerm) return true
                      const search = searchTerm.toLowerCase()
                      return (
                        service.service.toString().includes(search) ||
                        service.name.toLowerCase().includes(search)
                      )
                    }).length} de {providerServices.length} servicios
                  </p>
                </>
              )}
            </div>
          )}

          {formData.apiServiceId && (
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">💡 Información Calculada:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Costo Proveedor:</span>
                  <span className="text-red-400 font-bold">
                    ${Math.round(parseFloat(formData.apiProviderPrice || '0') * usdToClpRate).toLocaleString()} CLP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio Sugerido (50% margen):</span>
                  <span className="text-green-400 font-bold">
                    ${parseInt(formData.salePrice || '0').toLocaleString()} CLP
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dark-600">
                  <span className="text-gray-400">Ganancia estimada (sin comisión):</span>
                  <span className="text-blue-400 font-bold">
                    ${(parseInt(formData.salePrice || '0') - Math.round(parseFloat(formData.apiProviderPrice || '0') * usdToClpRate)).toLocaleString()} CLP
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
            >
              Crear Servicio
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

// Bulk Create Modal Component
function BulkCreateModal({ onClose, onCreate }: any) {
  const [bulkText, setBulkText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(bulkText)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Crear Múltiples Servicios</h2>
        <p className="text-gray-400 text-sm mb-6">
          Formato por línea: <code className="bg-dark-700 px-2 py-1 rounded">cantidad|precio|idServicioAPI|idSubcategoria|idProveedor</code>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Servicios (uno por línea)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              rows={15}
              placeholder="1000|5990|123|1|1&#10;2000|9990|124|1|1&#10;5000|19990|125|1|1"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Ejemplo: <code>1000|5990|123|1|1</code> crea un servicio de 1000 unidades a $5990
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Crear Servicios
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
