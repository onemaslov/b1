'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Marker } from '@/types/marker'

// Исправление иконок маркеров в Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapProps {
  markers: Marker[]
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (marker: Marker) => void
  selectedMarkerId?: string
  userLocation?: { lat: number; lng: number } | null
}

export default function Map({ markers, onMapClick, onMarkerClick, selectedMarkerId, userLocation }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)

  // Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Создаем карту с центром на Москве (по умолчанию)
    const map = L.map(mapContainerRef.current).setView([55.7558, 37.6173], 10)

    // Добавляем тайлы OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Создаем слой для маркеров
    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer

    // Обработчик клика по карте
    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [onMapClick])

  // Отображение местоположения пользователя
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    // Удаляем старый маркер, если есть
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    // Создаем синий круг для обозначения позиции пользователя
    const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
      color: '#0ea5e9',
      fillColor: '#0ea5e9',
      fillOpacity: 0.3,
      radius: 10,
      weight: 2,
    })
      .bindPopup('Ваше местоположение')
      .addTo(mapRef.current)

    userMarkerRef.current = userMarker
  }, [userLocation])

  // Обновление маркеров на карте
  useEffect(() => {
    if (!markersLayerRef.current) return

    // Очищаем все маркеры
    markersLayerRef.current.clearLayers()

    // Добавляем новые маркеры
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.latitude, marker.longitude])
        .bindPopup(`<b>${marker.title}</b>${marker.description ? `<br>${marker.description}` : ''}`)
        .on('click', () => onMarkerClick(marker))

      leafletMarker.addTo(markersLayerRef.current!)
    })
  }, [markers, onMarkerClick])

  // Центрирование на выбранном маркере
  useEffect(() => {
    if (!mapRef.current || !selectedMarkerId) return

    const selectedMarker = markers.find((m) => m.id === selectedMarkerId)
    if (selectedMarker) {
      mapRef.current.setView([selectedMarker.latitude, selectedMarker.longitude], 15, {
        animate: true,
      })
    }
  }, [selectedMarkerId, markers])

  // Центрирование на местоположении пользователя
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    mapRef.current.setView([userLocation.lat, userLocation.lng], 13, {
      animate: true,
    })
  }, [userLocation])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}

