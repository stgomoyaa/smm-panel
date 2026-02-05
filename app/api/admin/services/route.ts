import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
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
    console.log('📝 Body recibido:', body)
    
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

    console.log('🔍 Validando campos:', {
      name: !!name,
      categoryId: !!categoryId,
      quantity: !!quantity,
      salePrice: !!salePrice,
      apiProviderId: !!apiProviderId,
      apiServiceId: !!apiServiceId,
      apiProviderPrice,
    })

    if (!name || !categoryId || !quantity || !salePrice || !apiProviderId || !apiServiceId) {
      console.error('❌ Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const serviceData = {
      serviceId: generateServiceId(),
      name: String(name).trim(),
      categoryId: parseInt(categoryId),
      subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
      quantity: parseInt(quantity),
      salePrice: parseFloat(salePrice),
      apiProviderId: parseInt(apiProviderId),
      apiServiceId: String(apiServiceId),
      apiProviderPrice: apiProviderPrice ? parseFloat(apiProviderPrice) : 0,
      sort: sort ? parseInt(sort) : 0,
      status: status !== undefined ? Boolean(status) : true,
    }

    console.log('💾 Creando servicio con datos:', serviceData)

    const service = await prisma.service.create({
      data: serviceData,
    })

    console.log('✅ Servicio creado exitosamente:', service.id)
    return NextResponse.json(service)
  } catch (error: any) {
    console.error('❌ Error creating service:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    )
  }
}

