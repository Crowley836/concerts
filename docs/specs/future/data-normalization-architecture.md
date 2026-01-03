# Data Normalization Architecture

> **Status**: ✅ Partial - Normalization utility complete (v1.4.0), ❌ Full architecture (genre removal, Spotify derivation) still planned
> **Completed**: Shared normalize utility ([NORMALIZATION_MIGRATION.md](../implemented/NORMALIZATION_MIGRATION.md)) in v1.4.0
> **Remaining**: Remove genre field from concerts.json, derive from Spotify/TheAudioDB
> **Dependencies**: Spotify API Integration (v1.3.0+ recommended but not required)
> **Last Updated**: 2026-01-04

---

## Overview

Normalize concert and artist data to eliminate redundancy and enable richer artist profiles. This architectural change separates **event facts** (concerts.json) from **artist metadata** (artists-metadata.json), with runtime joining in the frontend.

---

## Goals

1. **Eliminate manual genre research** - Derive genres from Spotify/TheAudioDB APIs
2. **Single source of truth** - Artist metadata lives in one place
3. **Richer artist profiles** - Support multiple genres, bios, images, discographies
4. **Easier maintenance** - Update artist data without regenerating concert data
5. **Future-proof** - Easy to add new artist data sources

---

## Current State (v1.2.3)

### concerts.json (Denormalized)
```json
{
  "concerts": [
    {
      "headliner": "Depeche Mode",
      "genre": "New Wave",  // ← Manually researched, duplicated per concert
      "openers": ["The Reflex"]
    }
  ]
}
```

**Problems:**
- Genre duplicated across concerts
- Manual genre research required
- Can't update artist info independently
- Mixed concerns (event + artist data)

---

## Target State (v1.4.0)

### concerts.json (Events Only)
```json
{
  "concerts": [
    {
      "id": "concert-1",
      "date": "1984-04-27",
      "headliner": "Depeche Mode",
      "headlinerNormalized": "depechemode",
      "openers": ["The Reflex"],
      "openersNormalized": ["thereflex"],
      "venue": "Irvine Meadows",
      "venueNormalized": "irvinemeadows",
      "city": "Irvine",
      "state": "California",
      "cityState": "Irvine, California",
      "location": { "lat": 33.69, "lng": -117.77 }
      // NO GENRE - derived from artists-metadata.json at runtime
      // NO VENUE PHOTOS - fetched from venues-metadata.json at runtime
    }
  ],
  "metadata": {
    "lastUpdated": "2026-01-02T12:00:00Z",
    "totalConcerts": 174,
    "uniqueArtists": 305,
    "uniqueVenues": 77,
    "uniqueCities": 34
  }
}
```

### artists-metadata.json (Artist Master Data)
```json
{
  "depechemode": {
    "name": "Depeche Mode",
    "normalizedName": "depechemode",

    // Concert references (from concerts.json)
    // Minimal data for each concert: id, date, venue
    "concerts": {
      "headliner": [
        { "id": "concert-1", "date": "1984-04-27", "venue": "Irvine Meadows" },
        { "id": "concert-45", "date": "2001-08-29", "venue": "Greek Theatre" },
        { "id": "concert-89", "date": "2009-08-22", "venue": "Greek Theatre" },
        { "id": "concert-134", "date": "2017-09-16", "venue": "Hollywood Bowl" }
      ],
      "opener": []
    },

    // Computed stats (derived from concert references)
    "stats": {
      "totalConcerts": 4,
      "asHeadliner": 4,
      "asOpener": 0,
      "firstSeen": "1984-04-27",
      "lastSeen": "2017-09-16",
      "uniqueVenues": 3
    },

    // Spotify data (primary source for rich media)
    "spotify": {
      "id": "762310PdDnwsDxAQxzQkfX",
      "uri": "spotify:artist:762310PdDnwsDxAQxzQkfX",
      "externalUrls": {
        "spotify": "https://open.spotify.com/artist/762310PdDnwsDxAQxzQkfX"
      },
      "genres": ["synthpop", "new wave", "alternative dance"],
      "popularity": 75,
      "followers": 5234567,
      "images": [
        { "url": "https://...", "width": 640, "height": 640 },
        { "url": "https://...", "width": 320, "height": 320 },
        { "url": "https://...", "width": 160, "height": 160 }
      ]
    },

    // Spotify albums
    "albums": [
      {
        "id": "...",
        "name": "Violator",
        "releaseDate": "1990-03-19",
        "totalTracks": 9,
        "images": [...],
        "externalUrls": {
          "spotify": "https://open.spotify.com/album/..."
        }
      }
    ],

    // Spotify top tracks
    "topTracks": [
      {
        "id": "...",
        "name": "Enjoy the Silence",
        "album": "Violator",
        "durationMs": 383213,
        "previewUrl": "https://p.scdn.co/mp3-preview/...",
        "externalUrls": {
          "spotify": "https://open.spotify.com/track/..."
        }
      }
    ],

    // TheAudioDB data (fallback/supplemental)
    "theaudiodb": {
      "id": "111402",
      "bio": "Depeche Mode are an English electronic music band formed in Basildon, Essex in 1980...",
      "formed": "1980",
      "website": "https://depechemode.com",
      "country": "United Kingdom",
      "genre": "Electronic",
      "mood": "Dark"
    },

    // Derived/computed fields
    "primaryGenre": "New Wave",  // ← Derived from Spotify genres via mapping
    "source": "spotify",         // ← Which API provided data
    "fetchedAt": "2026-01-02T12:00:00Z"
  }
}
```

