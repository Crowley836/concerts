import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { normalizeArtistName } from '../src/utils/normalize.js'
import * as dotenv from 'dotenv'

/**
 * Enrich artist metadata with Spotify data
 *
 * IMPORTANT: This script requires Spotify API access
 *
 * Setup:
 * 1. Create a Spotify Developer app at https://developer.spotify.com/dashboard
 * 2. Add to .env:
 *    SPOTIFY_CLIENT_ID=your_client_id
 *    SPOTIFY_CLIENT_SECRET=your_client_secret
 * 3. Run: npm run enrich-spotify
 *
 * The script will:
 * - Search for each artist on Spotify
 * - Fetch their most popular album + cover art
 * - Fetch top 3 tracks with 30-second preview URLs
 * - Handle ambiguous matches using spotify-overrides.json
 */

dotenv.config()

interface SpotifyArtistMetadata {
  name: string
  normalizedName: string
  spotifyArtistId?: string
  spotifyArtistUrl?: string
  mostPopularAlbum?: {
    name: string
    spotifyAlbumId: string
    spotifyAlbumUrl: string
    coverArt: {
      small: string | null
      medium: string | null
      large: string | null
    }
    releaseYear: number
  }
  topTracks?: Array<{
    name: string
    spotifyTrackId: string
    spotifyUrl: string
    previewUrl: string | null
    durationMs: number
  }>
  genres?: string[]
  popularity?: number
  fetchedAt: string
  dataSource: 'spotify' | 'mock'
}

interface SpotifyOverride {
  spotifyArtistId: string
  note: string
}

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Spotify credentials. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env file'
    )
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}


/**
 * Search for an artist on Spotify with retry logic
 */
async function searchSpotifyArtist(artistName: string, accessToken: string, retries = 3): Promise<any | null> {
  const query = encodeURIComponent(artistName.replace(/-/g, ' ')) // Replace hyphens with spaces
  const url = `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2')
        console.log(`  ⏳ Rate limited. Waiting ${retryAfter}s...`)
        await new Promise(r => setTimeout(r, (retryAfter * 1000) + 1000))
        return searchSpotifyArtist(artistName, accessToken, retries - 1)
      }
      console.warn(`  ⚠️  Spotify search rate limit exceeded for "${artistName}"`)
      return null
    }

    if (!response.ok) {
      console.warn(`  ⚠️  Spotify search failed for "${artistName}": ${response.status}`)
      return null
    }

    const data = await response.json()
    const artists = data.artists?.items || []

    if (artists.length === 0) {
      return null
    }

    // Return top result and log warnings if confidence is low
    const topResult = artists[0]
    const nameMatch = fuzzyMatch(artistName, topResult.name)
    const isPopular = topResult.popularity >= 30

    if (!nameMatch || !isPopular) {
      console.warn(
        `  ⚠️  Review match: "${artistName}" → "${topResult.name}" (popularity: ${topResult.popularity})`
      )
    }

    return topResult
  } catch (error) {
    console.error(`  ❌ Error searching for "${artistName}"`, error)
    return null
  }
}

/**
 * Fetch artist's most popular album with retry
 */
async function getArtistTopAlbum(artistId: string, accessToken: string, retries = 3): Promise<any | null> {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US&limit=20`

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2')
        await new Promise(r => setTimeout(r, (retryAfter * 1000) + 1000))
        return getArtistTopAlbum(artistId, accessToken, retries - 1)
      }
      return null
    }

    if (!response.ok) return null

    const data = await response.json()
    const albums = data.items || []

    if (albums.length === 0) return null

    // Get full album details to check popularity (throttled)
    const albumDetailsPromises = albums.slice(0, 5).map(async (album: any) => {
      await new Promise(r => setTimeout(r, 100)) // Throttle detail fetches
      const detailUrl = `https://api.spotify.com/v1/albums/${album.id}`
      const detailRes = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      return detailRes.ok ? detailRes.json() : null
    })

    const albumDetails = (await Promise.all(albumDetailsPromises)).filter(Boolean)
    albumDetails.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))

    return albumDetails[0] || null
  } catch (error) {
    return null
  }
}

/**
 * Fetch artist's top tracks with retry
 */
async function getArtistTopTracks(artistId: string, accessToken: string, retries = 3): Promise<any[] | null> {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2')
        await new Promise(r => setTimeout(r, (retryAfter * 1000) + 1000))
        return getArtistTopTracks(artistId, accessToken, retries - 1)
      }
      return null
    }

    if (!response.ok) return null

    const data = await response.json()
    return data.tracks ? data.tracks.slice(0, 5) : []
  } catch (error) {
    return null
  }
}



/**
 * Simple fuzzy name matching
 */
function fuzzyMatch(input: string, result: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim()

  const normalizedInput = normalize(input)
  const normalizedResult = normalize(result)

  return normalizedResult.includes(normalizedInput) || normalizedInput.includes(normalizedResult)
}

/**
 * Main enrichment function
 */
