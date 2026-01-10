export interface GeocodingResult {
  display_name: string
  address: {
    road?: string
    house_number?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
    building?: string
    amenity?: string
    shop?: string
    tourism?: string
    leisure?: string
    historic?: string
  }
  category?: string
  type?: string
  lat: string
  lon: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&extratags=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'MapMarkersApp/1.0',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Ошибка геокодирования:', error)
    return null
  }
}

export function formatAddress(result: GeocodingResult): string {
  const addr = result.address
  const parts: string[] = []

  // Название здания или объекта
  if (addr.building) parts.push(addr.building)
  if (addr.amenity) parts.push(addr.amenity)
  if (addr.shop) parts.push(`Магазин: ${addr.shop}`)
  if (addr.tourism) parts.push(addr.tourism)
  if (addr.leisure) parts.push(addr.leisure)
  if (addr.historic) parts.push(addr.historic)

  // Улица и номер дома
  if (addr.road) {
    const street = addr.house_number ? `${addr.road}, ${addr.house_number}` : addr.road
    parts.push(street)
  }

  // Район
  if (addr.suburb) parts.push(addr.suburb)

  // Город
  if (addr.city) parts.push(addr.city)

  // Регион/Область
  if (addr.state) parts.push(addr.state)

  // Страна
  if (addr.country) parts.push(addr.country)

  return parts.length > 0 ? parts.join(', ') : result.display_name
}

export function getObjectType(result: GeocodingResult): string {
  const types: { [key: string]: string } = {
    // Здания
    building: '🏢 Здание',
    house: '🏠 Дом',
    residential: '🏘️ Жилое здание',
    commercial: '🏪 Коммерческое здание',
    
    // Общественные места
    amenity: '📍 Объект',
    restaurant: '🍽️ Ресторан',
    cafe: '☕ Кафе',
    bar: '🍺 Бар',
    pub: '🍺 Паб',
    fast_food: '🍔 Фастфуд',
    bank: '🏦 Банк',
    atm: '💳 Банкомат',
    hospital: '🏥 Больница',
    pharmacy: '💊 Аптека',
    school: '🏫 Школа',
    university: '🎓 Университет',
    library: '📚 Библиотека',
    police: '👮 Полиция',
    fire_station: '🚒 Пожарная станция',
    post_office: '📮 Почта',
    fuel: '⛽ АЗС',
    parking: '🅿️ Парковка',
    
    // Магазины
    shop: '🛒 Магазин',
    supermarket: '🏪 Супермаркет',
    mall: '🏬 ТЦ',
    
    // Туризм
    tourism: '🗺️ Достопримечательность',
    hotel: '🏨 Отель',
    museum: '🏛️ Музей',
    monument: '⛰️ Памятник',
    
    // Досуг
    leisure: '🎯 Досуг',
    park: '🌳 Парк',
    playground: '🎠 Детская площадка',
    sports_centre: '🏋️ Спортцентр',
    stadium: '🏟️ Стадион',
    cinema: '🎬 Кинотеатр',
    theatre: '🎭 Театр',
    
    // Исторические
    historic: '🏛️ Исторический объект',
    
    // Дороги
    highway: '🛣️ Дорога',
    motorway: '🛣️ Автомагистраль',
    primary: '🛣️ Главная дорога',
    secondary: '🛣️ Второстепенная дорога',
    residential_road: '🛣️ Жилая улица',
    
    // Природные объекты
    natural: '🌿 Природный объект',
    water: '💧 Водоём',
    forest: '🌲 Лес',
    beach: '🏖️ Пляж',
  }

  if (result.type && types[result.type]) {
    return types[result.type]
  }

  if (result.category) {
    return types[result.category] || '📍 Объект'
  }

  return '📍 Место'
}