### venues-metadata.json (Venue Master Data)

```json
{
  "irvinemeadows": {
    "name": "Irvine Meadows",
    "normalizedName": "irvinemeadows",
    "city": "Irvine",
    "state": "California",
    "cityState": "Irvine, California",

    // Computed location data
    "location": {
      "lat": 33.69,
      "lng": -117.77
    },

    // Concert references (from concerts.json)
    "concerts": [
      { "id": "concert-1", "date": "1984-04-27", "headliner": "Depeche Mode" },
      { "id": "concert-12", "date": "1988-06-15", "headliner": "The Cure" }
    ],

    // Computed stats
    "stats": {
      "totalConcerts": 2,
      "firstEvent": "1984-04-27",
      "lastEvent": "1988-06-15",
      "uniqueArtists": 2
    },

    // Google Places data
    "places": {
      "placeId": "ChIJX...",
      "photos": [
        {
          "photoReference": "places/ChIJX.../photos/ATplDJY...",
          "width": 4800,
          "height": 3200,
          "attributions": ["Photo by John Doe"]
        }
      ],
      "rating": 4.5,
      "userRatingsTotal": 1234,
      "types": ["amphitheater", "point_of_interest"],
      "website": "https://example.com",
      "formattedAddress": "8808 Irvine Center Dr, Irvine, CA 92618"
    },

    // Cached photo URLs (for performance)
    "photoUrls": {
      "thumbnail": "https://places.googleapis.com/v1/.../media?maxHeightPx=400&...",
      "medium": "https://places.googleapis.com/v1/.../media?maxHeightPx=800&...",
      "large": "https://places.googleapis.com/v1/.../media?maxHeightPx=1200&..."
    },

    "fetchedAt": "2026-01-02T12:00:00Z",
    "photoCacheExpiry": "2026-04-02T12:00:00Z"  // 90-day cache
  }
}
```

**Note on Legacy Venues:**

Many concert venues from the 1980s-1990s no longer exist (e.g., Irvine Meadows demolished in 2016). The venues-metadata.json structure handles this with:

- `status` field: `"active" | "closed" | "demolished" | "renamed"`
- `places` field: `null` for legacy venues (no Google Place ID)
- `manualPhotos` array: Curated historical photos stored in `/public/images/venues/`
- Three-tier fallback: Google Places API → Manual curation → No photo graceful fallback

See [venue-photos-integration.md](./venue-photos-integration.md) for complete venue photo strategy including legacy venue handling.

---

## Data Flow

### Phase 1: Data Collection

