'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Menu, Plus, Loader2, MapPin } from 'lucide-react'
import type { Marker } from '@/types/marker'
import Sidebar from '@/components/Sidebar'
import MarkerModal from '@/components/MarkerModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import Toast from '@/components/Toast'
import LocationInfo from '@/components/LocationInfo'
import SearchBar from '@/components/SearchBar'
import { useGeolocation } from '@/hooks/useGeolocation'
import { reverseGeocode, type GeocodingResult } from '@/lib/geocoding'

// Динамический импорт карты (только на клиенте)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Загрузка карты...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [markerToDelete, setMarkerToDelete] = useState<Marker | null>(null)
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [showGeoError, setShowGeoError] = useState(false)
  
  // Информация о выбранной точке
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [centerTo, setCenterTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
  
  // Геолокация
  const { location: userLocation, error: geoError, isLoading: isGeoLoading, hasPermission, requestLocation } = useGeolocation(true)

  // Показываем ошибку геолокации
  useEffect(() => {
    if (geoError) {
      setShowGeoError(true)
    }
  }, [geoError])

  // Загрузка меток при монтировании
  useEffect(() => {
    loadMarkers()
  }, [])

  const loadMarkers = async () => {
    try {
      const response = await fetch('/api/markers')
      if (response.ok) {
        const data = await response.json()
        setMarkers(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки меток:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    // Устанавливаем выбранную точку
    setSelectedLocation({ lat, lng })
    setIsGeocoding(true)
    
    // Получаем информацию об адресе
    const result = await reverseGeocode(lat, lng)
    setGeocodingResult(result)
    setIsGeocoding(false)
  }, [])

  const handleMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarkerId(marker.id)
  }, [])

  const handleMarkerSubmit = async (data: {
    title: string
    description: string
    latitude: number
    longitude: number
  }) => {
    try {
      if (selectedMarker) {
        // Обновление существующей метки
        const response = await fetch(`/api/markers/${selectedMarker.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          await loadMarkers()
        }
      } else {
        // Создание новой метки
        const response = await fetch('/api/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          await loadMarkers()
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения метки:', error)
    }
  }

  const handleMarkerEdit = (marker: Marker) => {
    setSelectedMarker(marker)
    setClickedCoords(null)
    setIsMarkerModalOpen(true)
  }

  const handleMarkerDeleteRequest = (markerId: string) => {
    const marker = markers.find((m) => m.id === markerId)
    if (marker) {
      setMarkerToDelete(marker)
      setIsDeleteModalOpen(true)
    }
  }

  const handleMarkerDeleteConfirm = async () => {
    if (!markerToDelete) return

    try {
      const response = await fetch(`/api/markers/${markerToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadMarkers()
        setIsDeleteModalOpen(false)
        setMarkerToDelete(null)
      }
    } catch (error) {
      console.error('Ошибка удаления метки:', error)
    }
  }

  const handleMarkerSelect = (markerId: string) => {
    setSelectedMarkerId(markerId)
  }

  const handleLocationRequest = () => {
    requestLocation()
  }

  // Обработка выбора места из поиска
  const handleSearchLocationSelect = useCallback(async (lat: number, lng: number, addMarker: boolean = false) => {
    // Устанавливаем выбранную точку
    setSelectedLocation({ lat, lng })
    setSelectedMarkerId(undefined)

    // Центрируем карту на выбранной точке
    setCenterTo({ lat, lng, zoom: 15 })

    // Получаем информацию об адресе
    setIsGeocoding(true)
    const result = await reverseGeocode(lat, lng)
    setGeocodingResult(result)
    setIsGeocoding(false)

    // Если нужно добавить маркер, открываем модальное окно
    if (addMarker) {
      setClickedCoords({ lat, lng })
      setSelectedMarker(null)
      setIsMarkerModalOpen(true)
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Заголовок */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white shadow-md">
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Верхняя панель с заголовком и кнопками */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Карта с метками</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMarker(null)
                  // Если есть выбранная точка на карте, используем её координаты
                  if (selectedLocation) {
                    setClickedCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng })
                  } else {
                    setClickedCoords(null)
                  }
                  setIsMarkerModalOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Добавить метку</span>
              </button>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Menu size={20} />
                <span className="hidden sm:inline">Список меток</span>
              </button>
              <button
                onClick={handleLocationRequest}
                disabled={isGeoLoading}
                className="flex items-center gap-2 px-4 py-2 border border-primary-600 rounded-lg font-medium text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-60"
              >
                {isGeoLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <MapPin size={20} />
                )}
                <span className="hidden sm:inline">Моё место</span>
              </button>
            </div>
          </div>
          
          {/* Строка поиска */}
          <div className="flex justify-center w-full">
            <SearchBar onLocationSelect={handleSearchLocationSelect} />
          </div>
        </div>
      </header>

      {/* Карта */}
      <main className="h-full pt-32 relative z-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        ) : (
          <>
            <Map
              markers={markers}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              selectedMarkerId={selectedMarkerId}
              userLocation={userLocation}
              selectedLocation={selectedLocation}
              centerTo={centerTo}
            />
          </>
        )}
      </main>

      {/* Сайдбар */}
      <Sidebar
        markers={markers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMarkerSelect={handleMarkerSelect}
        onMarkerEdit={handleMarkerEdit}
        onMarkerDelete={handleMarkerDeleteRequest}
        selectedMarkerId={selectedMarkerId}
      />

      {/* Модальное окно метки */}
      <MarkerModal
        isOpen={isMarkerModalOpen}
        onClose={() => {
          setIsMarkerModalOpen(false)
          setSelectedMarker(null)
          setClickedCoords(null)
        }}
        onSubmit={handleMarkerSubmit}
        marker={selectedMarker}
        initialLat={clickedCoords?.lat}
        initialLng={clickedCoords?.lng}
      />

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setMarkerToDelete(null)
        }}
        onConfirm={handleMarkerDeleteConfirm}
        markerTitle={markerToDelete?.title || ''}
      />

      {/* Toast уведомление об ошибке геолокации */}
      {showGeoError && geoError && (
        <Toast
          message={geoError}
          type="error"
          onClose={() => setShowGeoError(false)}
        />
      )}

      {/* Информация о выбранной точке */}
      {selectedLocation && (
        <LocationInfo
          result={geocodingResult}
          coordinates={selectedLocation}
          isLoading={isGeocoding}
          onClose={() => {
            setSelectedLocation(null)
            setGeocodingResult(null)
          }}
        />
      )}
    </div>
  )
}

