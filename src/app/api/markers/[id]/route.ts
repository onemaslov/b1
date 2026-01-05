import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateMarkerInput } from '@/types/marker'

// GET - Получить одну метку
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const marker = await prisma.marker.findUnique({
      where: { id: params.id },
    })

    if (!marker) {
      return NextResponse.json(
        { error: 'Метка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(marker)
  } catch (error) {
    console.error('Ошибка при получении метки:', error)
    return NextResponse.json(
      { error: 'Не удалось получить метку' },
      { status: 500 }
    )
  }
}

// PATCH - Обновить метку
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateMarkerInput = await request.json()

    const marker = await prisma.marker.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
      },
    })

    return NextResponse.json(marker)
  } catch (error) {
    console.error('Ошибка при обновлении метки:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить метку' },
      { status: 500 }
    )
  }
}

// DELETE - Удалить метку
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.marker.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при удалении метки:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить метку' },
      { status: 500 }
    )
  }
}

