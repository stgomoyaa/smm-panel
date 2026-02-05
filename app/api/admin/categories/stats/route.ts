import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUsdToClpRate } from '@/lib/exchange-rate'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener tasa de cambio
    const usdToClpRate = await getUsdToClpRate()

    // Obtener todas las órdenes completadas con sus servicios
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
      },
      include: {
        service: {
          select: {
            categoryId: true,
            subcategoryId: true,
            salePrice: true,
            apiProviderPrice: true,
          },
        },
      },
    })

    // Calcular ganancias por categoría
    const categoryStats: { [key: number]: { revenue: number, profit: number, orders: number } } = {}
    
    // Calcular ganancias por subcategoría
    const subcategoryStats: { [key: number]: { revenue: number, profit: number, orders: number } } = {}

    orders.forEach(order => {
      const costClp = Math.round(order.service.apiProviderPrice * usdToClpRate)
      const profit = order.service.salePrice - costClp

      // Stats por categoría
      if (!categoryStats[order.service.categoryId]) {
        categoryStats[order.service.categoryId] = { revenue: 0, profit: 0, orders: 0 }
      }
      categoryStats[order.service.categoryId].revenue += order.service.salePrice
      categoryStats[order.service.categoryId].profit += profit
      categoryStats[order.service.categoryId].orders += 1

      // Stats por subcategoría
      if (order.service.subcategoryId) {
        if (!subcategoryStats[order.service.subcategoryId]) {
          subcategoryStats[order.service.subcategoryId] = { revenue: 0, profit: 0, orders: 0 }
        }
        subcategoryStats[order.service.subcategoryId].revenue += order.service.salePrice
        subcategoryStats[order.service.subcategoryId].profit += profit
        subcategoryStats[order.service.subcategoryId].orders += 1
      }
    })

    return NextResponse.json({
      categories: categoryStats,
      subcategories: subcategoryStats,
    })
  } catch (error) {
    console.error('Error fetching category stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    )
  }
}
