import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'

const statusMapping: Record<string, string> = {
  'Pending': 'pending',
  'In progress': 'inprogress',
  'Processing': 'processing',
  'Completed': 'completed',
  'Partial': 'partial',
  'Canceled': 'canceled',
  'Refunded': 'refunded',
}

export async function GET(request: Request) {
  try {
    // Verificar cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener órdenes en proceso (que tienen api_order_id pero no están completadas)
    const activeOrders = await prisma.order.findMany({
      where: {
        apiOrderId: { not: null },
        status: {
          in: ['pending', 'processing', 'inprogress'],
        },
      },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
      },
      take: 100, // Procesar máximo 100 órdenes por ejecución
    })

    // Agrupar por proveedor para optimizar requests
    const ordersByProvider = new Map<number, typeof activeOrders>()
    
    for (const order of activeOrders) {
      if (!order.apiProviderId) continue
      
      if (!ordersByProvider.has(order.apiProviderId)) {
        ordersByProvider.set(order.apiProviderId, [])
      }
      ordersByProvider.get(order.apiProviderId)!.push(order)
    }

    let updated = 0
    let errors = 0

    // Procesar por proveedor
    for (const [providerId, orders] of ordersByProvider) {
      try {
        const provider = orders[0].service.provider
        if (!provider) continue

        const apiClient = new SMMApiClient({
          url: provider.url,
          apiKey: provider.apiKey,
        })

        // Obtener IDs de órdenes del proveedor
        const apiOrderIds = orders
          .map(o => o.apiOrderId)
          .filter((id): id is string => id !== null)

        // Consultar estados en batch
        const statuses = await apiClient.getMultipleOrderStatus(apiOrderIds)

        // Actualizar cada orden
        for (const order of orders) {
          if (!order.apiOrderId) continue

          const status = statuses[order.apiOrderId]
          if (!status) continue

          const newStatus = statusMapping[status.status] || 'processing'

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              statusApi: status.status,
              startCounter: parseInt(status.start_count) || 0,
              remains: parseInt(status.remains) || 0,
            },
          })

          updated++
        }
      } catch (error) {
        console.error(`Error updating orders for provider ${providerId}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      errors,
      total: activeOrders.length,
    })
  } catch (error) {
    console.error('Error in update-statuses cron:', error)
    return NextResponse.json(
      { error: 'Failed to update statuses' },
      { status: 500 }
    )
  }
}
