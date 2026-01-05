'use client'

import { MapPin, X, Edit2, Trash2, Eye } from 'lucide-react'
import type { Marker } from '@/types/marker'

interface SidebarProps {
  markers: Marker[]
  isOpen: boolean
  onClose: () => void
  onMarkerSelect: (markerId: string) => void
  onMarkerEdit: (marker: Marker) => void
  onMarkerDelete: (markerId: string) => void
  selectedMarkerId?: string
}

export default function Sidebar({
  markers,
  isOpen,
  onClose,
  onMarkerSelect,
  onMarkerEdit,
  onMarkerDelete,
  selectedMarkerId,
}: SidebarProps) {
  return (
    <>
      {/* Overlay для мобильных */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Сайдбар */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-primary-600" size={24} />
              Список меток
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Список меток */}
          <div className="flex-1 overflow-y-auto p-4">
            {markers.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Нет меток</p>
                <p className="text-sm mt-2">Нажмите на карту, чтобы добавить метку</p>
              </div>
            ) : (
              <div className="space-y-3">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      selectedMarkerId === marker.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{marker.title}</h3>
                      <button
                        onClick={() => onMarkerSelect(marker.id)}
                        className="p-1 hover:bg-primary-100 rounded transition-colors"
                        title="Показать на карте"
                      >
                        <Eye size={18} className="text-primary-600" />
                      </button>
                    </div>

                    {marker.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {marker.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onMarkerEdit(marker)}
                          className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => onMarkerDelete(marker.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