```
┌─────────────────┐
│ Google Sheets   │ ← User enters dates, venues, artists
└────────┬────────┘
         │ npm run fetch-sheet
         ↓
┌─────────────────┐
│ concerts.json   │ ← Pure event facts (no genres, no venue photos)
└─────────────────┘


┌─────────────────┐     ┌─────────────────┐
│ Spotify API     │     │ TheAudioDB API  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ npm run enrich-artists
                     ↓
         ┌─────────────────────┐
         │ artists-metadata.json│ ← Rich artist profiles
         └─────────────────────┘


┌─────────────────────┐
│ Google Places API   │
└────────┬────────────┘
         │ npm run enrich-venues
         ↓
┌─────────────────────┐
│ venues-metadata.json │ ← Venue photos & details
└─────────────────────┘
```

### Phase 2: Runtime Join (Frontend)

```typescript
// App.tsx loads all metadata files
const concerts = await fetch('/data/concerts.json')
const artistsMetadata = await fetch('/data/artists-metadata.json')
const venuesMetadata = await fetch('/data/venues-metadata.json')

// Scenes join data at runtime
const concert = concerts[0]
const artist = artistsMetadata[concert.headlinerNormalized]
const venue = venuesMetadata[concert.venueNormalized]
const genre = deriveGenre(artist)  // ← Fallback logic
const venuePhoto = venue?.photoUrls?.medium || null
```

---

## Genre Derivation Strategy

### Fallback Hierarchy

1. **Spotify genres** (primary) - Via genre mapping table
2. **TheAudioDB genre** (secondary) - If Spotify unavailable
3. **Hardcoded mapping** (tertiary) - For known artists
4. **"Unknown"** (fallback) - If all sources fail

### Genre Mapping Table

Map Spotify's granular genres to your broad categories:

```typescript
// src/utils/genre-mapping.ts
export const SPOTIFY_GENRE_MAP: Record<string, string> = {
  // New Wave / Synthpop
  'synthpop': 'New Wave',
  'new wave': 'New Wave',
  'alternative dance': 'New Wave',
  'electropop': 'New Wave',
  'dark wave': 'New Wave',

  // Post-Punk
  'post-punk': 'Post-Punk',
  'goth rock': 'Post-Punk',
  'gothic rock': 'Post-Punk',

  // Heavy Metal
  'heavy metal': 'Heavy Metal',
  'thrash metal': 'Heavy Metal',
  'death metal': 'Heavy Metal',
  'black metal': 'Heavy Metal',
  'power metal': 'Heavy Metal',

  // Punk
  'punk': 'Punk',
  'hardcore punk': 'Punk',
  'pop punk': 'Punk',
  'skate punk': 'Punk',

  // Alternative Rock
  'alternative rock': 'Alternative',
  'grunge': 'Alternative',
  'indie rock': 'Alternative',
  'college rock': 'Alternative',

  // Industrial
  'industrial': 'Industrial',
  'industrial rock': 'Industrial',
  'industrial metal': 'Industrial',

  // Add more mappings as needed
}

export function deriveGenre(artist: ArtistMetadata): string {
  // 1. Try Spotify genres (primary)
  if (artist.spotify?.genres && artist.spotify.genres.length > 0) {
    for (const spotifyGenre of artist.spotify.genres) {
      const mapped = SPOTIFY_GENRE_MAP[spotifyGenre.toLowerCase()]
      if (mapped) return mapped
    }
    // No mapping found - use first Spotify genre as-is
    return capitalize(artist.spotify.genres[0])
  }

  // 2. Try TheAudioDB genre (secondary)
  if (artist.theaudiodb?.genre) {
    const mapped = SPOTIFY_GENRE_MAP[artist.theaudiodb.genre.toLowerCase()]
    return mapped || artist.theaudiodb.genre
  }

  // 3. Fallback to unknown
  return 'Unknown'
}
```

---

## Implementation Plan

### Phase 0: Preparation (v1.2.4)

**Goal:** Make Google Sheets column parsing flexible

1. Update `google-sheets-client.ts` to use **header row** instead of hardcoded indices
2. Make genre column optional
3. Add warning if expected columns missing

