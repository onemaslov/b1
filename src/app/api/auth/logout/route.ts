import { NextResponse } from 'next/server'

// Указываем что этот роут динамический
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Удаляем cookie
  response.cookies.delete('userId')
  
  return response
}

