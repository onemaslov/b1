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
  selectedLocation?: { lat: number; lng: number } | null
}

export default function Map({ markers, onMapClick, onMarkerClick, selectedMarkerId, userLocation, selectedLocation }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)

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

  // Отображение выбранной точки (временный маркер)
  useEffect(() => {
    if (!mapRef.current) return

    // Удаляем старый маркер, если есть
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove()
      selectedMarkerRef.current = null
    }

    // Если есть выбранная точка, создаем красный маркер
    if (selectedLocation) {
      // Создаем кастомную иконку для выбранной точки
      const selectedIcon = L.divIcon({
        className: 'custom-selected-marker',
        html: `<div style="
          width: 30px;
          height: 30px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: selectedIcon,
      })
        .bindPopup('Выбранная точка')
        .addTo(mapRef.current)

      selectedMarkerRef.current = marker
    }
  }, [selectedLocation])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}

