import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get('subcategoryId')

    if (!subcategoryId) {
      return NextResponse.json(
        { error: 'Subcategory ID required' },
        { status: 400 }
      )
    }

    // Solo devolver cantidad y precio de venta (NO el costo del proveedor)
    const services = await prisma.service.findMany({
      where: {
        subcategoryId: parseInt(subcategoryId),
        status: true,
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
        quantity: true,
        salePrice: true, // Solo precio de venta
        // NO incluir apiProviderPrice, apiServiceId, etc.
      },
      orderBy: { quantity: 'asc' },
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