**Changes:**
```typescript
// google-sheets-client.ts
interface SheetColumns {
  date: number
  headliner: number
  genre?: number  // ← Optional
  venue: number
  cityState: number
  reference?: number
  openers: number[]
}

function parseHeaders(headerRow: string[]): SheetColumns {
  // Map column names to indices
  const columns: SheetColumns = {
    date: -1,
    headliner: -1,
    venue: -1,
    cityState: -1,
    openers: []
  }

  headerRow.forEach((header, index) => {
    const normalized = header.toLowerCase().trim()
    if (normalized === 'date') columns.date = index
    if (normalized === 'headliner') columns.headliner = index
    if (normalized.includes('genre')) columns.genre = index
    if (normalized === 'venue') columns.venue = index
    if (normalized.includes('city') || normalized.includes('state')) columns.cityState = index
    if (normalized.startsWith('opener_')) columns.openers.push(index)
  })

  // Validate required columns
  if (columns.date === -1) throw new Error('Missing required column: Date')
  if (columns.headliner === -1) throw new Error('Missing required column: Headliner')

  return columns
}
```

**Timeline:** v1.2.4 (1-2 days)

---

### Phase 1: Remove Genre from concerts.json (v1.2.4)

**Goal:** Stop writing genre to concerts.json

1. Remove genre from `ProcessedConcert` interface
2. Update fetch script to not include genre
3. Update validation script to not check genre
4. Scenes use fallback: `concert.genre || 'Unknown'`

**Timeline:** v1.2.4 (same release as Phase 0)

---

### Phase 2: Spotify Integration (v1.3.0)

**Goal:** Fetch rich artist data from Spotify

See [spotify-artist-integration.md](./spotify-artist-integration.md) for complete spec.

**Summary:**
1. Set up Spotify API credentials
2. Implement Spotify client in `scripts/utils/spotify-client.ts`
3. Update `enrich-artists.ts` to fetch from Spotify
4. Store Spotify data in artists-metadata.json

**Timeline:** v1.3.0 (1-2 weeks)

---

### Phase 3: Computed Artist Stats & Concert References (v1.3.1)

**Goal:** Add concert references and statistics to artist metadata

1. After enriching artists, compute concert references and stats from concerts.json
2. Add to artists-metadata.json:
   - `concerts.headliner[]` - Array of minimal concert objects where artist was headliner
   - `concerts.opener[]` - Array of minimal concert objects where artist was opener
   - `stats.totalConcerts` - Total concert count
   - `stats.asHeadliner` - Headliner count
   - `stats.asOpener` - Opener count
   - `stats.firstSeen` - Earliest concert date
   - `stats.lastSeen` - Latest concert date
   - `stats.uniqueVenues` - Count of unique venues

**Implementation:**
```typescript
// scripts/compute-artist-stats.ts
interface MinimalConcert {
  id: string
  date: string
  venue: string
}

interface ArtistStats {
  totalConcerts: number
  asHeadliner: number
  asOpener: number
  firstSeen: string
  lastSeen: string
  uniqueVenues: number
}

interface ArtistConcerts {
  headliner: MinimalConcert[]
  opener: MinimalConcert[]
}

export function computeArtistStats(
  concerts: Concert[],
  artistsMetadata: ArtistsMetadataFile
): void {
  // Initialize concerts and stats for all artists
  Object.values(artistsMetadata).forEach(artist => {
    artist.concerts = {
      headliner: [],
      opener: []
    }
    artist.stats = {
      totalConcerts: 0,
      asHeadliner: 0,
      asOpener: 0,
      firstSeen: '',
      lastSeen: '',
      uniqueVenues: 0
    }
  })

  // Build concert references
  concerts.forEach(concert => {
    // Headliner reference
    const headliner = artistsMetadata[concert.headlinerNormalized]
    if (headliner) {
      headliner.concerts.headliner.push({
        id: concert.id,
        date: concert.date,
        venue: concert.venue
      })
    }

    // Opener references
    concert.openersNormalized?.forEach(openerNorm => {
      const opener = artistsMetadata[openerNorm]
      if (opener) {
        opener.concerts.opener.push({
          id: concert.id,
          date: concert.date,
          venue: concert.venue
        })
      }
    })
  })

  // Compute stats from concert references
  Object.values(artistsMetadata).forEach(artist => {
    const allConcerts = [...artist.concerts.headliner, ...artist.concerts.opener]

    if (allConcerts.length === 0) {
      return // No concerts for this artist
    }

    // Sort concerts by date
    allConcerts.sort((a, b) => a.date.localeCompare(b.date))

    // Compute stats
    artist.stats.totalConcerts = allConcerts.length
    artist.stats.asHeadliner = artist.concerts.headliner.length
    artist.stats.asOpener = artist.concerts.opener.length
    artist.stats.firstSeen = allConcerts[0].date
    artist.stats.lastSeen = allConcerts[allConcerts.length - 1].date

    // Count unique venues
    const uniqueVenues = new Set(allConcerts.map(c => c.venue))
    artist.stats.uniqueVenues = uniqueVenues.size
  })
}

// Add to build-data.ts
await enrichArtists({ dryRun })
if (!dryRun) {
  computeArtistStats(concerts, artistsMetadata)
  writeFileSync(artistsMetadataPath, JSON.stringify(artistsMetadata, null, 2))
}
```

