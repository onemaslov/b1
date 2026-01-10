import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Для тестового аккаунта
    if (userId === 'admin123') {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: userId,
          username: 'admin',
        },
      })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    console.error('Ошибка проверки сессии:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

