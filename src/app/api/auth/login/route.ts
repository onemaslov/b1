import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Указываем что этот роут динамический
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      )
    }

    // Ищем пользователя в БД
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // Проверяем что пользователь существует и пароль верный
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    })

    // Устанавливаем cookie с userId
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })

    return response
  } catch (error) {
    console.error('Ошибка авторизации:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}



