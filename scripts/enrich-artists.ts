import { TheAudioDBClient } from './utils/theaudiodb-client'
import { LastFmClient } from './utils/lastfm-client'
import { SpotifyClient } from './services/spotify-client'
import { RateLimiter } from './utils/rate-limiter'
import { normalizeArtistName } from '../src/utils/normalize.js'
import { createBackup } from './utils/backup'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface ArtistMetadata {
  [artistNormalized: string]: {
    name: string
    image?: string
    bio?: string
    genres?: string[]
    formed?: string
    source: 'theaudiodb' | 'lastfm' | 'manual'
    fetchedAt: string
  }
}

/**
 * Enrich concert data with artist metadata from free APIs
 */
async function enrichArtists(options: { dryRun?: boolean } = {}) {
  const { dryRun = process.argv.includes('--dry-run') } = options

  console.log(`🎤 Enriching concert data with artist metadata...${dryRun ? ' (DRY RUN)' : ''}\n`)

  // Load concerts data
  const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
  if (!existsSync(concertsPath)) {
    console.error('❌ concerts.json not found. Run "npm run fetch-sheet" first.')
    process.exit(1)
  }

  const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
  const concerts = concertsData.concerts

  // Get unique artists (headliners only for now)
  const uniqueArtists = [...new Set(concerts.map((c: any) => c.headliner))]
  console.log(`Found ${uniqueArtists.length} unique artists to enrich\n`)

  // Load existing metadata if available
  const metadataPath = join(process.cwd(), 'public', 'data', 'artists-metadata.json')
  let metadata: ArtistMetadata = {}
  if (existsSync(metadataPath)) {
    metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
    console.log(`Loaded ${Object.keys(metadata).length} existing artist records\n`)
  }

  // Initialize API clients
  const audioDb = new TheAudioDBClient(process.env.THEAUDIODB_API_KEY || '2')
  const lastFm = process.env.LASTFM_API_KEY
    ? new LastFmClient(process.env.LASTFM_API_KEY)
    : null

  const spotify = new SpotifyClient()
  if (spotify.isConfigured) {
    console.log('✅ Spotify Client configured')
  } else {
    console.log('⚠️  Spotify credentials missing (skipping Spotify)')
  }

  const rateLimiter = new RateLimiter(2) // TheAudioDB: 2 calls/sec

  let enriched = 0
  let skipped = 0
  let failed = 0

  for (const artistName of uniqueArtists) {
    const normalized = normalizeArtistName(artistName)

    // Skip if already enriched and recent (within 30 days)
    // BUT always re-fetch mock data since it has no images
    const existingData = metadata[normalized] as any
    const isMockData = existingData && (existingData.source === 'mock' || existingData.dataSource === 'mock')
    if (existingData && !isMockData) {
      const age = Date.now() - new Date(existingData.fetchedAt).getTime()
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      if (age < thirtyDays) {
        skipped++
        continue
      }
    }

    console.log(`Fetching metadata for: ${artistName}`)

    try {
      // Rate limit
      await rateLimiter.wait()

      // 1. Try Spotify first (High Quality)
      if (spotify.isConfigured) {
        // Rate limit roughly (Spotify is generous but let's be safe)
        await new Promise(r => setTimeout(r, 200))

        const spotifyArtist = await spotify.searchArtist(artistName)
        if (spotifyArtist && spotifyArtist.images && spotifyArtist.images.length > 0) {
          // Get the best image (usually the second one is ~300x300, or first is 640x640)
          // We prefer medium/large for detail
          const image = spotifyArtist.images[0]?.url

          if (image) {
            metadata[normalized] = {
              name: spotifyArtist.name,
              image: image,
              genres: spotifyArtist.genres,
              source: 'spotify', // Use 'spotify' NOT 'theaudiodb'
              fetchedAt: new Date().toISOString()
            } as any // Cast to satisfy strict typing if needed, but structure matches roughly
            console.log(`  ✅ Found on Spotify`)
            enriched++
            continue
          }
        }
      }

      // 2. Try TheAudioDB
      const audioDbInfo = await audioDb.getArtistInfo(artistName)

      if (audioDbInfo && audioDbInfo.image) {
        metadata[normalized] = audioDbInfo
        console.log(`  ✅ Found on TheAudioDB`)
        enriched++
        continue
      }

      // Fallback to Last.fm
      if (lastFm) {
        const lastFmInfo = await lastFm.getArtistInfo(artistName)

        if (lastFmInfo && lastFmInfo.image) {
          metadata[normalized] = lastFmInfo
          console.log(`  ✅ Found on Last.fm`)
          enriched++
          continue
        }
      }

      console.log(`  ⚠️  No metadata found`)
      failed++
    } catch (error) {
      console.error(`  ❌ Error fetching ${artistName}:`, error)
      failed++
    }
  }

  // Save metadata
  if (dryRun) {
    console.log('\n='.repeat(30))
    console.log('🔍 DRY RUN MODE - No files will be modified')
    console.log('='.repeat(30))
    console.log(`\nWould write to: ${metadataPath}`)
    console.log(`File size: ${JSON.stringify(metadata, null, 2).length} bytes`)
  } else {
    // Create backup before overwriting
    createBackup(metadataPath, { maxBackups: 10, verbose: true })

    // Write new metadata
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  }

  console.log(`\n📊 Enrichment Summary:`)
  console.log(`   ✅ Enriched: ${enriched}`)
  console.log(`   ⏭️  Skipped (cached): ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)

  if (dryRun) {
    console.log('\n💡 To apply these changes, run without --dry-run flag')
  } else {
    console.log(`\n💾 Saved metadata to: ${metadataPath}`)
  }

  console.log(`\n🎉 Done!${dryRun ? ' (DRY RUN)' : ''}`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enrichArtists()
}

export { enrichArtists }
