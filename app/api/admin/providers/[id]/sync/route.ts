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

    console.log(`Total services to sync: ${smmServices.length}`)

    for (const smmService of smmServices) {
      try {
        console.log(`Syncing service: ${smmService.service} - ${smmService.name}`)
        
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
          console.log(`Created new category: ${newCategory.name}`)
        }

        // Verificar si el servicio ya existe
        const existingService = await prisma.service.findFirst({
          where: {
            apiProviderId: providerId,
            apiServiceId: String(smmService.service),
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
          subcategoryId: null,
          quantity,
          salePrice,
          apiProviderId: providerId,
          apiServiceId: String(smmService.service),
          apiProviderPrice: rateUSD,
          status: true,
        }

        if (existingService) {
          console.log(`Updating existing service: ${existingService.id}`)
          await prisma.service.update({
            where: { id: existingService.id },
            data: serviceData,
          })
        } else {
          console.log(`Creating new service`)
          await prisma.service.create({
            data: {
              ...serviceData,
              serviceId: generateServiceId(),
            },
          })
        }

        syncedCount++
        console.log(`Successfully synced service ${smmService.service}`)
      } catch (error: any) {
        const errorMsg = `Service ${smmService.service} (${smmService.name}): ${error.message || error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    console.log(`Sync complete: ${syncedCount}/${smmServices.length} services synced`)

    const response = {
      success: syncedCount > 0,
      syncedCount,
      totalServices: smmServices.length,
      errors: errors.length > 0 ? errors : undefined,
      message: syncedCount > 0 
        ? `${syncedCount} de ${smmServices.length} servicios sincronizados`
        : 'No se pudo sincronizar ningún servicio. Revisa los errores.',
    }
    
    console.log('Sync response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error syncing services:', error)
    return NextResponse.json(
      { error: 'Failed to sync services' },
      { status: 500 }
    )
  }
}
