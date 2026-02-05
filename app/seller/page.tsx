'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { FiCheckCircle, FiTrendingUp, FiDollarSign, FiShoppingBag, FiChevronRight, FiChevronLeft } from 'react-icons/fi'

interface Category {
  id: number
  name: string
  icon?: string | null
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
  apiProviderPrice: number
}

interface SellerInfo {
  commissionRate: number
  todayEarnings: number
}

export default function SellerPage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')
  const [lastCommission, setLastCommission] = useState(0)
  const [sellerInfo, setSellerInfo] = useState<SellerInfo>({ commissionRate: 20, todayEarnings: 0 })
  const [usdToClpRate, setUsdToClpRate] = useState(860)

  // Wizard steps for mobile
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  useEffect(() => {
    fetchCategories()
    fetchSellerInfo()
    fetchExchangeRate()
  }, [])

  useEffect(() => {
    if (selectedSubcategory) {
      fetchServices(selectedSubcategory)
    }
  }, [selectedSubcategory])

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
      if (res.ok) {
        const data = await res.json()
        const rate = data.usd.clp
        if (rate) setUsdToClpRate(rate)
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
    }
  }

  const fetchSellerInfo = async () => {
    try {
      const res = await fetch('/api/seller/info')
      if (res.ok) {
        const data = await res.json()
        setSellerInfo(data)
      }
    } catch (error) {
      console.error('Error fetching seller info:', error)
    }
  }

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

  const calculateCommission = (service: Service) => {
    const costClp = Math.round(service.apiProviderPrice * usdToClpRate)
    const grossProfit = service.salePrice - costClp
    const commission = Math.round(grossProfit * (sellerInfo.commissionRate / 100))
    return commission
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
        const commission = calculateCommission(selectedService)
        setLastOrderId(data.orderId)
        setLastCommission(commission)
        setShowSuccess(true)
        
        // Reset form
        setLink('')
        setCustomerName('')
        setCustomerContact('')
        setSelectedService(null)
        setSelectedSubcategory(null)
        setSelectedCategory(null)
        setCurrentStep(1)
        
        // Update today earnings
        fetchSellerInfo()
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

  const canGoNext = () => {
    if (currentStep === 1) return selectedCategory !== null
    if (currentStep === 2) return selectedSubcategory !== null
    if (currentStep === 3) return selectedService !== null
    if (currentStep === 4) return link.trim() !== ''
    return true
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-dark-800 border-2 border-green-500 rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="text-5xl text-green-400" />
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              ✅ ¡Venta Registrada!
            </h2>
            <p className="text-gray-400 text-sm">
              ID: {lastOrderId}
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl p-6">
            <div className="flex items-center justify-center mb-2">
              <FiDollarSign className="text-2xl text-green-400 mr-2" />
              <span className="text-gray-300 text-sm">Ganaste</span>
            </div>
            <div className="text-4xl font-bold text-green-400">
              ${lastCommission.toLocaleString()} CLP
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Comisión del {sellerInfo.commissionRate}%
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              📝 Registrar Otra Venta
            </button>
            
            <button
              onClick={() => window.location.href = '/seller/orders'}
              className="w-full py-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all"
            >
              Ver Mis Ventas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Header con stats motivacionales */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              👋 Hola, {session?.user?.name || 'Vendedor'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Registra ventas y gana comisiones
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <FiTrendingUp className="text-green-400 mr-2" />
              <span className="text-xs text-gray-400">Hoy ganaste</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-400">
              ${sellerInfo.todayEarnings.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-700/50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <FiDollarSign className="text-primary-400 mr-2" />
              <span className="text-xs text-gray-400">Tu comisión</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-primary-400">
              {sellerInfo.commissionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Banner de confianza */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-xl p-4 mb-6 md:mb-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-2xl">🔒</div>
          <div className="text-sm text-gray-300 space-y-1">
            <p>✓ Todas las ventas quedan registradas</p>
            <p>✓ Pagos garantizados</p>
            <p>✓ Comisiones calculadas automáticamente</p>
          </div>
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Paso {currentStep} de {totalSteps}</span>
          <span className="text-sm text-primary-400 font-semibold">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center">
            <FiShoppingBag className="mr-2" />
            Registrar Nueva Venta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Categoría */}
            <div className={`${currentStep !== 1 && 'hidden md:block'}`}>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="md:hidden text-primary-400 font-bold text-lg">Paso 1:</span> Red Social
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id)
                      setSelectedSubcategory(null)
                      setSelectedService(null)
                      if (currentStep === 1) setCurrentStep(2)
                    }}
                    className={`p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
                      selectedCategory === cat.id
                        ? 'border-primary-500 bg-primary-900/30 shadow-lg shadow-primary-500/20 scale-[1.02]'
                        : 'border-dark-600 bg-dark-700 hover:border-dark-500 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-white font-bold text-lg">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Subcategoría */}
            {selectedCat && (
              <div className={`${currentStep !== 2 && 'hidden md:block'}`}>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <span className="md:hidden text-primary-400 font-bold text-lg">Paso 2:</span> Tipo de Servicio
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubcategory(sub.id)
                        setSelectedService(null)
                        if (currentStep === 2) setCurrentStep(3)
                      }}
                      className={`p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
                        selectedSubcategory === sub.id
                          ? 'border-primary-500 bg-primary-900/30 shadow-lg shadow-primary-500/20 scale-[1.02]'
                          : 'border-dark-600 bg-dark-700 hover:border-dark-500 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="text-white font-bold text-lg">{sub.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Cantidad/Servicio */}
            {selectedSubcategory && services.length > 0 && (
              <div className={`${currentStep !== 3 && 'hidden md:block'}`}>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <span className="md:hidden text-primary-400 font-bold text-lg">Paso 3:</span> Cantidad
                </label>
                
                {/* Mobile: Horizontal scroll */}
                <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
                  <div className="flex space-x-3" style={{ width: 'max-content' }}>
                    {services.map((service) => {
                      const commission = calculateCommission(service)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedService(service)
                            if (currentStep === 3) setCurrentStep(4)
                          }}
                          className={`p-5 rounded-xl border-2 transition-all w-48 flex-shrink-0 ${
                            selectedService?.id === service.id
                              ? 'border-primary-500 bg-primary-900/30 shadow-lg shadow-primary-500/30 scale-105'
                              : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                          }`}
                        >
                          <div className="text-white font-bold text-2xl mb-2">
                            {service.quantity.toLocaleString()}
                          </div>
                          <div className="text-primary-400 font-bold text-xl mb-3">
                            ${service.salePrice.toLocaleString()}
                          </div>
                          <div className="border-t border-dark-600 pt-3">
                            <div className="text-xs text-gray-400 mb-1">💰 Tu comisión</div>
                            <div className="text-green-400 font-bold text-lg">
                              ${commission.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => {
                    const commission = calculateCommission(service)
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`p-5 rounded-xl border-2 transition-all ${
                          selectedService?.id === service.id
                            ? 'border-primary-500 bg-primary-900/30 shadow-lg shadow-primary-500/20 scale-[1.03]'
                            : 'border-dark-600 bg-dark-700 hover:border-dark-500 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="text-white font-bold text-2xl mb-2">
                          {service.quantity.toLocaleString()}
                        </div>
                        <div className="text-primary-400 font-bold text-xl mb-3">
                          ${service.salePrice.toLocaleString()}
                        </div>
                        <div className="border-t border-dark-600 pt-3">
                          <div className="text-xs text-gray-400 mb-1">💰 Tu comisión</div>
                          <div className="text-green-400 font-bold">
                            ${commission.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedService && (
                  <div className="mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <FiDollarSign className="text-xl" />
                      <span className="font-semibold">
                        Ganarás ${calculateCommission(selectedService).toLocaleString()} de comisión
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Link */}
            {selectedService && (
              <div className={`${currentStep !== 4 && 'hidden md:block'}`}>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <span className="md:hidden text-primary-400 font-bold text-lg">Paso 4:</span> Link o Usuario *
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="@username o https://..."
                  className="w-full px-4 py-4 bg-dark-700 border-2 border-dark-600 rounded-lg text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus={currentStep === 4}
                />
                <p className="text-xs text-gray-400 mt-2">
                  ⏱ Tiempo estimado: Inmediato
                </p>
              </div>
            )}

            {/* Step 5: Datos opcionales y submit */}
            {link && (
              <div className={`space-y-4 ${currentStep !== 5 && 'hidden md:block'}`}>
                <div className="bg-dark-700 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">
                    <span className="md:hidden text-primary-400 font-bold text-lg">Paso 5:</span> Datos del Cliente (Opcional)
                  </h3>
                  
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
                  />
                  
                  <input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="Email o teléfono"
                    className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Submit Desktop */}
                <button
                  type="submit"
                  disabled={loading || !selectedService}
                  className="hidden md:block w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/50 text-lg"
                >
                  {loading ? '⏳ Registrando...' : '✅ Registrar Venta'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Navigation Buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-700 p-4 flex items-center space-x-3 z-50">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all flex items-center"
          >
            <FiChevronLeft className="mr-1" />
            Atrás
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => canGoNext() && setCurrentStep(currentStep + 1)}
            disabled={!canGoNext()}
            className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center text-lg"
          >
            Continuar
            <FiChevronRight className="ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedService}
            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
          >
            {loading ? '⏳ Registrando...' : '✅ Confirmar Venta'}
          </button>
        )}
      </div>

      {/* Desktop Sticky CTA (when scrolled) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        {selectedService && currentStep >= 4 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-full shadow-2xl shadow-primary-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center space-x-2 animate-in slide-in-from-bottom duration-300"
          >
            <FiCheckCircle />
            <span>{loading ? 'Registrando...' : 'Registrar Venta'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
