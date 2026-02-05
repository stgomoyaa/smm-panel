import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'
import { generateServiceId } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
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

    const smmServices = await apiClient.getServices()

    // Obtener categorías existentes
    const categories = await prisma.category.findMany()
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))

    let syncedCount = 0
    let errors: string[] = []

    for (const smmService of smmServices) {
      try {
        // Buscar o crear categoría
        let categoryId = categoryMap.get(smmService.category?.toLowerCase() || 'otros')
        
        if (!categoryId) {
          const newCategory = await prisma.category.create({
            data: {
              name: smmService.category || 'Otros',
              slug: (smmService.category || 'otros').toLowerCase().replace(/\s+/g, '-'),
              status: true,
            },
          })
          categoryId = newCategory.id
          categoryMap.set(newCategory.name.toLowerCase(), newCategory.id)
        }

        // Verificar si el servicio ya existe
        const existingService = await prisma.service.findFirst({
          where: {
            apiProviderId: providerId,
            apiServiceId: smmService.service,
          },
        })

        // Convertir rate de USD a CLP (aproximado 950)
        const rateUSD = parseFloat(smmService.rate)
        const usdToClp = 950
        const rateCLP = rateUSD * usdToClp
        
        // Calcular precio de venta con 50% de margen
        const salePrice = Math.round(rateCLP * 1.5)
        
        // Usar el valor mínimo como cantidad por defecto
        const quantity = parseInt(smmService.min) || 100
        
        const serviceData = {
          name: smmService.name,
          categoryId,
          subcategoryId: null, // El sync automático no asigna subcategoría
          quantity,
          salePrice,
          apiProviderId: providerId,
          apiServiceId: smmService.service,
          apiProviderPrice: rateUSD,
          status: true,
        }

        if (existingService) {
          await prisma.service.update({
            where: { id: existingService.id },
            data: serviceData,
          })
        } else {
          await prisma.service.create({
            data: {
              ...serviceData,
              serviceId: generateServiceId(),
            },
          })
        }

        syncedCount++
      } catch (error) {
        errors.push(`Error syncing service ${smmService.service}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      totalServices: smmServices.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error syncing services:', error)
    return NextResponse.json(
      { error: 'Failed to sync services' },
      { status: 500 }
    )
  }
}
