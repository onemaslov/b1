import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateMarkerInput } from '@/types/marker'

// Указываем что этот роут динамический
export const dynamic = 'force-dynamic'

// GET - Получить одну метку
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const marker = await prisma.marker.findFirst({
      where: { 
        id: params.id,
        userId: userId,
      },
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const body: UpdateMarkerInput = await request.json()

    // Проверяем, что метка принадлежит пользователю
    const existingMarker = await prisma.marker.findFirst({
      where: { 
        id: params.id,
        userId: userId,
      },
    })

    if (!existingMarker) {
      return NextResponse.json(
        { error: 'Метка не найдена' },
        { status: 404 }
      )
    }

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Проверяем, что метка принадлежит пользователю
    const existingMarker = await prisma.marker.findFirst({
      where: { 
        id: params.id,
        userId: userId,
      },
    })

    if (!existingMarker) {
      return NextResponse.json(
        { error: 'Метка не найдена' },
        { status: 404 }
      )
    }

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

