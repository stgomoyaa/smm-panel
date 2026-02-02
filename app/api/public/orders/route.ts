import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'
import { generateOrderId } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, serviceId, link, quantity } = body

    // Validar campos requeridos
    if (!email || !serviceId || !link) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener servicio
    const service = await prisma.service.findUnique({
      where: { serviceId },
      include: {
        provider: true,
      },
    })

    if (!service || !service.status) {
      return NextResponse.json(
        { error: 'Servicio no encontrado o inactivo' },
        { status: 404 }
      )
    }

    // Validar cantidad
    const orderQuantity = quantity || service.quantity
    if (orderQuantity < service.min || orderQuantity > service.max) {
      return NextResponse.json(
        { error: `La cantidad debe estar entre ${service.min} y ${service.max}` },
        { status: 400 }
      )
    }

    // Crear orden local
    const order = await prisma.order.create({
      data: {
        orderId: generateOrderId(),
        email,
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.serviceType,
        apiProviderId: service.apiProviderId,
        apiServiceId: service.apiServiceId,
        link,
        quantity: orderQuantity,
        charge: service.price,
        status: 'awaiting',
      },
    })

    // Si el servicio es automático (API), intentar enviar inmediatamente
    if (service.addType === 'api' && service.provider) {
      try {
        const apiClient = new SMMApiClient({
          url: service.provider.url,
          apiKey: service.provider.apiKey,
        })

        const response = await apiClient.createOrder({
          service: service.apiServiceId!,
          link,
          quantity: orderQuantity,
        })

        if (response.order) {
          // Actualizar orden con el ID del proveedor
          await prisma.order.update({
            where: { id: order.id },
            data: {
              apiOrderId: response.order,
              status: 'pending',
              statusApi: 'Pending',
            },
          })
        } else if (response.error) {
          // Marcar error
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'error',
              note: response.error,
            },
          })
        }
      } catch (error) {
        console.error('Error sending order to provider:', error)
        // La orden queda en "awaiting" para ser procesada por el cron
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      message: 'Orden creada exitosamente',
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden' },
      { status: 500 }
    )
  }
}
