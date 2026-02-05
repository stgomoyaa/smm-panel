import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Actualizando servicio:', params.id, 'con datos:', body)
    
    const {
      name,
      quantity,
      salePrice,
      status,
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = String(name).trim()
    if (quantity !== undefined) updateData.quantity = parseInt(quantity)
    if (salePrice !== undefined) updateData.salePrice = parseFloat(salePrice)
    if (status !== undefined) updateData.status = Boolean(status)

    console.log('💾 Datos a actualizar:', updateData)

    const service = await prisma.service.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    })

    console.log('✅ Servicio actualizado exitosamente')
    return NextResponse.json(service)

  } catch (error: any) {
    console.error('❌ Error updating service:', error)
    console.error('❌ Error message:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.service.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
