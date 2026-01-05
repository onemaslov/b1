export interface Marker {
  id: string
  title: string
  description?: string | null
  latitude: number
  longitude: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateMarkerInput {
  title: string
  description?: string
  latitude: number
  longitude: number
}

export interface UpdateMarkerInput {
  title?: string
  description?: string
  latitude?: number
  longitude?: number
}

