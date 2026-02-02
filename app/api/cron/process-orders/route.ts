import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'

export async function GET(request: Request) {
  try {
    // Verificar cron secret (opcional pero recomendado)
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener órdenes pendientes (awaiting, sin api_order_id)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'awaiting',
        apiOrderId: null,
      },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
      },
      take: 50, // Procesar máximo 50 órdenes por ejecución
    })

    let processed = 0
    let errors = 0

    for (const order of pendingOrders) {
      try {
        if (!order.service.provider) continue

        const apiClient = new SMMApiClient({
          url: order.service.provider.url,
          apiKey: order.service.provider.apiKey,
        })

        const response = await apiClient.createOrder({
          service: order.apiServiceId!,
          link: order.link,
          quantity: order.quantity,
        })

        if (response.order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              apiOrderId: response.order,
              status: 'pending',
              statusApi: 'Pending',
            },
          })
          processed++
        } else if (response.error) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'error',
              note: response.error,
            },
          })
          errors++
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: pendingOrders.length,
    })
  } catch (error) {
    console.error('Error in process-orders cron:', error)
    return NextResponse.json(
      { error: 'Failed to process orders' },
      { status: 500 }
    )
  }
}

