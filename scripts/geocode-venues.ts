import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { batchGeocodeVenues, loadCache, saveCache } from './services/geocoding.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Concert {
  venue: string
  city: string
  state: string
}

async function main() {
  try {
    // Read concerts.json
    const concertsPath = path.join(__dirname, '../public/data/concerts.json')
    const concertsData = JSON.parse(fs.readFileSync(concertsPath, 'utf-8'))
    const concerts: Concert[] = concertsData.concerts

    console.log(`Found ${concerts.length} concerts`)

    // Extract unique venues
    const uniqueVenues = new Map<string, { venue: string; city: string; state: string }>()

    concerts.forEach(concert => {
      const key = `${concert.venue}|${concert.city}|${concert.state}`.toLowerCase()
      if (!uniqueVenues.has(key)) {
        uniqueVenues.set(key, {
          venue: concert.venue,
          city: concert.city,
          state: concert.state,
        })
      }
    })

    console.log(`Found ${uniqueVenues.size} unique venues`)

    // Batch geocode all venues
    const venuesToGeocode = Array.from(uniqueVenues.values())
    console.log('Starting batch geocoding...')

    const results = await batchGeocodeVenues(venuesToGeocode)

    console.log(`\n✓ Successfully geocoded ${results.size} venues`)
    console.log(`Cache saved to: public/data/geocode-cache.json`)
  } catch (error) {
    console.error('Error geocoding venues:', error)
    process.exit(1)
  }
}

main()
