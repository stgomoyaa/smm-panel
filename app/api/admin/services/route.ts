import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateServiceId } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')

    const where: any = { status: true }
    if (categoryId) where.categoryId = parseInt(categoryId)
    if (subcategoryId) where.subcategoryId = parseInt(subcategoryId)

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        provider: true,
      },
      orderBy: [
        { categoryId: 'asc' },
        { subcategoryId: 'asc' },
        { quantity: 'asc' },
      ],
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      categoryId,
      subcategoryId,
      quantity,
      salePrice,
      apiProviderId,
      apiServiceId,
      apiProviderPrice,
      sort,
      status,
    } = body

    if (!name || !categoryId || !subcategoryId || !quantity || !salePrice || !apiProviderId || !apiServiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        serviceId: generateServiceId(),
        name,
        categoryId: parseInt(categoryId),
        subcategoryId: parseInt(subcategoryId),
        quantity: parseInt(quantity),
        salePrice: parseFloat(salePrice),
        apiProviderId: parseInt(apiProviderId),
        apiServiceId,
        apiProviderPrice: parseFloat(apiProviderPrice || '0'),
        sort: sort || 0,
        status: status !== undefined ? status : true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
