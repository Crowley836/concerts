
import { GoogleSheetsClient } from './utils/google-sheets-client.js'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { stringify } from 'csv-stringify/sync'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Format date from YYYY-MM-DD or MM/DD/YYYY to M/D/YYYY (or keep as is if compatible)
 * The goal is to match the existing CSV format roughly, though ISO (YYYY-MM-DD) is also fine.
 * Existing CSV seems to use M/D/YYYY (e.g., 6/6/1994).
 */
function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    // If it's already M/D/YYYY, return it? 
    // Actually, Sheets usually returns YYYY-MM-DD for date columns if we ask for values.
    // Let's ensure consistent M/D/YYYY format to minimize diff noise if possible,
    // or just standard ISO YYYY-MM-DD if we prefer that moving forward.
    // The existing import-csv.ts handles various formats, so let's stick to a clean standard.
    // Let's try to match existing CSV style: M/D/YYYY
    const m = date.getMonth() + 1
    const d = date.getDate()
    const y = date.getFullYear()
    return `${m}/${d}/${y}`
}

async function syncSheetToCsv() {
    console.log('🔄 Syncing Google Sheet to CSV...\n')

    // Validate environment variables
    const requiredVars = [
        'GOOGLE_SHEET_ID',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_REDIRECT_URI',
        'GOOGLE_REFRESH_TOKEN',
    ]

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.error(`❌ Missing required environment variable: ${varName}`)
            process.exit(1)
        }
    }

    console.log('debug config:', {
        clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
        sheetId: process.env.GOOGLE_SHEET_ID?.substring(0, 5) + '...'
    })

    const client = new GoogleSheetsClient({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: process.env.GOOGLE_REDIRECT_URI!,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
    })

    try {
        const sheetId = process.env.GOOGLE_SHEET_ID!
        let range = process.env.SHEET_RANGE || 'Sheet1!A1:Z5000'

        // Auto-detect sheet name if we're using default or if we want to be robust
        try {
            const metadata = await client.getSpreadsheetDetails(sheetId)
            if (metadata.sheets && metadata.sheets.length > 0) {
                const firstSheetTitle = metadata.sheets[0].properties.title
                // If the configured range uses "Sheet1" but the actual sheet is different, use the actual one
                if (range.startsWith('Sheet1!') && firstSheetTitle !== 'Sheet1') {
                    console.log(`ℹ️  Defaulting to first sheet: "${firstSheetTitle}"`)
                    range = range.replace('Sheet1!', `'${firstSheetTitle}'!`)
                } else if (!range.includes('!')) {
                    // If range is just "A1:Z5000" without sheet name
                    range = `'${firstSheetTitle}'!${range}`
                }
            }
        } catch (e) {
            console.warn('⚠️  Could not fetch spreadsheet metadata to auto-detect sheet name. Using configured range.')
        }

        // Ensure range starts at A1 to include headers
        range = range.replace(/!A\d+:/, '!A1:')

        console.log(`📍 Fetching from: ${range}`)
        const rows = await client.fetchConcerts(sheetId, range)
        console.log(`✅ Fetched ${rows.length} rows from sheet\n`)

        // Transform to CSV format
        // Columns: Date,Artist Name - Headliner,Artist Name - Opener(s),Venue,City/State,Festival
        const csvRows = rows.map(row => {
            // Combine opener and openers array
            // The client already puts 'opener' (column) into 'openers' array if we wanted?
            // Actually check client logic: it parses opener col AND Opener_N cols. 
            // BUT, `row.openers` in the interface seems to be just the Opener_N ones?
            // Let's check the client logic again.

            // Re-reading client logic:
            // const opener = ... (from 'opener' col)
            // const openers = [] (from 'opener_N' cols)
            // return { ..., opener, openers }

            // So we need to combine them.
            const allOpeners = []
            if (row.opener) allOpeners.push(row.opener)
            if (row.openers && row.openers.length > 0) allOpeners.push(...row.openers)

            // Join with commas, but since CSV cells can contain commas, we rely on csv-stringify to handle quoting.
            // However, the existing CSV seems to just put them in one string.
            // "Artist Name - Opener(s)"
            const openersStr = allOpeners.join(', ')

            return {
                'Date': formatDate(row.date),
                'Artist Name - Headliner': row.headliner,
                'Artist Name - Opener(s)': openersStr,
                'Venue': row.venue,
                'City/State': row.cityState,
                'Festival': row.festival || 'No',
                'Attended With': row.attendedWith || '',
                'Reference': row.reference || ''
            }
        })

        // Sort by date to maintain order
        csvRows.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

        // Convert to CSV string
        const csvContent = stringify(csvRows, {
            header: true,
            columns: [
                'Date',
                'Artist Name - Headliner',
                'Artist Name - Opener(s)',
                'Venue',
                'City/State',
                'Festival',
                'Attended With',
                'Reference'
            ]
        })

        const outputPath = join(process.cwd(), 'data', 'user-concerts.csv')

        // Write to file
        writeFileSync(outputPath, csvContent)

        console.log(`💾 Updated CSV at: ${outputPath}`)
        console.log(`   Total records: ${csvRows.length}`)

    } catch (error) {
        console.error('❌ Error syncing sheet to CSV:', error)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    syncSheetToCsv()
}