**Benefits:**

- Fast aggregates (stats) for UI display
- Detailed concert history (references) for drill-down
- Efficient lookups (no need to scan all concerts)
- Enables features like "view all concerts by artist"

**Use Cases:**

```typescript
// 1. Show artist stats in Artist Scene card
const artist = artistsMetadata['depechemode']
console.log(`${artist.stats.totalConcerts} concerts (${artist.stats.asHeadliner} as headliner)`)
console.log(`Active: ${artist.stats.firstSeen} - ${artist.stats.lastSeen}`)

// 2. Get full concert details for an artist
const concerts = await fetch('/data/concerts.json')
const artistConcertIds = artist.concerts.headliner.map(c => c.id)
const fullConcerts = concerts.filter(c => artistConcertIds.includes(c.id))

// 3. Show recent activity
const recentConcerts = artist.concerts.headliner
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5)

// 4. Correlate concert to artist (reverse lookup)
const concert = concerts[0]
const concertArtist = artistsMetadata[concert.headlinerNormalized]
const matchingConcert = concertArtist.concerts.headliner.find(c => c.id === concert.id)
// matchingConcert = { id: "concert-1", date: "1984-04-27", venue: "Irvine Meadows" }
```

**File size impact:** ~45 KB additional for 305 artists × 4 avg concerts

**Timeline:** v1.3.1 (2-3 days)

---

### Phase 4: Update Frontend Scenes (v1.4.0)

**Goal:** Derive genre from artists-metadata.json at runtime

#### Scene Changes

**Scene 1 (Timeline):**
```typescript
// Before
const genre = concert.genre

// After
const artist = artistsMetadata[concert.headlinerNormalized]
const genre = deriveGenre(artist)
```

**Scene 2 (Top Artists):**
```typescript
// Before
const genre = concert.genre

// After
const artist = artistsMetadata[concert.headliner Normalized]
const genre = deriveGenre(artist)
```

**Scene 5 (Genres):**
```typescript
// Before
const genre = concert.genre || 'Unknown'

// After
const artist = artistsMetadata[concert.headlinerNormalized]
const genre = deriveGenre(artist)
```

**Scene 6 (Artists):**
```typescript
// Already joins with artists-metadata.json
// Just update to use new primaryGenre field
const genre = artist.primaryGenre || deriveGenre(artist)
```

#### useArtistData.ts Changes

```typescript
export function useArtistData(concerts: Concert[]) {
  const [artistsMetadata, setArtistsMetadata] = useState<ArtistsMetadataFile | null>(null)

  // Load artist metadata
  useEffect(() => {
    fetch('/data/artists-metadata.json')
      .then(res => res.json())
      .then(data => setArtistsMetadata(data))
      .catch(err => console.error('Failed to load artist metadata:', err))
  }, [])

  const artistCards = useMemo(() => {
    if (!artistsMetadata) return []

    // Aggregate concerts by artist
    const artistMap = new Map()

    concerts.forEach(concert => {
      const headlinerNorm = normalizeArtistName(concert.headliner)
      const artist = artistsMetadata[headlinerNorm]

      // Use derived genre
      const genre = artist ? deriveGenre(artist) : 'Unknown'

      // ... rest of aggregation logic
    })

    // ... return artist cards
  }, [concerts, artistsMetadata])

  return { artistCards, isLoading: !artistsMetadata }
}
```

