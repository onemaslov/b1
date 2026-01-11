import { NextRequest, NextResponse } from 'next/server'

// Указываем что этот роут динамический
export const dynamic = 'force-dynamic'

interface GeocodingResult {
  display_name: string
  lat: string
  lon: string
  type?: string
  importance?: number
  class?: string
  address?: {
    road?: string
    city?: string
    country?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Параметр поиска "q" обязателен' },
        { status: 400 }
      )
    }

    // Trim query to prevent issues
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 3) {
      return NextResponse.json(
        { error: 'Запрос должен содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    // Вызов Nominatim API для поиска адресов
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + 
      `q=${encodeURIComponent(trimmedQuery)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=10` +
      `&accept-language=ru`

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MapMarkersApp/1.0',
      },
    })

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Ошибка при обращении к сервису геокодирования' },
        { status: 500 }
      )
    }

    const data: GeocodingResult[] = await response.json()

    // Сортируем результаты по важности
    const sortedResults = data.sort((a, b) => {
      return (b.importance || 0) - (a.importance || 0)
    })

    return NextResponse.json({
      results: sortedResults,
      count: sortedResults.length,
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

