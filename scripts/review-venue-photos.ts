import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface VenueMetadata {
  name: string
  normalizedName: string
  status: string
  photoUrls?: {
    thumbnail: string
    medium: string
    large: string
  }
  places?: {
    photos?: Array<{
      name: string
      authorAttributions?: Array<{
        displayName: string
      }>
    }>
  }
}

async function reviewPhotos() {
  console.log('=== Venue Photo Review ===\n')

  const metadataPath = path.join(__dirname, '../public/data/venues-metadata.json')
  const metadata: Record<string, VenueMetadata> = JSON.parse(
    fs.readFileSync(metadataPath, 'utf-8')
  )

  const venues = Object.values(metadata)
  const activeVenues = venues.filter(v => v.status === 'active')
  const legacyVenues = venues.filter(v => v.status !== 'active')

  console.log(`Total venues: ${venues.length}`)
  console.log(`Active venues: ${activeVenues.length}`)
  console.log(`Legacy venues: ${legacyVenues.length}\n`)

  console.log('='.repeat(80))
  console.log('ACTIVE VENUES WITH GOOGLE PLACES PHOTOS')
  console.log('='.repeat(80))
  console.log()

  const activeWithPhotos = activeVenues.filter(
    v => v.photoUrls && !v.photoUrls.large.includes('fallback')
  )
  const activeWithFallback = activeVenues.filter(
    v => v.photoUrls && v.photoUrls.large.includes('fallback')
  )

  activeWithPhotos.forEach(venue => {
    const photographer = venue.places?.photos?.[0]?.authorAttributions?.[0]?.displayName || 'Unknown'

    console.log(`${venue.name}`)
    console.log(`  Photo by: ${photographer}`)
    console.log(`  URL: ${venue.photoUrls?.large}`)
    console.log()
  })

  console.log('='.repeat(80))
  console.log(`ACTIVE VENUES USING FALLBACK IMAGE (${activeWithFallback.length})`)
  console.log('='.repeat(80))
  console.log()

  activeWithFallback.forEach(venue => {
    console.log(`${venue.name} - No photos available from Places API`)
  })

  console.log()
  console.log('='.repeat(80))
  console.log(`LEGACY VENUES (${legacyVenues.length})`)
  console.log('='.repeat(80))
  console.log()

  const legacyWithManual = legacyVenues.filter(
    v => v.photoUrls && !v.photoUrls.large.includes('fallback')
  )
  const legacyWithFallback = legacyVenues.filter(
    v => v.photoUrls && v.photoUrls.large.includes('fallback')
  )

  if (legacyWithManual.length > 0) {
    console.log(`With manual photos (${legacyWithManual.length}):`)
    legacyWithManual.forEach(venue => {
      console.log(`  ${venue.name} - ${venue.status}`)
      console.log(`    URL: ${venue.photoUrls?.large}`)
    })
    console.log()
  }

  if (legacyWithFallback.length > 0) {
    console.log(`Using fallback image (${legacyWithFallback.length}):`)
    legacyWithFallback.forEach(venue => {
      console.log(`  ${venue.name} - ${venue.status}`)
      console.log(`    Normalized: ${venue.normalizedName}`)
    })
  }

  console.log()
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`✓ ${activeWithPhotos.length} active venues with Google Places photos`)
  console.log(`⚠ ${activeWithFallback.length} active venues using fallback`)
  console.log(`✓ ${legacyWithManual.length} legacy venues with manual photos`)
  console.log(`⚠ ${legacyWithFallback.length} legacy venues using fallback`)
  console.log()
  console.log('To review photos, copy URLs above and paste into browser')
  console.log('To add manual photos for legacy venues, save images to:')
  console.log('  /public/images/venues/{normalizedName}-1.jpg')
}

reviewPhotos().catch(console.error)
