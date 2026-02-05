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

    // Contar proveedores
    const totalProviders = await prisma.apiProvider.count({
      where: { status: true }
    })

    // Contar servicios
    const totalServices = await prisma.service.count({
      where: { status: true }
    })

    // Contar órdenes totales
    const totalOrders = await prisma.order.count()

    // Contar órdenes completadas
    const completedOrders = await prisma.order.count({
      where: { status: 'completed' }
    })

    return NextResponse.json({
      totalProviders,
      totalServices,
      totalOrders,
      completedOrders,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

