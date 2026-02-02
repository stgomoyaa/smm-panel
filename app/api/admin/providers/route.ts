import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { SMMApiClient } from '@/lib/smm-api'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providers = await prisma.apiProvider.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, apiKey, type = 'default' } = body

    if (!name || !url || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar conexión con el proveedor
    try {
      const apiClient = new SMMApiClient({ url, apiKey })
      const balanceData = await apiClient.getBalance()

      const provider = await prisma.apiProvider.create({
        data: {
          name,
          url,
          apiKey,
          type,
          balance: parseFloat(balanceData.balance),
          currency: balanceData.currency || 'USD',
          status: true,
        },
      })

      return NextResponse.json(provider)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to connect to provider. Check URL and API Key.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json(
      { error: 'Failed to create provider' },
      { status: 500 }
    )
  }
}
