import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value
  const { pathname } = request.nextUrl

  // Если пользователь не авторизован и пытается попасть на главную
  if (!userId && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Если пользователь авторизован и пытается попасть на страницу входа
  if (userId && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login'],
}

