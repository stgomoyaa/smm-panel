import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUsdToClpRate } from '@/lib/exchange-rate'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener información del vendedor
    const seller = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        commissionRate: true,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Calcular ganancias de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayOrders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: 'completed',
        createdAt: {
          gte: today,
        },
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

    const usdToClpRate = await getUsdToClpRate()
    let todayEarnings = 0

    todayOrders.forEach(order => {
      const costClp = Math.round(order.service.apiProviderPrice * usdToClpRate)
      const grossProfit = order.service.salePrice - costClp
      const commission = Math.round(grossProfit * (seller.commissionRate / 100))
      todayEarnings += commission
    })

    return NextResponse.json({
      commissionRate: seller.commissionRate,
      todayEarnings,
    })
  } catch (error) {
    console.error('Error fetching seller info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller info' },
      { status: 500 }
    )
  }
}
