
import { readFileSync } from 'fs'
import { join } from 'path'

const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
const metadataPath = join(process.cwd(), 'public', 'data', 'artists-metadata.json')

function checkQuality() {
    const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
    const concerts = concertsData.concerts
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))

    console.log(`Analyzing ${concerts.length} concerts...\n`)

    const issues = {
        missingGenres: [] as string[],
        defaultLocations: [] as any[],
        missingMetadata: [] as string[],
        festivalMetadata: [] as string[]
    }

    // Default Denver coords (approx)
    const DENVER_LAT_PREFIX = 39.73
    const DENVER_LNG_PREFIX = -104.99

    const uniqueArtists = new Set<string>()

    concerts.forEach((c: any) => {
        uniqueArtists.add(c.headliner)

        // Check Genre
        if (!c.genre || c.genre === 'Unknown' || c.genre === '') {
            issues.missingGenres.push(`${c.headliner} (${c.date})`)
        }

        // Check Location (rough check for default Denver coords)
        // 39.7392, -104.9903 are standard Denver coords used in many libs
        if (Math.abs(c.location.lat - 39.7392358) < 0.001 && Math.abs(c.location.lng - -104.990251) < 0.001) {
            // Only flag if it's NOT actually in Denver
            if (!c.cityState.toLowerCase().includes('denver')) {
                issues.defaultLocations.push({
                    artist: c.headliner,
                    venue: c.venue,
                    city: c.cityState
                })
            }
        }
    })

    // Check Metadata
    uniqueArtists.forEach(artist => {
        // Normalize logic from code (simplified here, assuming standard normalization)
        const normalized = artist.toLowerCase().trim()
        // Try to find in metadata keys (which are normalized)
        const metaKey = Object.keys(metadata).find(k => k.toLowerCase() === normalized) || normalized

        const entry = metadata[metaKey]
        if (!entry) {
            issues.missingMetadata.push(artist)
        } else if (!entry.genres || entry.genres.length === 0) {
            // Metadata exists but no genre?
        }

        // Flag likely festivals that are treated as artists
        if (artist.toLowerCase().includes('fest') || artist.toLowerCase().includes('tour')) {
            if (!entry || entry.source !== 'manual') {
                issues.festivalMetadata.push(artist)
            }
        }
    })

    console.log('=== MISSING GENRES (Concerts) ===')
    if (issues.missingGenres.length > 0) {
        console.log(`Found ${issues.missingGenres.length} concerts with missing/unknown genres. First 10:`)
        issues.missingGenres.slice(0, 10).forEach(i => console.log(` - ${i}`))
    } else {
        console.log('✅ All concerts have genres.')
    }
    console.log('')

    console.log('=== SUSPICIOUS LOCATIONS (Defaulted to Denver) ===')
    if (issues.defaultLocations.length > 0) {
        console.log(`Found ${issues.defaultLocations.length} concerts that defaulted to Denver but aren't in Denver:`)
        issues.defaultLocations.forEach(i => console.log(` - ${i.artist} @ ${i.venue} (${i.city})`))
    } else {
        console.log('✅ No suspicious default locations found.')
    }
    console.log('')

    console.log('=== MISSING ARTIST METADATA ===')
    if (issues.missingMetadata.length > 0) {
        console.log(`Found ${issues.missingMetadata.length} artists with no metadata (bio, image, etc):`)
        issues.missingMetadata.slice(0, 15).forEach(a => console.log(` - ${a}`))
        if (issues.missingMetadata.length > 15) console.log(`   ...and ${issues.missingMetadata.length - 15} more`)
    } else {
        console.log('✅ All artists have metadata records.')
    }
    console.log('')

}

checkQuality()
