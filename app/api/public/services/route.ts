import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const services = await prisma.service.findMany({
      where: {
        categoryId: parseInt(categoryId),
        status: true,
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        discountValue: true,
        quantity: true,
        min: true,
        max: true,
        averageTime: true,
        refillEnabled: true,
        serviceType: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
