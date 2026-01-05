'use client'

import { MapPin, Loader2 } from 'lucide-react'

interface LocationButtonProps {
  onLocationRequest: () => void
  isLoading?: boolean
  hasPermission?: boolean
}

export default function LocationButton({
  onLocationRequest,
  isLoading = false,
  hasPermission = false,
}: LocationButtonProps) {
  return (
    <button
      onClick={onLocationRequest}
      disabled={isLoading}
      className={`fixed bottom-24 right-4 z-10 p-4 rounded-full shadow-lg transition-all duration-300 ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : hasPermission
          ? 'bg-primary-600 hover:bg-primary-700 hover:scale-110'
          : 'bg-white border-2 border-primary-600 hover:bg-primary-50 hover:scale-110'
      }`}
      title={isLoading ? 'Определение местоположения...' : 'Показать моё местоположение'}
    >
      {isLoading ? (
        <Loader2 className="text-white animate-spin" size={24} />
      ) : (
        <MapPin
          className={hasPermission ? 'text-white' : 'text-primary-600'}
          size={24}
        />
      )}
    </button>
  )
}

