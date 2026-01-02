import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Concert {
  venue: string
  city: string
  state: string
}

interface UniqueVenue {
  venue: string
  city: string
  state: string
  status: string
  closed_date: string
  notes: string
}

async function main() {
  try {
    // Read concerts.json
    const concertsPath = path.join(__dirname, '../public/data/concerts.json')
    const concertsData = JSON.parse(fs.readFileSync(concertsPath, 'utf-8'))
    const concerts: Concert[] = concertsData.concerts

    console.log(`Found ${concerts.length} concerts`)

    // Extract unique venues
    const uniqueVenues = new Map<string, UniqueVenue>()

    concerts.forEach(concert => {
      const key = `${concert.venue}|${concert.city}|${concert.state}`.toLowerCase()
      if (!uniqueVenues.has(key)) {
        uniqueVenues.set(key, {
          venue: concert.venue,
          city: concert.city,
          state: concert.state,
          status: '',
          closed_date: '',
          notes: ''
        })
      }
    })

    console.log(`Found ${uniqueVenues.size} unique venues`)

    // Generate CSV
    const venuesToClassify = Array.from(uniqueVenues.values())
    const csvHeader = 'venue,city,state,status,closed_date,notes'
    const csvRows = venuesToClassify.map(v =>
      `"${v.venue}","${v.city}","${v.state}","${v.status}","${v.closed_date}","${v.notes}"`
    )
    const csv = [csvHeader, ...csvRows].join('\n')

    // Save to data/venues-to-classify.csv
    const outputPath = path.join(__dirname, '../data/venues-to-classify.csv')
    const outputDir = path.dirname(outputPath)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, csv, 'utf-8')

    console.log(`\n✓ Exported ${venuesToClassify.length} venues to: data/venues-to-classify.csv`)
    console.log('\nNext steps:')
    console.log('1. Research each venue\'s status (active/closed/demolished/renamed)')
    console.log('2. Fill in closed_date for legacy venues (YYYY-MM-DD format)')
    console.log('3. Add notes (e.g., "Demolished 2016 for residential development")')
    console.log('4. Save as data/venue-status.csv')
  } catch (error) {
    console.error('Error exporting venues:', error)
    process.exit(1)
  }
}

main()
