import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Listar vendedores
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sellers = await prisma.user.findMany({
      where: { role: 'seller' },
      select: {
        id: true,
        name: true,
        email: true,
        commissionRate: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(sellers)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    )
  }
}

// Crear vendedor
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, commissionRate } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const seller = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'seller',
        commissionRate: commissionRate || 20,
        status: true,
      },
    })

    return NextResponse.json({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      commissionRate: seller.commissionRate,
      status: seller.status,
    })
  } catch (error) {
    console.error('Error creating seller:', error)
    return NextResponse.json(
      { error: 'Failed to create seller' },
      { status: 500 }
    )
  }
}

