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

    // Obtener todos los vendedores (no admin)
    const sellers = await prisma.user.findMany({
      where: {
        role: 'seller',
        status: true,
      },
      select: {
        id: true,
        name: true,
        commissionRate: true,
      },
    })

    const sellerProfits = []

    for (const seller of sellers) {
      // Obtener órdenes completadas del vendedor
      const orders = await prisma.order.findMany({
        where: {
          sellerId: seller.id,
          status: 'completed',
        },
        include: {
          service: {
            select: {
              salePrice: true,
              apiProviderPrice: true,
            },
          },
        },
      })

      let totalRevenue = 0
      let totalCost = 0

      orders.forEach(order => {
        totalRevenue += order.service.salePrice
        totalCost += Math.round(order.service.apiProviderPrice * usdToClpRate)
      })

      const grossProfit = totalRevenue - totalCost
      const commission = Math.round(grossProfit * (seller.commissionRate / 100))
      const netProfit = grossProfit - commission

      if (orders.length > 0) {
        sellerProfits.push({
          sellerId: seller.id,
          sellerName: seller.name,
          totalRevenue,
          totalCost,
          commission,
          netProfit,
          orderCount: orders.length,
        })
      }
    }

    // Ordenar por ganancia neta descendente
    sellerProfits.sort((a, b) => b.netProfit - a.netProfit)

    return NextResponse.json(sellerProfits)
  } catch (error) {
    console.error('Error fetching seller profits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller profits' },
      { status: 500 }
    )
  }
}
