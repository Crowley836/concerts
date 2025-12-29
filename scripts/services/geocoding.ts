import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
config()

interface GeocodeCache {
  [key: string]: {
    lat: number
    lng: number
    formattedAddress: string
    geocodedAt: string
  }
}

interface Coordinates {
  lat: number
  lng: number
}

const CACHE_PATH = path.join(__dirname, '../../public/data/geocode-cache.json')
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''

let cache: GeocodeCache = {}

/**
 * Load cache from disk
 */
export function loadCache(): void {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const content = fs.readFileSync(CACHE_PATH, 'utf-8')
      cache = JSON.parse(content)
    } else {
      cache = {}
    }
  } catch (error) {
    console.warn('Warning: Could not load geocode cache:', error)
    cache = {}
  }
}

/**
 * Save cache to disk
 */
export function saveCache(): void {
  try {
    const dir = path.dirname(CACHE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.error('Error: Could not save geocode cache:', error)
  }
}

/**
 * Generate cache key from venue details
 */
export function getCacheKey(venue: string, city: string, state: string): string {
  return `${venue}|${city}|${state}`.toLowerCase()
}

/**
 * Call Google Maps Geocoding API
 */
async function geocodeVenue(
  venue: string,
  city: string,
  state: string
): Promise<Coordinates | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Warning: GOOGLE_MAPS_API_KEY not set, skipping geocoding')
    return null
  }

  const address = `${venue}, ${city}, ${state}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location

      return {
        lat: location.lat,
        lng: location.lng,
      }
    } else {
      console.warn(`Warning: Could not geocode "${address}" - ${data.status}`)
      return null
    }
  } catch (error) {
    console.error(`Error geocoding "${address}":`, error)
    return null
  }
}

/**
 * Get venue coordinates with cache-first logic
 */
export async function getVenueCoordinates(
  venue: string,
  city: string,
  state: string
): Promise<Coordinates | null> {
  if (!venue || !city || !state) {
    return null
  }

  // Load cache if not already loaded
  if (Object.keys(cache).length === 0) {
    loadCache()
  }

  const cacheKey = getCacheKey(venue, city, state)

  // Check cache first
  if (cache[cacheKey]) {
    return {
      lat: cache[cacheKey].lat,
      lng: cache[cacheKey].lng,
    }
  }

  // Cache miss - geocode and store result
  console.log(`⚡ Geocoding: ${venue}, ${city}, ${state}`)
  const coordinates = await geocodeVenue(venue, city, state)

  if (coordinates) {
    // Store in cache
    cache[cacheKey] = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      formattedAddress: `${venue}, ${city}, ${state}`,
      geocodedAt: new Date().toISOString(),
    }

    // Save cache after each successful geocode
    saveCache()
  }

  return coordinates
}

/**
 * Batch geocode multiple venues with rate limiting
 */
export async function batchGeocodeVenues(
  venues: Array<{ venue: string; city: string; state: string }>
): Promise<Map<string, Coordinates>> {
  loadCache()
  const results = new Map<string, Coordinates>()

  for (const { venue, city, state } of venues) {
    const coordinates = await getVenueCoordinates(venue, city, state)
    if (coordinates) {
      const key = getCacheKey(venue, city, state)
      results.set(key, coordinates)
    }

    // Rate limiting: 50 requests/second limit, use 20ms delay to be safe
    await new Promise(resolve => setTimeout(resolve, 20))
  }

  saveCache()
  return results
}
