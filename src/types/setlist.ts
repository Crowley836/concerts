/**
 * Type definitions for setlist.fm API responses
 * API Documentation: https://api.setlist.fm/docs/1.0/index.html
 */

/**
 * Individual song in a setlist
 */
export interface SetlistSong {
  name: string
  cover?: {
    name: string // Original artist if it's a cover
    mbid?: string // MusicBrainz ID of cover artist
    sortName?: string
    disambiguation?: string
    url?: string
  }
  tape?: boolean // Indicates if played from tape/recording
  info?: string // Additional notes about the song performance
  with?: {
    name: string // Guest artist
    mbid?: string
    sortName?: string
    disambiguation?: string
    url?: string
  }
}

/**
 * A set of songs (Set 1, Set 2, Encore, etc.)
 */
export interface SetlistSet {
  name?: string // "Set 1", "Encore", etc. (optional, may be empty)
  encore?: number // Encore number (1, 2, 3, etc.) if this is an encore
  song: SetlistSong[]
}

/**
 * City information from setlist.fm
 */
export interface SetlistCity {
  id: string
  name: string
  state?: string
  stateCode?: string
  coords?: {
    lat: number
    long: number
  }
  country: {
    code: string // "US", "GB", etc.
    name: string
  }
}

/**
 * Venue information from setlist.fm
 */
export interface SetlistVenue {
  id: string
  name: string
  city: SetlistCity
  url?: string
}

/**
 * Artist information from setlist.fm
 */
export interface SetlistArtist {
  mbid: string // MusicBrainz ID
  tmid?: number // Ticketmaster ID
  name: string
  sortName: string
  disambiguation?: string
  url: string
}

/**
 * Tour information (optional)
 */
export interface SetlistTour {
  name: string
}

/**
 * Complete setlist from setlist.fm API
 */
export interface Setlist {
  id: string
  versionId: string
  eventDate: string // DD-MM-YYYY format
  lastUpdated: string // ISO 8601 timestamp
  artist: SetlistArtist
  venue: SetlistVenue
  tour?: SetlistTour
  sets: {
    set: SetlistSet[]
  }
  info?: string // Show notes/description
  url: string // setlist.fm URL for this setlist
}

/**
 * API response wrapper for setlist searches
 */
export interface SetlistSearchResponse {
  type: 'setlists'
  itemsPerPage: number
  page: number
  total: number
  setlist: Setlist[]
}

/**
 * Parameters for searching setlists
 */
export interface SetlistSearchParams {
  concertId?: string // Optional concert ID for static cache lookup
  artistName: string
  date: string // YYYY-MM-DD format (internal format)
  venueName: string
  city: string
}

/**
 * Cached setlist entry with TTL
 */
export interface CachedSetlist {
  data: Setlist | null
  timestamp: number
  ttl: number
}

/**
 * Error types for setlist fetching
 */
export type SetlistError =
  | { type: 'network'; message: string }
  | { type: 'api_error'; status: number; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'rate_limit'; message: string }
  | { type: 'unknown'; message: string }
