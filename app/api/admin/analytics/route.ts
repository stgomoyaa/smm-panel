import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const sellerId = searchParams.get('sellerId')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const where: any = {
      createdAt: {
        gte: startDate,
      },
    }

    if (sellerId) {
      where.sellerId = parseInt(sellerId)
    }

    // Obtener órdenes
    const orders = await prisma.order.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular estadísticas
    const totalSales = orders.reduce((sum, order) => sum + order.salePrice, 0)
    const totalProviderCost = orders.reduce((sum, order) => sum + order.providerCost, 0)
    const totalCommissions = orders.reduce((sum, order) => sum + order.commission, 0)
    const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0)

    // Ventas por vendedor
    const salesBySeller = orders.reduce((acc, order) => {
      const sellerId = order.seller.id
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: order.seller,
          totalSales: 0,
          totalOrders: 0,
          totalCommissions: 0,
          totalProfit: 0,
        }
      }
      acc[sellerId].totalSales += order.salePrice
      acc[sellerId].totalOrders += 1
      acc[sellerId].totalCommissions += order.commission
      acc[sellerId].totalProfit += order.profit
      return acc
    }, {} as Record<number, any>)

    // Ventas por categoría
    const salesByCategory = orders.reduce((acc, order) => {
      const category = order.categoryName
      if (!acc[category]) {
        acc[category] = {
          category,
          totalSales: 0,
          totalOrders: 0,
        }
      }
      acc[category].totalSales += order.salePrice
      acc[category].totalOrders += 1
      return acc
    }, {} as Record<string, any>)

    // Ventas por día
    const salesByDay = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          totalSales: 0,
          totalOrders: 0,
          totalProfit: 0,
        }
      }
      acc[date].totalSales += order.salePrice
      acc[date].totalOrders += 1
      acc[date].totalProfit += order.profit
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        totalSales,
        totalProviderCost,
        totalCommissions,
        totalProfit,
      },
      salesBySeller: Object.values(salesBySeller),
      salesByCategory: Object.values(salesByCategory),
      salesByDay: Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date)),
      recentOrders: orders.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
