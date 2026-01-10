import { execSync } from 'child_process'
import path from 'path'
import JSON from 'circular-json'

export interface Marker {
  id: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  userId: string
  createdAt: string
  updatedAt: string
}

const dbPath = path.join(process.cwd(), 'dev.db')

function escapeSql(str: string | null): string {
  if (str === null) return 'NULL'
  return "'" + (str?.replace(/'/g, "''") || '') + "'"
}

// Маркеры
export function getMarkersByUserId(userId: string): Marker[] {
  try {
    const sql = `SELECT * FROM markers WHERE userId = ${escapeSql(userId)} ORDER BY createdAt DESC;`
    const result = execSync(`sqlite3 ${dbPath} "${sql}"`, { encoding: 'utf-8' })
    
    if (!result.trim()) return []
    
    const lines = result.trim().split('\n')
    const markers: Marker[] = []
    
    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length >= 8) {
        markers.push({
          id: parts[0],
          title: parts[1],
          description: parts[2] === '' ? null : parts[2],
          latitude: parseFloat(parts[3]),
          longitude: parseFloat(parts[4]),
          userId: parts[5],
          createdAt: parts[6],
          updatedAt: parts[7],
        })
      }
    }
    
    return markers
  } catch (error) {
    console.error('Ошибка получения маркеров:', error)
    return []
  }
}

export function createMarker(data: {
  title: string
  description?: string
  latitude: number
  longitude: number
  userId: string
}): Marker {
  const id = Math.random().toString(36).substring(2, 11)
  const now = new Date().toISOString()
  
  try {
    const sql = `INSERT INTO markers (id, title, description, latitude, longitude, userId, createdAt, updatedAt) VALUES (${escapeSql(id)}, ${escapeSql(data.title)}, ${escapeSql(data.description || '')}, ${data.latitude}, ${data.longitude}, ${escapeSql(data.userId)}, ${escapeSql(now)}, ${escapeSql(now)});`
    execSync(`sqlite3 ${dbPath} "${sql}"`, { encoding: 'utf-8' })
  } catch (error) {
    console.error('Ошибка создания маркера:', error)
  }
  
  return {
    id,
    title: data.title,
    description: data.description || null,
    latitude: data.latitude,
    longitude: data.longitude,
    userId: data.userId,
    createdAt: now,
    updatedAt: now,
  }
}

export function getMarkerById(id: string, userId: string): Marker | null {
  try {
    const sql = `SELECT * FROM markers WHERE id = ${escapeSql(id)} AND userId = ${escapeSql(userId)};`
    const result = execSync(`sqlite3 ${dbPath} "${sql}"`, { encoding: 'utf-8' }).trim()
    
    if (!result) return null
    
    const parts = result.split('|')
    if (parts.length < 8) return null
    
    return {
      id: parts[0],
      title: parts[1],
      description: parts[2] === '' ? null : parts[2],
      latitude: parseFloat(parts[3]),
      longitude: parseFloat(parts[4]),
      userId: parts[5],
      createdAt: parts[6],
      updatedAt: parts[7],
    }
  } catch (error) {
    console.error('Ошибка получения маркера:', error)
    return null
  }
}

export function updateMarker(
  id: string,
  userId: string,
  data: Partial<Omit<Marker, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Marker | null {
  try {
    const existing = getMarkerById(id, userId)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updates: string[] = []
    
    if (data.title !== undefined) {
      updates.push(`title = ${escapeSql(data.title)}`)
    }
    if (data.description !== undefined) {
      updates.push(`description = ${escapeSql(data.description)}`)
    }
    if (data.latitude !== undefined) {
      updates.push(`latitude = ${data.latitude}`)
    }
    if (data.longitude !== undefined) {
      updates.push(`longitude = ${data.longitude}`)
    }
    
    if (updates.length === 0) return existing
    
    updates.push(`updatedAt = ${escapeSql(now)}`)
    
    const sql = `UPDATE markers SET ${updates.join(', ')} WHERE id = ${escapeSql(id)};`
    execSync(`sqlite3 ${dbPath} "${sql}"`, { encoding: 'utf-8' })
    
    return getMarkerById(id, userId)
  } catch (error) {
    console.error('Ошибка обновления маркера:', error)
    return null
  }
}

export function deleteMarker(id: string, userId: string): boolean {
  try {
    const existing = getMarkerById(id, userId)
    if (!existing) return false
    
    const sql = `DELETE FROM markers WHERE id = ${escapeSql(id)};`
    execSync(`sqlite3 ${dbPath} "${sql}"`, { encoding: 'utf-8' })
    
    return true
  } catch (error) {
    console.error('Ошибка удаления маркера:', error)
    return false
  }
}

