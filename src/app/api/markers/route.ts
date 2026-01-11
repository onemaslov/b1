import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateMarkerInput } from '@/types/marker'

// Указываем что этот роут динамический
export const dynamic = 'force-dynamic'

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

    const markers = await prisma.marker.findMany({
      where: {
        userId: userId,
      },
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
export async function POST(request: NextRequest) {
  try {
    console.log('📍 [POST /api/markers] Запрос получен')
    
    const userId = request.cookies.get('userId')?.value
    console.log('🔐 userId из cookie:', userId)

    if (!userId) {
      console.log('❌ userId отсутствует в cookie')
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const body: CreateMarkerInput = await request.json()
    console.log('📦 Получены данные:', { title: body.title, latitude: body.latitude, longitude: body.longitude })
    
    if (!body.title || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      console.log('❌ Ошибка валидации:', { title: body.title, lat: body.latitude, lon: body.longitude })
      return NextResponse.json(
        { error: 'Необходимо указать название и координаты' },
        { status: 400 }
      )
    }

    console.log('💾 Сохраняю метку в БД с userId:', userId)
    
    const marker = await prisma.marker.create({
      data: {
        title: body.title,
        description: body.description || null,
        latitude: body.latitude,
        longitude: body.longitude,
        userId: userId,
      },
    })

    console.log('✅ Метка успешно сохранена:', marker.id)
    return NextResponse.json(marker, { status: 201 })
  } catch (error) {
    console.error('❌ Ошибка при создании метки:', error)
    // Логируем детали ошибки для отладки
    if (error instanceof Error) {
      console.error('❌ Ошибка детали:', error.message)
      console.error('❌ Стек:', error.stack)
    }
    return NextResponse.json(
      { error: 'Не удалось создать метку', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

