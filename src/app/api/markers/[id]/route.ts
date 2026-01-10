import { NextRequest, NextResponse } from 'next/server'
import { getMarkerById, updateMarker, deleteMarker } from '@/lib/db'
import type { UpdateMarkerInput } from '@/types/marker'

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

    const marker = getMarkerById(params.id, userId)

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

    const marker = updateMarker(params.id, userId, body)

    if (!marker) {
      return NextResponse.json(
        { error: 'Метка не найдена' },
        { status: 404 }
      )
    }

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

    const success = deleteMarker(params.id, userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Метка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при удалении метки:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить метку' },
      { status: 500 }
    )
  }
}

