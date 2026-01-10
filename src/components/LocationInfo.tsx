'use client'

import { X, MapPin, Navigation } from 'lucide-react'
import type { GeocodingResult } from '@/lib/geocoding'
import { getObjectType } from '@/lib/geocoding'

interface LocationInfoProps {
  result: GeocodingResult | null
  coordinates: { lat: number; lng: number }
  isLoading: boolean
  onClose: () => void
}

export default function LocationInfo({ result, coordinates, isLoading, onClose }: LocationInfoProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 bg-white rounded-lg shadow-2xl z-40 border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Navigation size={20} className="text-primary-600" />
          Информация о точке
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <span className="ml-3 text-gray-600">Определение адреса...</span>
          </div>
        ) : (
          <>
            {/* Координаты */}
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">Координаты:</div>
                <div className="text-sm text-gray-900 font-mono">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Информация об объекте */}
            {result ? (
              <>
                {/* Тип объекта */}
                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-primary-900">
                    {getObjectType(result)}
                  </div>
                </div>

                {/* Адрес */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Адрес:</div>
                  <div className="text-sm text-gray-900 leading-relaxed">
                    {result.display_name}
                  </div>
                </div>

                {/* Дополнительная информация */}
                {result.address && Object.keys(result.address).length > 0 && (
                  <div className="border-t border-gray-200 pt-3 space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Детали:
                    </div>
                    <div className="space-y-1 text-sm">
                      {result.address.road && result.address.house_number && (
                        <div className="text-gray-700">
                          {result.address.road}, {result.address.house_number}
                        </div>
                      )}
                      {result.address.road && !result.address.house_number && (
                        <div className="text-gray-700">{result.address.road}</div>
                      )}
                      {result.address.suburb && (
                        <div className="text-gray-600">{result.address.suburb}</div>
                      )}
                      {result.address.city && (
                        <div className="text-gray-700 font-medium">{result.address.city}</div>
                      )}
                      {result.address.state && (
                        <div className="text-gray-600">{result.address.state}</div>
                      )}
                      {result.address.country && (
                        <div className="text-gray-600">{result.address.country}</div>
                      )}
                      {result.address.postcode && (
                        <div className="text-gray-600">{result.address.postcode}</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Не удалось определить адрес для данной точки
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

