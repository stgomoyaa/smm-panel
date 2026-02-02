'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: number
  name: string
}

interface Service {
  id: number
  name: string
  quantity: number
  salePrice: number
}

export default function SellerPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedSubcategory) {
      fetchServices(selectedSubcategory)
    }
  }, [selectedSubcategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/seller/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      toast.error('Error al cargar categorías')
    }
  }

  const fetchServices = async (subcategoryId: number) => {
    try {
      const res = await fetch(`/api/seller/services?subcategoryId=${subcategoryId}`)
      const data = await res.json()
      setServices(data)
      setSelectedService(null)
    } catch (error) {
      toast.error('Error al cargar servicios')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService) {
      toast.error('Selecciona un servicio')
      return
    }

    if (!link) {
      toast.error('Ingresa el link/usuario')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/seller/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link,
          customerName: customerName || undefined,
          customerContact: customerContact || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`¡Venta registrada! ID: ${data.orderId}`)
        // Resetear formulario
        setLink('')
        setCustomerName('')
        setCustomerContact('')
        setSelectedService(null)
        setSelectedSubcategory(null)
        setSelectedCategory(null)
      } else {
        toast.error(data.error || 'Error al registrar venta')
      }
    } catch (error) {
      toast.error('Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  const selectedCat = categories.find(c => c.id === selectedCategory)

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Registrar Nueva Venta</h1>

      <div className="max-w-2xl">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categoría (Instagram, TikTok, etc.) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Red Social
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(Number(e.target.value))
                  setSelectedSubcategory(null)
                  setSelectedService(null)
                }}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona red social</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría (Seguidores, Likes, etc.) */}
            {selectedCat && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Servicio
                </label>
                <select
                  value={selectedSubcategory || ''}
                  onChange={(e) => {
                    setSelectedSubcategory(Number(e.target.value))
                    setSelectedService(null)
                  }}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona tipo</option>
                  {selectedCat.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cantidad */}
            {selectedSubcategory && services.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedService?.id === service.id
                          ? 'border-primary-500 bg-primary-900/30'
                          : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                      }`}
                    >
                      <div className="text-white font-bold text-lg">
                        {service.quantity.toLocaleString()}
                      </div>
                      <div className="text-primary-400 font-bold">
                        ${service.salePrice.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link/Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link o Usuario *
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="@username o https://..."
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Donde se aplicará el servicio
              </p>
            </div>

            {/* Datos del cliente (opcional) */}
            <div className="bg-dark-700 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-300">
                Datos del Cliente (Opcional)
              </h3>
              
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="text"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="Email o teléfono"
                className="w-full px-4 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !selectedService}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/50"
            >
              {loading ? 'Registrando...' : '✅ Registrar Venta'}
            </button>

            {selectedService && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
                <p className="text-green-300 text-sm">
                  <strong>Precio de venta:</strong> ${selectedService.salePrice.toLocaleString()}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
