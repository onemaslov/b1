import { NextRequest, NextResponse } from 'next/server'
import { getMarkersByUserId, createMarker } from '@/lib/db'
import type { CreateMarkerInput } from '@/types/marker'

// GET - Получить все метки текущего пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const markers = getMarkersByUserId(userId)
    return NextResponse.json(markers)
  } catch (error) {
    console.error('Ошибка при получении меток:', error)
    return NextResponse.json(
      { error: 'Не удалось получить метки' },
      { status: 500 }
    )
  }
}

// POST - Создать новую метку
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const body: CreateMarkerInput = await request.json()
    
    if (!body.title || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Необходимо указать название и координаты' },
        { status: 400 }
      )
    }

    const marker = createMarker({
      title: body.title,
      description: body.description,
      latitude: body.latitude,
      longitude: body.longitude,
      userId,
    })

    return NextResponse.json(marker, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании метки:', error)
    return NextResponse.json(
      { error: 'Не удалось создать метку' },
      { status: 500 }
    )
  }
}

