import { NextRequest, NextResponse } from 'next/server'

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

    // Тестовая авторизация - просто проверяем логин и пароль
    if (username === 'admin' && password === 'qwerty') {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'admin123',
          username: 'admin',
        },
      })

      // Устанавливаем cookie с userId
      response.cookies.set('userId', 'admin123', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      })

      return response
    }

    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Ошибка авторизации:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}



