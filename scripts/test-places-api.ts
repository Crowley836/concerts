import { config } from 'dotenv'

// Load environment variables
config()

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''

async function testPlacesAPI() {
  console.log('=== Google Places API Diagnostic ===\n')

  // Check if API key exists
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in .env file')
    process.exit(1)
  }

  console.log('✓ API key found in .env')
  console.log(`  Key starts with: ${GOOGLE_MAPS_API_KEY.substring(0, 10)}...\n`)

  // Test 1: Text Search API
  console.log('Test 1: Text Search API')
  console.log('Searching for: Hollywood Bowl, Los Angeles, California')

  try {
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText'
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({
        textQuery: 'Hollywood Bowl, Los Angeles, California',
      }),
    })

    console.log(`Response status: ${searchResponse.status} ${searchResponse.statusText}`)

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error(`❌ Text Search failed: ${errorText}`)
      return
    }

    const searchData = await searchResponse.json()
    console.log('✓ Text Search succeeded')

    if (!searchData.places || searchData.places.length === 0) {
      console.error('❌ No places found')
      return
    }

    const placeId = searchData.places[0].id
    console.log(`  Found Place ID: ${placeId}`)
    console.log(`  Display Name: ${searchData.places[0].displayName?.text || 'N/A'}\n`)

    // Test 2: Place Details API
    console.log('Test 2: Place Details API')
    console.log(`Fetching details for Place ID: ${placeId}`)

    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`
    const detailsResponse = await fetch(detailsUrl, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,rating,userRatingCount,websiteUri,types,photos',
      },
    })

    console.log(`Response status: ${detailsResponse.status} ${detailsResponse.statusText}`)

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text()
      console.error(`❌ Place Details failed`)
      console.error(`Error response: ${errorText}\n`)

      // Provide diagnostic info
      console.log('🔍 Troubleshooting Tips:')
      if (detailsResponse.status === 404) {
        console.log('  - 404 errors typically mean:')
        console.log('    1. Billing is not enabled (most common)')
        console.log('    2. Places API (New) is not fully enabled')
        console.log('    3. API key restrictions are too strict')
      } else if (detailsResponse.status === 403) {
        console.log('  - 403 errors mean:')
        console.log('    1. API key doesn\'t have permission for Places API')
        console.log('    2. Check API key restrictions in Google Cloud Console')
      }
      console.log('\nNext steps:')
      console.log('  1. Go to https://console.cloud.google.com/billing')
      console.log('  2. Verify billing is linked to your project')
      console.log('  3. Go to https://console.cloud.google.com/apis/library')
      console.log('  4. Search for "Places API (New)" and verify it\'s enabled')
      console.log('  5. Go to APIs & Services → Credentials')
      console.log('  6. Edit your API key and verify "Places API (New)" is in the restrictions list')
      return
    }

    const detailsData = await detailsResponse.json()
    console.log('✓ Place Details succeeded')
    console.log(`  Name: ${detailsData.displayName?.text || 'N/A'}`)
    console.log(`  Address: ${detailsData.formattedAddress || 'N/A'}`)
    console.log(`  Rating: ${detailsData.rating || 'N/A'}`)
    console.log(`  Photos: ${detailsData.photos?.length || 0} available\n`)

    if (detailsData.photos && detailsData.photos.length > 0) {
      const photoRef = detailsData.photos[0].name
      console.log('Test 3: Photo URL Generation')
      const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&key=${GOOGLE_MAPS_API_KEY}`
      console.log(`✓ Photo URL: ${photoUrl.substring(0, 80)}...\n`)
    }

    console.log('🎉 All tests passed! Your Places API is configured correctly.')
    console.log('\nYou can now run: npm run enrich-venues')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testPlacesAPI()
