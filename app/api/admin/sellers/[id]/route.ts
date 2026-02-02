import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, commissionRate, status } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await bcrypt.hash(password, 10)
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate)
    if (status !== undefined) updateData.status = status

    const seller = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    })

    return NextResponse.json({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      commissionRate: seller.commissionRate,
      status: seller.status,
    })
  } catch (error) {
    console.error('Error updating seller:', error)
    return NextResponse.json(
      { error: 'Failed to update seller' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting seller:', error)
    return NextResponse.json(
      { error: 'Failed to delete seller' },
      { status: 500 }
    )
  }
}
