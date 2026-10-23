import { useState, useEffect } from 'react'
import { normalizeArtistName } from '../../utils/normalize'
import type { ArtistMetadata } from './types'

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
        setMetadata(data)
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
    const normalized = normalizeArtistName(artistName)
    return metadata[normalized] || null
  }

  /**
   * Last.fm's default "no image" placeholder hash — a gray star.
   * We treat this as "no image" so the UI falls back to our own placeholder.
   */
  const LASTFM_PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f'

  /**
   * Get image URL for a specific artist
   *
   * @param artistName - The artist name (will be normalized)
   * @returns Image URL or undefined if no image available
   */
  const getArtistImage = (artistName: string): string | undefined => {
    const artist = getArtistMetadata(artistName)
    const url = artist?.image
    // Reject Last.fm placeholder star
    if (url && url.includes(LASTFM_PLACEHOLDER_HASH)) return undefined
    return url
  }

  return {
    metadata,
    loading,
    error,
    getArtistMetadata,
    getArtistImage,
  }
}
