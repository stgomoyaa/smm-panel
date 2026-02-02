import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: params.orderId },
      include: {
        service: {
          select: {
            name: true,
            categoryId: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId: order.orderId,
      serviceName: order.serviceName,
      link: order.link,
      quantity: order.quantity,
      charge: order.salePrice,
      status: order.status,
      statusApi: order.statusApi,
      startCounter: order.startCounter,
      remains: order.remains,
      note: order.note,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    )
  }
}
