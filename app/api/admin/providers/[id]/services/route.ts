import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providerId = parseInt(params.id)
    const provider = await prisma.apiProvider.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Obtener servicios del proveedor
    const apiClient = new SMMApiClient({
      url: provider.url,
      apiKey: provider.apiKey,
    })

    const services = await apiClient.getServices()

    // Ordenar por ID (service number) de menor a mayor
    const sortedServices = services.sort((a, b) => {
      return parseInt(a.service) - parseInt(b.service)
    })

    return NextResponse.json(sortedServices)
  } catch (error) {
    console.error('Error fetching provider services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services from provider' },
      { status: 500 }
    )
  }
}
