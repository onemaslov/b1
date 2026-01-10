'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Loader2 } from 'lucide-react'

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  type?: string
  importance?: number
}

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, addMarker?: boolean) => void
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Проверка на координаты (широта, долгота)
  const parseCoordinates = (text: string): { lat: number; lng: number } | null => {
    // Удаляем лишние пробелы
    const cleaned = text.trim()
    
    // Паттерны для различных форматов координат
    const patterns = [
      // Формат: 55.7558, 37.6173 или 55.7558,37.6173
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
      // Формат: 55.7558 37.6173
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,
    ]

    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        const lat = parseFloat(match[1])
        const lng = parseFloat(match[2])
        
        // Проверка диапазонов
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng }
        }
      }
    }

    return null
  }

  // Поиск адреса через API
  const searchAddress = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('Ошибка поиска')
      }

      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (err) {
      console.error('Ошибка поиска:', err)
      setError('Не удалось выполнить поиск')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка изменения поискового запроса
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setError(null)

    // Очищаем предыдущий таймер
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!value.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    // Проверяем, не координаты ли это
    const coords = parseCoordinates(value)
    if (coords) {
      setResults([])
      setShowResults(false)
      return
    }

    // Debounce для поиска адресов
    debounceTimer.current = setTimeout(() => {
      searchAddress(value)
    }, 500)
  }

  // Обработка отправки формы (Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    // Проверяем координаты
    const coords = parseCoordinates(query)
    if (coords) {
      onLocationSelect(coords.lat, coords.lng, true)
      setQuery('')
      setShowResults(false)
      return
    }

    // Если есть результаты поиска, выбираем первый
    if (results.length > 0) {
      handleResultSelect(results[0])
    }
  }

  // Выбор результата из списка
  const handleResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    onLocationSelect(lat, lng, true)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  // Очистка поля
  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setError(null)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        {/* Поле ввода */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true)
              }
            }}
            placeholder="Введите адрес или координаты (широта, долгота)"
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Подсказка */}
        {query && !isLoading && results.length === 0 && !showResults && parseCoordinates(query) && (
          <div className="absolute top-full mt-2 left-0 right-0 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
            <MapPin size={16} className="inline mr-1" />
            Нажмите Enter для установки метки по координатам
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <div className="absolute top-full mt-2 left-0 right-0 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </form>

      {/* Результаты поиска */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
            >
              <MapPin size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {result.display_name}
                </div>
                {result.type && (
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {result.type}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Сообщение о пустых результатах */}
      {showResults && !isLoading && results.length === 0 && query.length >= 3 && !parseCoordinates(query) && (
        <div className="absolute top-full mt-2 left-0 right-0 px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-500">Ничего не найдено</p>
        </div>
      )}
    </div>
  )
}