async function enrichSpotifyMetadata() {
  console.log('🎵 Enriching artist metadata with Spotify data...\n')

  // Check for Spotify credentials
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Missing Spotify credentials in .env file')
    console.error('   Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET\n')
    process.exit(1)
  }

  // Load concerts to get valid artist list
  const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
  const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
  const validArtists = new Set<string>()

  concertsData.concerts.forEach((concert: any) => {
    if (!concert.isFestival) {
      validArtists.add(normalizeArtistName(concert.headliner))
    }
    if (concert.openers) {
      concert.openers.forEach((opener: string) => {
        validArtists.add(normalizeArtistName(opener))
      })
    }
  })

  console.log(`Found ${validArtists.size} valid artists from concerts.json`)

  // Load artists metadata
  const metadataPath = join(process.cwd(), 'public', 'data', 'artists-metadata.json')
  const currentMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))

  // Filter metadata to only include valid artists
  const filteredArtists: Record<string, any> = {}
  let removedCount = 0

  Object.keys(currentMetadata).forEach(key => {
    if (validArtists.has(key)) {
      filteredArtists[key] = currentMetadata[key]
    } else {
      removedCount++
    }
  })

  console.log(`Removed ${removedCount} artists not present in concerts.json`)
  console.log(`Proceeding with ${Object.keys(filteredArtists).length} artists`)

  // Ensure all valid artists exist in the list to be processed
  validArtists.forEach(artistName => {
    if (!filteredArtists[artistName]) {
      console.log(`  ➕ Adding new artist stub: ${artistName}`)
      filteredArtists[artistName] = {
        name: artistName, // Initial name (will be updated by Spotify)
        normalizedName: artistName,
        fetchedAt: null,
        dataSource: 'mock', // Default until enriched
        genres: [],
        popularity: 0
      }
    }
  })

  const artists = filteredArtists

  // Load overrides
  const overridesPath = join(process.cwd(), 'scripts', 'spotify-overrides.json')
  const overrides: Record<string, SpotifyOverride> = JSON.parse(
    readFileSync(overridesPath, 'utf-8')
  )

  // Get Spotify access token
  console.log('🔑 Authenticating with Spotify...')
  const accessToken = await getSpotifyAccessToken()
  console.log('✅ Authenticated\n')

  let enriched = 0
  let skipped = 0
  let failed = 0

  const artistNames = Object.keys(artists)
  console.log(`Processing ${artistNames.length} artists...\n`)

  for (const normalizedName of artistNames) {
    const artist = artists[normalizedName]

    // Fix: Use the original name if available, or title-case the normalized one for search
    // (Better to trace back to concerts.json for display name, but we have normalized keys)
    // We'll search using the stored name or normalized one
    const searchName = artist.name || normalizedName

    // Skip if already enriched with Spotify data (within 90 days)
    if (artist.dataSource === 'spotify' && artist.fetchedAt) {
      const age = Date.now() - new Date(artist.fetchedAt).getTime()
      const ninetyDays = 90 * 24 * 60 * 60 * 1000
      if (age < ninetyDays) {
        skipped++
        continue
      }
    }

    console.log(`Fetching: ${artist.name}`)

    try {
      // Rate limiting (Spotify allows ~3 requests/sec)
      await new Promise(resolve => setTimeout(resolve, 350))

      let spotifyArtist = null

      // Check for manual override first
      if (overrides[normalizedName]) {
        console.log(`  📌 Using manual override`)
        const artistUrl = `https://api.spotify.com/v1/artists/${overrides[normalizedName].spotifyArtistId}`
        const response = await fetch(artistUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (response.ok) {
          spotifyArtist = await response.json()
        }
      } else {
        // Search Spotify
        spotifyArtist = await searchSpotifyArtist(artist.name, accessToken)
      }

      if (!spotifyArtist) {
        console.log(`  ❌ Not found on Spotify`)
        failed++
        continue
      }

      // Fetch album and tracks
      const [album, tracks] = await Promise.all([
        getArtistTopAlbum(spotifyArtist.id, accessToken),
        getArtistTopTracks(spotifyArtist.id, accessToken)
      ])

      // Update artist metadata
      artist.spotifyArtistId = spotifyArtist.id
      artist.spotifyArtistUrl = spotifyArtist.external_urls.spotify
      artist.genres = spotifyArtist.genres
      artist.popularity = spotifyArtist.popularity
      artist.dataSource = 'spotify'
      artist.fetchedAt = new Date().toISOString()

      // Populate missing image from Spotify
      if ((!artist.image || artist.image.includes('theaudiodb.com/images/media/artist/thumb/')) && spotifyArtist.images && spotifyArtist.images.length > 0) {
        // Spotify images are ordered by size (usually Large, Medium, Small)
        // We prefer the first one (largest) for high quality
        artist.image = spotifyArtist.images[0].url
      }

      if (album) {
        const images = album.images || []
        artist.mostPopularAlbum = {
          name: album.name,
          spotifyAlbumId: album.id,
          spotifyAlbumUrl: album.external_urls.spotify,
          coverArt: {
            small: images.find((img: any) => img.height === 64)?.url || images[2]?.url || null,
            medium: images.find((img: any) => img.height === 300)?.url || images[1]?.url || null,
            large: images.find((img: any) => img.height === 640)?.url || images[0]?.url || null
          },
          releaseYear: album.release_date ? parseInt(album.release_date.split('-')[0]) : 0
        }
      }

      if (tracks && tracks.length > 0) {
        artist.topTracks = tracks.map((track: any) => ({
          name: track.name,
          spotifyTrackId: track.id,
          spotifyUrl: track.external_urls.spotify,
          previewUrl: track.preview_url || null,
          durationMs: track.duration_ms
        }))
      }

      console.log(`  ✅ Enriched (album: ${album?.name || 'N/A'})`)
      enriched++
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`)
      failed++
    }
  }

  writeFileSync(metadataPath, JSON.stringify(artists, null, 2))

  console.log(`\n📊 Enrichment Summary:`)
  console.log(`   ✅ Enriched: ${enriched}`)
  console.log(`   ⏭️  Skipped (cached): ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`\n💾 Saved to: ${metadataPath}`)
  console.log('\n🎉 Done!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enrichSpotifyMetadata().catch(console.error)
}

export { enrichSpotifyMetadata }
