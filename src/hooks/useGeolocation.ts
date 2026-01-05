import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  location: { lat: number; lng: number } | null
  error: string | null
  isLoading: boolean
  hasPermission: boolean
}

export function useGeolocation(requestOnMount: boolean = true) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    hasPermission: false,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Геолокация не поддерживается вашим браузером',
        isLoading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          isLoading: false,
          hasPermission: true,
        })
      },
      (error) => {
        let errorMessage = 'Не удалось определить местоположение'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна.'
            break
          case error.TIMEOUT:
            errorMessage = 'Превышено время ожидания определения местоположения.'
            break
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          hasPermission: error.code !== error.PERMISSION_DENIED,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  useEffect(() => {
    if (requestOnMount) {
      requestLocation()
    }
  }, [requestOnMount, requestLocation])

  return {
    ...state,
    requestLocation,
  }
}

