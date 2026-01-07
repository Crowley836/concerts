import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCityCoordinates, getDefaultCoordinates } from '../src/utils/city-coordinates'
import { normalizeArtistName, normalizeVenueName, normalizeGenreName } from '../src/utils/normalize.js'
import { createBackup } from './utils/backup'
import { batchGeocodeVenues, getCacheKey } from './services/geocoding'

// Define the interface to match src/types/concert.ts + logic used in fetch-google-sheet
interface ProcessedConcert {
    id: string
    date: string
    headliner: string
    headlinerNormalized: string
    genre: string
    genreNormalized: string
    openers: string[]
    venue: string
    venueNormalized: string
    city: string
    state: string
    cityState: string
    reference?: string
    isFestival: boolean // New field
    year: number
    month: number
    day: number
    dayOfWeek: string
    decade: string
    location: {
        lat: number
        lng: number
    }
}

// ... imports remain the same

async function importCsv() {
    console.log('🎸 Importing concert data from CSV...\n')

    const csvPath = join(process.cwd(), 'data', 'user-concerts.csv')
    const outputPath = join(process.cwd(), 'public', 'data', 'concerts.json')

    if (!existsSync(csvPath)) {
        console.error(`❌ CSV file not found at: ${csvPath}`)
        process.exit(1)
    }

    // Load existing data for merging (preserves manual edits/IDs)
    let existingConcertsMap = new Map<string, ProcessedConcert>()
    try {
        if (existsSync(outputPath)) {
            const existingData = JSON.parse(readFileSync(outputPath, 'utf-8'))
            if (existingData.concerts && Array.isArray(existingData.concerts)) {
                existingData.concerts.forEach((c: ProcessedConcert) => {
                    // Create a lookup key based on stable properties
                    // If we already have a stable-style ID, use that, otherwise generate one from data
                    // For legacy numerical IDs, we'll migrate them to stable IDs
                    const dateDesc = c.date
                    const headlinerSlug = c.headlinerNormalized || normalizeArtistName(c.headliner)
                    const stableKey = `${dateDesc}-${headlinerSlug}`
                    existingConcertsMap.set(stableKey, c)
                })
                console.log(`📦 Loaded ${existingConcertsMap.size} existing concerts for merging`)
            }
        }
    } catch (e) {
        console.warn('⚠️  Could not load existing concerts for merging')
    }

    const fileContent = readFileSync(csvPath, 'utf-8')

    // Parse CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    })

    console.log(`✅ Parsed ${records.length} rows from CSV\n`)

    // Extract unique venues for batch geocoding
    const uniqueVenuesMap = new Map<string, { venue: string; city: string; state: string }>();

    records.forEach((row: any) => {
        const venue = row['Venue'] || ''
        const cityState = row['City/State'] || ''
        const [city, statePart] = cityState.split(',').map((s: string) => s.trim())
        const state = statePart || ''

        if (venue && city && state) {
            const key = getCacheKey(venue, city, state)
            if (!uniqueVenuesMap.has(key)) {
                uniqueVenuesMap.set(key, { venue, city, state })
            }
        }
    })

    console.log(`📍 Batch geocoding ${uniqueVenuesMap.size} unique venues...`)
    const geocodedVenues = await batchGeocodeVenues(Array.from(uniqueVenuesMap.values()))
    console.log(`✨ Got coordinates for ${geocodedVenues.size} venues\n`)

    // Load artist metadata
    const metadataPath = join(process.cwd(), 'public', 'data', 'artists-metadata.json')
    let artistMetadata: any = {}
    try {
        if (existsSync(metadataPath)) {
            artistMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
            console.log(`🎨 Loaded metadata for ${Object.keys(artistMetadata).length} artists\n`)
        }
    } catch (e) {
        console.warn('⚠️  Could not load artist metadata')
    }

    // Load genre overrides
    const overridesPath = join(process.cwd(), 'data', 'genre-overrides.json')
    let genreOverrides: Record<string, string> = {}
    try {
        if (existsSync(overridesPath)) {
            genreOverrides = JSON.parse(readFileSync(overridesPath, 'utf-8'))
            console.log(`🔧 Loaded genre overrides for ${Object.keys(genreOverrides).length} artists\n`)
        }
    } catch (e) {
        console.warn('⚠️  Could not load genre overrides')
    }

    const concerts: ProcessedConcert[] = records.map((row: any, index: number) => {
        // 1. Parse Date
        let dateStr = row['Date']
        if (dateStr.includes('–')) {
            dateStr = dateStr.split('–')[0].trim()
        } else if (dateStr.includes('-') && dateStr.length > 10) {
            if (dateStr.includes(' - ')) {
                dateStr = dateStr.split(' - ')[0].trim()
            }
        }

        const date = new Date(dateStr)

        if (isNaN(date.getTime())) {
            console.warn(`⚠️  Row ${index + 1}: Invalid date "${row['Date']}" (parsed as "${dateStr}") - Skipping`)
            return null
        }

        const isoDate = date.toISOString().split('T')[0]

        // 2. Headliner
        const headliner = row['Artist Name - Headliner']
        const headlinerNormalized = normalizeArtistName(headliner)

        // 3. Genre (from overrides or metadata)
        let genre = ''
        if (genreOverrides[headlinerNormalized]) {
            genre = genreOverrides[headlinerNormalized]
        } else if (artistMetadata[headlinerNormalized]?.genres?.length > 0) {
            genre = artistMetadata[headlinerNormalized].genres[0]
        }

        // 4. Openers
        const openersRaw = row['Artist Name - Opener(s)'] || ''
        const openers = openersRaw ? openersRaw.split(',').map((s: string) => s.trim()) : []

        // 5. Venue & Location
        const venue = row['Venue']
        const cityState = row['City/State'] || ''
        const [city, statePart] = cityState.split(',').map((s: string) => s.trim())
        const state = statePart || ''

        // Resolve coordinates
        let coordinates: { lat: number; lng: number } = getDefaultCoordinates()
        const cacheKey = getCacheKey(venue, city, state)
        const geocoded = geocodedVenues.get(cacheKey)

        if (geocoded) {
            coordinates = geocoded
        } else {
            const cityCoords = getCityCoordinates(cityState)
            if (!cityCoords) {
                if (cityState && cityState.length > 2) {
                    console.warn(`⚠️  Missing coordinates for: "${venue}" in "${cityState}" - defaulting to Denver`)
                }
            } else {
                coordinates = cityCoords
            }
        }

        // 6. Festival
        const isFestival = row['Festival']?.toLowerCase().includes('yes')

        // 7. Stable ID & Merge Logic
        const stableKey = `${isoDate}-${headlinerNormalized}`
        const existing = existingConcertsMap.get(stableKey)

        // Base object from CSV data
        const newConcert: ProcessedConcert = {
            id: stableKey, // Always use stable ID now
            date: isoDate,
            headliner: headliner,
            headlinerNormalized: headlinerNormalized,
            genre: genre,
            genreNormalized: normalizeGenreName(genre),
            openers: openers,
            venue: venue,
            venueNormalized: normalizeVenueName(venue),
            city: city,
            state: state,
            cityState: cityState,
            isFestival: isFestival,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
            decade: `${Math.floor(date.getFullYear() / 10) * 10}s`,
            location: coordinates,
        }

        // checking if genre exists in existing data and not in new data is hard because we regenerate it every time.
        // However, we want to preserve things that might NOT be in the CSV regeneration logic (like user-added custom fields?)
        // For now, we mainly want to ensure the ID is stable.
        // We can also preserve 'genre' if the new one is empty but the old one wasn't?
        // Let's implement a shallow merge where CSV data takes precedence, but undefined CSV-derived fields fall back to existing.
        // ACTUALLY, strict requirement: "update existing data".
        // This implies preserving things external to this script (like maybe setlist ids if they were stored here, but they aren't).
        // The main benefit here is the STABLE ID.

        if (existing) {
            // If we had a manual genre override in the JSON that isn't in the CSV logic, we might want to keep it?
            // But the logic above loads genre overrides from file.
            // So actually, just returning the new object with the stable ID is sufficient for "updating"
            // because the ID matches, so downstream systems (like setlist cache) will re-associate.
            // BUT, if we want to support "manual edits to json file", we should merge.
            return {
                ...existing, // Keep existing fields (like maybe custom notes added manually)
                ...newConcert, // Overwrite with fresh CSV data
                id: stableKey // Ensure ID is the stable one
            }
        }

        return newConcert

    }).filter((c): c is ProcessedConcert => c !== null)

    // Sort by date (oldest to newest)
    concerts.sort((a, b) => a.date.localeCompare(b.date))

    // Generate metadata
    const uniqueArtists = new Set(concerts.map(c => c.headliner))
    const uniqueVenues = new Set(concerts.map(c => c.venue))
    const uniqueCities = new Set(concerts.map(c => c.cityState))

    const concertData = {
        concerts,
        metadata: {
            lastUpdated: new Date().toISOString(),
            totalConcerts: concerts.length,
            dateRange: {
                earliest: concerts[0]?.date || '',
                latest: concerts[concerts.length - 1]?.date || '',
            },
            uniqueArtists: uniqueArtists.size,
            uniqueVenues: uniqueVenues.size,
            uniqueCities: uniqueCities.size,
        },
    }

    // Write to file
    createBackup(outputPath, { maxBackups: 10, verbose: true })
    writeFileSync(outputPath, JSON.stringify(concertData, null, 2))

    console.log('='.repeat(60))
    console.log('📊 IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully processed: ${concerts.length} concerts`)
    console.log(`   📅 Date range: ${concertData.metadata.dateRange.earliest} to ${concertData.metadata.dateRange.latest}`)
    console.log(`   💾 Output file: ${outputPath}`)
    console.log('='.repeat(60))
}

importCsv()
