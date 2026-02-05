'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  sort: number
  status: boolean
}

interface Subcategory {
  id: number
  name: string
  slug: string
  categoryId: number
  sort: number
  status: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/subcategories'),
      ])

      const categoriesData = await categoriesRes.json()
      const subcategoriesData = await subcategoriesRes.json()

      setCategories(categoriesData)
      setSubcategories(subcategoriesData)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (data: any) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Categoría creada')
        fetchData()
        setShowCategoryModal(false)
      } else {
        toast.error('Error al crear categoría')
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleCreateSubcategory = async (data: any) => {
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Subcategoría creada')
        fetchData()
        setShowSubcategoryModal(false)
      } else {
        toast.error('Error al crear subcategoría')
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
      <h1 className="text-3xl font-bold text-white mb-8">Categorías y Subcategorías</h1>

      {/* Categorías */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Categorías</h2>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Icon
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 text-white">{category.name}</td>
                  <td className="px-6 py-4 text-gray-300">{category.slug}</td>
                  <td className="px-6 py-4 text-2xl">{category.icon}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.status
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {category.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subcategorías */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Subcategorías</h2>
          <button
            onClick={() => setShowSubcategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Nueva Subcategoría</span>
          </button>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {subcategories.map((sub) => {
                const category = categories.find((c) => c.id === sub.categoryId)
                return (
                  <tr key={sub.id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4 text-white">{sub.name}</td>
                    <td className="px-6 py-4 text-gray-300">{sub.slug}</td>
                    <td className="px-6 py-4 text-gray-300">{category?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          sub.status
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {sub.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCreate={handleCreateCategory}
        />
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <SubcategoryModal
          categories={categories}
          onClose={() => setShowSubcategoryModal(false)}
          onCreate={handleCreateSubcategory}
        />
      )}
    </div>
  )
}

function CategoryModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Nueva Categoría</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (auto-generado)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emoji/Icono
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="📱 💬 👥"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            />
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

function SubcategoryModal({ categories, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Nueva Subcategoría</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría Principal
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (auto-generado)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
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
