import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateMarkerInput } from '@/types/marker'

// GET - Получить все метки
export async function GET() {
  try {
    const markers = await prisma.marker.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
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
export async function POST(request: Request) {
  try {
    const body: CreateMarkerInput = await request.json()
    
    if (!body.title || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Необходимо указать название и координаты' },
        { status: 400 }
      )
    }

    const marker = await prisma.marker.create({
      data: {
        title: body.title,
        description: body.description || null,
        latitude: body.latitude,
        longitude: body.longitude,
      },
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

