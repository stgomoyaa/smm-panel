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
  const [usdToClpRate, setUsdToClpRate] = useState(950) // Fallback rate

  useEffect(() => {
    fetchServices()
    fetchCategories()
    fetchProviders()
    fetchExchangeRate()
  }, [selectedCategory])

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
      if (res.ok) {
        const data = await res.json()
        const rate = data.usd.clp
        if (rate) {
          setUsdToClpRate(rate)
          console.log('💱 Tasa de cambio actualizada:', rate)
        }
      }
    } catch (error) {
      console.error('Error obteniendo tasa de cambio:', error)
    }
  }

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
      const lines = bulkText.trim().split('\n')
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Obtener servicios del proveedor para calcular costos
      const providerServicesCache: { [key: number]: any[] } = {}
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const parts = line.split('|').map(s => s.trim())
        
        // Formato flexible:
        // 5 campos: cantidad|precio|idServicioAPI|idSubcategoria|idProveedor (nombre auto)
        // 6 campos: nombre|cantidad|precio|idServicioAPI|idSubcategoria|idProveedor (nombre personalizado)
        let name, quantity, salePrice, apiServiceId, subcategoryId, providerId
        
        if (parts.length === 5) {
          // Formato sin nombre personalizado
          [quantity, salePrice, apiServiceId, subcategoryId, providerId] = parts
          name = `${quantity} unidades`
        } else if (parts.length === 6) {
          // Formato con nombre personalizado
          [name, quantity, salePrice, apiServiceId, subcategoryId, providerId] = parts
        } else {
          errors.push(`Línea ${i + 1}: formato inválido (debe tener 5 o 6 campos)`)
          errorCount++
          continue
        }
        
        if (!quantity || !salePrice || !apiServiceId) {
          errors.push(`Línea ${i + 1}: faltan campos obligatorios`)
          errorCount++
          continue
        }

        const finalProviderId = providerId ? parseInt(providerId) : providers[0]?.id
        
        // Obtener servicios del proveedor (cacheado)
        if (!providerServicesCache[finalProviderId]) {
          try {
            const res = await fetch(`/api/admin/providers/${finalProviderId}/services`)
            if (res.ok) {
              providerServicesCache[finalProviderId] = await res.json()
            } else {
              providerServicesCache[finalProviderId] = []
            }
          } catch (error) {
            providerServicesCache[finalProviderId] = []
          }
        }

        // Buscar el costo del servicio en la API del proveedor
        const providerService = providerServicesCache[finalProviderId].find(
          (s: any) => String(s.service) === String(apiServiceId)
        )
        
        const apiProviderPrice = providerService ? parseFloat(providerService.rate) : 0
        
        console.log(`💰 Servicio ${apiServiceId}: Costo USD $${apiProviderPrice}`)

        const serviceData = {
          name: name || `${quantity} unidades`,
          categoryId: categories[0]?.id,
          subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
          quantity: parseInt(quantity),
          salePrice: parseFloat(salePrice),
          apiProviderId: finalProviderId,
          apiServiceId,
          apiProviderPrice,
        }

        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        })

        if (res.ok) {
          successCount++
        } else {
          const data = await res.json().catch(() => ({ error: 'Error desconocido' }))
          errors.push(`Línea ${i + 1}: ${data.error}`)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} servicios creados${errorCount > 0 ? ` | ❌ ${errorCount} errores` : ''}`)
      }
      
      if (errors.length > 0 && errors.length <= 5) {
        errors.forEach(err => toast.error(err, { duration: 5000 }))
      } else if (errors.length > 5) {
        toast.error(`${errors.length} errores encontrados. Revisa el formato.`, { duration: 5000 })
      }
      
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
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Servicio
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Categoría
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Proveedor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Precio / Costo
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Margen
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {services.map((service) => {
                  const costClp = Math.round(service.apiProviderPrice * usdToClpRate)
                  const margin = service.salePrice - costClp
                  const marginPercent = costClp > 0 ? ((margin / costClp) * 100).toFixed(0) : 0
                  
                  return (
                    <tr key={service.id} className="hover:bg-dark-700 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-white font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.serviceId}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-300 text-sm">
                        {service.category.name}
                      </td>
                      <td className="px-4 py-4 text-gray-300 text-sm">
                        {service.provider?.name || '-'}
                      </td>
                      <td className="px-4 py-4 text-gray-300 text-sm">
                        {service.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white font-bold text-sm">${service.salePrice.toLocaleString()} CLP</div>
                        <div className="text-xs text-gray-500">
                          Costo: ${costClp.toLocaleString()} CLP
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm font-semibold ${margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${margin.toLocaleString()} CLP
                        </div>
                        <div className="text-xs text-gray-500">
                          {marginPercent}% ganancia
                        </div>
                      </td>
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4 text-right">
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
                  )
                })}
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
            <p className="text-sm text-gray-400 mb-4">ID: {editingService.serviceId}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
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
                  value={editingService.quantity}
                  onChange={(e) =>
                    setEditingService({ ...editingService, quantity: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio de Venta (CLP)
                </label>
                <input
                  type="number"
                  value={editingService.salePrice}
                  onChange={(e) =>
                    setEditingService({ ...editingService, salePrice: parseFloat(e.target.value) })
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
      
      // Calcular cantidad sugerida (entre min y max, buscando un valor realista)
      const minQty = parseInt(selectedService.min) || 100
      const maxQty = parseInt(selectedService.max) || 10000
      
      // Si el min es muy bajo (<100), sugerir 1000
      // Si el min es razonable (>=100), usar el min
      let suggestedQty = minQty
      if (minQty < 100) {
        suggestedQty = Math.min(1000, maxQty)
      }
      
      // Precio sugerido: costCLP × 1.5 (50% de margen sobre el costo)
      const suggestedPrice = Math.round(costCLP * 1.5)
      
      console.log('💰 Costo USD:', costUSD)
      console.log('💵 Costo CLP:', costCLP)
      console.log('📊 Tasa de cambio:', usdToClpRate)
      console.log('📦 Min/Max:', minQty, '/', maxQty)
      console.log('🎯 Cantidad sugerida:', suggestedQty)
      console.log('💲 Precio sugerido:', suggestedPrice)
      
      const newFormData = {
        ...formData,
        name: selectedService.name,
        quantity: suggestedQty.toString(),
        apiServiceId: selectedService.service,
        apiProviderPrice: costUSD.toString(),
        salePrice: suggestedPrice.toString(),
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
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Crear Múltiples Servicios</h2>
        
        <div className="bg-dark-700 rounded-lg p-4 mb-6 space-y-3">
          <h3 className="text-lg font-semibold text-white mb-2">📝 Formatos Permitidos:</h3>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-300 mb-1">✅ <strong>Con nombre personalizado</strong> (6 campos):</p>
              <code className="block bg-dark-600 px-3 py-2 rounded text-sm text-green-400">
                nombre|cantidad|precio|idServicioAPI|idSubcategoria|idProveedor
              </code>
            </div>
            
            <div>
              <p className="text-sm text-gray-300 mb-1">✅ <strong>Sin nombre</strong> (5 campos, nombre auto-generado):</p>
              <code className="block bg-dark-600 px-3 py-2 rounded text-sm text-blue-400">
                cantidad|precio|idServicioAPI|idSubcategoria|idProveedor
              </code>
            </div>
          </div>

          <div className="border-t border-dark-600 pt-3 mt-3">
            <p className="text-xs text-gray-400 mb-2">
              <strong>Campos:</strong>
            </p>
            <ul className="text-xs text-gray-400 space-y-1 ml-4">
              <li>• <strong>nombre</strong>: Nombre descriptivo del servicio (opcional)</li>
              <li>• <strong>cantidad</strong>: Cantidad de unidades (requerido)</li>
              <li>• <strong>precio</strong>: Precio de venta en CLP (requerido)</li>
              <li>• <strong>idServicioAPI</strong>: ID del servicio en la API del proveedor (requerido)</li>
              <li>• <strong>idSubcategoria</strong>: ID de la subcategoría (opcional, dejar vacío si no aplica)</li>
              <li>• <strong>idProveedor</strong>: ID del proveedor (opcional, usa el primero por defecto)</li>
            </ul>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Servicios (uno por línea)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              rows={12}
              placeholder="Instagram Followers 1K|1000|5990|1452|1|1&#10;Instagram Likes 5K|5000|9990|1453|1|1&#10;2000|4990|1454|2|1"
              required
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-400">
                <strong>Ejemplos:</strong>
              </p>
              <p className="text-xs text-gray-500">
                • <code className="bg-dark-700 px-1 rounded">Instagram Followers 1K|1000|5990|1452|1|1</code>
              </p>
              <p className="text-xs text-gray-500">
                • <code className="bg-dark-700 px-1 rounded">5000|9990|1453||1</code> (sin nombre ni subcategoría)
              </p>
            </div>
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
