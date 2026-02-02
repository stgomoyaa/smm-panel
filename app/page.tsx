'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string
}

interface Service {
  id: number
  serviceId: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  discountValue?: number
  quantity: number
  min: number
  max: number
  averageTime?: string
  refillEnabled: boolean
  serviceType: string
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedService) {
      setQuantity(selectedService.quantity)
    }
  }, [selectedService])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      toast.error('Error al cargar categorías')
    }
  }

  const fetchServices = async (categoryId: number) => {
    try {
      const res = await fetch(`/api/public/services?categoryId=${categoryId}`)
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

    if (!email || !link) {
      toast.error('Completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          serviceId: selectedService.serviceId,
          link,
          quantity,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`¡Orden creada! ID: ${data.orderId}`)
        // Resetear formulario
        setEmail('')
        setLink('')
        setSelectedService(null)
        setSelectedCategory(null)
      } else {
        toast.error(data.error || 'Error al crear orden')
      }
    } catch (error) {
      toast.error('Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">PuraFama</h1>
          <p className="text-gray-400">Panel de Social Media Marketing</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Servicio
                </label>
                <select
                  value={selectedService?.id || ''}
                  onChange={(e) => {
                    const service = services.find(s => s.id === Number(e.target.value))
                    setSelectedService(service || null)
                  }}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={!selectedCategory}
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.discountValue ? (
                        <>
                          <span className="line-through">${service.originalPrice}</span> ${service.price}
                        </>
                      ) : (
                        `$${service.price}`
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Info */}
              {selectedService && (
                <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Precio:</span>
                    <span className="text-2xl font-bold text-primary-400">
                      ${selectedService.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Min: {selectedService.min}</span>
                    <span className="text-gray-400">Max: {selectedService.max}</span>
                  </div>
                  {selectedService.averageTime && (
                    <div className="mt-2 text-sm text-gray-400">
                      ⏱️ Tiempo promedio: {selectedService.averageTime}
                    </div>
                  )}
                </div>
              )}

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="@username o URL"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Quantity */}
              {selectedService && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={selectedService.min}
                    max={selectedService.max}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Min: {selectedService.min} - Max: {selectedService.max}
                  </p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !selectedService}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/50"
              >
                {loading ? 'Procesando...' : 'Ordenar Ahora'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
