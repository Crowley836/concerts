import { useState, useEffect } from 'react'
import type { ArtistMetadata } from './types'

/**
 * Normalize artist name to match the format in artists-metadata.json
 * Tries multiple formats to handle variations in the data
 */
function normalizeArtistName(name: string): string[] {
  const lowercase = name.toLowerCase()

  // Return multiple possible normalizations
  return [
    // With hyphens (TheAudioDB format): "duran-duran"
    lowercase.replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-'),
    // Without any special chars: "duranduran"
    lowercase.replace(/[^a-z0-9]/g, ''),
    // With spaces replaced by hyphens: "duran-duran"
    lowercase.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  ]
}

/**
 * Hook to fetch and manage artist metadata
 *
 * Loads the artists-metadata.json file and provides a lookup function
 * to retrieve metadata for a specific artist by name.
 *
 * @returns Object with metadata lookup function and loading/error states
 */
export function useArtistMetadata() {
  const [metadata, setMetadata] = useState<Record<string, ArtistMetadata> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadMetadata() {
      try {
        const response = await fetch('/data/artists-metadata.json')
        if (!response.ok) {
          throw new Error(`Failed to load artist metadata: ${response.statusText}`)
        }
        const data = await response.json()
        setMetadata(data.artists || {})
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error loading metadata'))
        setLoading(false)
      }
    }

    loadMetadata()
  }, [])

  /**
   * Get metadata for a specific artist
   *
   * @param artistName - The artist name (will be normalized)
   * @returns Artist metadata or null if not found
   */
  const getArtistMetadata = (artistName: string): ArtistMetadata | null => {
    if (!metadata) return null
    const normalizedVariants = normalizeArtistName(artistName)

    // Try each normalization variant until we find a match
    for (const normalized of normalizedVariants) {
      if (metadata[normalized]) {
        return metadata[normalized]
      }
    }

    return null
  }

  /**
   * Get image URL for a specific artist
   *
   * @param artistName - The artist name (will be normalized)
   * @returns Image URL or undefined if no image available
   */
  const getArtistImage = (artistName: string): string | undefined => {
    const artist = getArtistMetadata(artistName)
    return artist?.image
  }

  return {
    metadata,
    loading,
    error,
    getArtistMetadata,
    getArtistImage,
  }
}
