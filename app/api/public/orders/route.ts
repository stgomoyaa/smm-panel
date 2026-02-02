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

    // Obtener servicio completo con relaciones
    const service = await prisma.service.findUnique({
      where: { serviceId },
      include: {
        category: true,
        subcategory: true,
        provider: true,
      },
    })

    if (!service || !service.status) {
      return NextResponse.json(
        { error: 'Servicio no encontrado o inactivo' },
        { status: 404 }
      )
    }

    // Obtener usuario admin o sistema para órdenes públicas
    const systemUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!systemUser) {
      return NextResponse.json(
        { error: 'Sistema no configurado correctamente' },
        { status: 500 }
      )
    }

    // Usar la cantidad del servicio (es fija)
    const orderQuantity = service.quantity

    // Calcular comisiones y ganancias
    const salePrice = service.salePrice
    const providerCostUSD = service.apiProviderPrice
    const commissionRate = 0 // Sin comisión para órdenes públicas
    const commission = 0
    
    // Convertir USD a CLP (usar tipo de cambio fijo o API)
    const usdToClp = 950
    const providerCostCLP = providerCostUSD * usdToClp
    
    const profit = salePrice - providerCostCLP - commission

    // Crear orden local
    const order = await prisma.order.create({
      data: {
        orderId: generateOrderId(),
        sellerId: systemUser.id,
        customerName: email,
        customerContact: email,
        serviceId: service.id,
        categoryName: service.category.name,
        subcategoryName: service.subcategory?.name || 'General',
        serviceName: service.name,
        quantity: orderQuantity,
        link,
        salePrice,
        providerCost: providerCostUSD,
        commission,
        profit,
        apiProviderId: service.apiProviderId,
        apiServiceId: service.apiServiceId,
        status: 'awaiting',
      },
    })

    // Intentar enviar al proveedor inmediatamente
    if (service.provider) {
      try {
        const apiClient = new SMMApiClient({
          url: service.provider.url,
          apiKey: service.provider.apiKey,
        })

        const response = await apiClient.createOrder({
          service: service.apiServiceId,
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

