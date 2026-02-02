import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'CLP'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${timestamp}${random}`
}

export function generateServiceId(): string {
  const random = Math.random().toString(36).substring(2, 12)
  return `sf${random}`
}

export const orderStatusMap: Record<string, { label: string; color: string }> = {
  awaiting: { label: 'Esperando', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  inprogress: { label: 'En Progreso', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  partial: { label: 'Parcial', color: 'bg-orange-100 text-orange-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-800' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800' },
}

export function getOrderStatusDisplay(status: string) {
  return orderStatusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
}
