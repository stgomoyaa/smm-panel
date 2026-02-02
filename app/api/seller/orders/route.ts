import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'
import { generateOrderId } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, link, customerName, customerContact } = body

    if (!serviceId || !link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Obtener servicio completo
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
      include: {
        category: true,
        subcategory: true,
        provider: true,
      },
    })

    if (!service || !service.status) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    // Obtener vendedor
    const seller = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Calcular comisiones y ganancias
    const salePrice = service.salePrice
    const providerCostUSD = service.apiProviderPrice
    const commissionRate = seller.commissionRate / 100 // 20% = 0.20
    const commission = salePrice * commissionRate
    
    // Aquí necesitarías convertir USD a CLP, por ahora uso un rate fijo
    // En producción, usa una API de tipos de cambio
    const usdToClp = 950 // Ejemplo: 1 USD = 950 CLP
    const providerCostCLP = providerCostUSD * usdToClp
    
    const profit = salePrice - providerCostCLP - commission

    // Crear orden
    const order = await prisma.order.create({
      data: {
        orderId: generateOrderId(),
        sellerId: seller.id,
        customerName: customerName || null,
        customerContact: customerContact || null,
        serviceId: service.id,
        categoryName: service.category.name,
        subcategoryName: service.subcategory.name,
        serviceName: service.name,
        quantity: service.quantity,
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
    try {
      const apiClient = new SMMApiClient({
        url: service.provider.url,
        apiKey: service.provider.apiKey,
      })

      const response = await apiClient.createOrder({
        service: service.apiServiceId,
        link,
        quantity: service.quantity,
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
      } else if (response.error) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'error',
            note: response.error,
          },
        })
      }
    } catch (error) {
      console.error('Error sending to provider:', error)
      // La orden queda en awaiting para el cron
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      message: 'Venta registrada exitosamente',
    })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

// Obtener órdenes del vendedor
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const seller = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { sellerId: seller.id } }),
    ])

    // Calcular totales del vendedor
    const allOrders = await prisma.order.findMany({
      where: { sellerId: seller.id },
    })

    const totalSales = allOrders.reduce((sum, order) => sum + order.salePrice, 0)
    const totalCommissions = allOrders.reduce((sum, order) => sum + order.commission, 0)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalOrders: allOrders.length,
        totalSales,
        totalCommissions,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