**Timeline:** v1.4.0 (1 week)

---

## Migration Strategy

### Option A: Big Bang (Not Recommended)

Do all phases at once in v1.4.0.

**Pros:** Clean cut
**Cons:** High risk, long development time, scenes break until complete

### Option B: Phased Migration (Recommended)

```
v1.2.4: Make columns flexible, remove genre from concerts.json
  ↓
  Scenes use fallback: concert.genre || 'Unknown'
  ↓
v1.3.0: Add Spotify integration, populate artists-metadata.json
  ↓
  Scenes can start deriving genres from artists-metadata.json
  ↓
v1.3.1: Add computed stats to artists-metadata.json
  ↓
v1.4.0: Full genre derivation in all scenes
```

**Pros:** Lower risk, incremental value, can pause between phases
**Cons:** Longer timeline

---

## Rollback Plan

### If Spotify Integration Fails

1. Keep TheAudioDB as sole source
2. Use TheAudioDB genre field
3. Manual genre mapping table for artists TheAudioDB doesn't have

### If Genre Derivation Produces Poor Results

1. Add manual override field to artists-metadata.json:
   ```json
   {
     "depechemode": {
       "manualGenre": "New Wave",  // ← Overrides derived genre
       "spotify": { "genres": [...] }
     }
   }
   ```
2. Update deriveGenre() to check manualGenre first

---

## API Rate Limits & Costs

### Spotify API
- **Rate limit:** 30 requests/second (more than enough)
- **Cost:** Free tier sufficient
- **Quota:** Unlimited for basic artist/track data
- **Caching:** 30-day cache (same as TheAudioDB)

### TheAudioDB API
- **Rate limit:** 2 requests/second
- **Cost:** Free
- **Caching:** 30-day cache

### Expected Usage
- Initial enrichment: ~305 artists = 305 Spotify + 305 TheAudioDB calls = ~5 minutes
- Incremental: 0-5 new artists/month = ~10 API calls/month

---

## Testing Strategy

### Unit Tests
- Genre mapping function
- Genre derivation with fallbacks
- Artist stats computation

### Integration Tests
- Full pipeline: fetch → enrich → compute stats
- Frontend: concerts + artists → derived genres

### Manual Testing
1. Remove 10 artists from Spotify
2. Verify TheAudioDB fallback works
3. Check Genre Scene shows correct categories
4. Verify Artist Scene shows rich profiles

---

## Success Metrics

- ✅ All 305 artists have metadata (>95% from Spotify)
- ✅ Genre Scene shows same categories as before
- ✅ Artist Scene has album art for >90% of artists
- ✅ No manual genre research required
- ✅ Data pipeline runs <5 minutes

---

## Open Questions

1. **Should we keep TheAudioDB if we have Spotify?**
   - Yes - Spotify doesn't provide bios, formation year, or band member info

2. **What if Spotify genre doesn't map to our categories?**
   - Use Spotify genre as-is, add to "Other" category
   - Log unmapped genres for review
   - Add to genre mapping table over time

3. **Should computed stats be in artists-metadata.json or separate file?**
   - Keep in artists-metadata.json for simplicity
   - Single fetch per page load

4. **How to handle artists with no metadata?**
   - Store minimal record: `{ name, normalizedName, primaryGenre: 'Unknown' }`
   - Artist Scene shows card without album art
   - Genre Scene puts in "Unknown" category

---

## Dependencies

### Required for v1.4.0
- Spotify API credentials (see [spotify-artist-integration.md](./spotify-artist-integration.md))
- Updated frontend to join concerts + artists

### Optional Enhancements
- Manual genre override UI (admin panel)
- Artist profile pages (click card → full discography)
- Genre refinement ML model (auto-improve mapping)

---

## Related Documentation

- [spotify-artist-integration.md](./spotify-artist-integration.md) - Spotify API implementation
- [venue-photos-integration.md](./venue-photos-integration.md) - Google Places API for venue photos
- [google-sheets-data-integration.md](./google-sheets-data-integration.md) - Current pipeline
- [DATA_PIPELINE.md](../../DATA_PIPELINE.md) - Pipeline overview

---

*Last updated: 2026-01-02*
