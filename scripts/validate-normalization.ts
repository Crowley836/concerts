import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { normalizeArtistName, normalizeVenueName, normalizeGenreName } from '../src/utils/normalize.js'

/**
 * Validate that all data files use consistent normalization
 *
 * This script checks for:
 * 1. Duplicate artist keys in artists-metadata.json
 * 2. Mismatches between concerts.json and artists-metadata.json normalization
 * 3. Duplicate venue keys in venues-metadata.json
 * 4. Consistency across all data files
 *
 * Exits with code 1 if any issues are found (for CI/CD pipelines)
 */

/**
 * Intentional artist normalization overrides
 *
 * Maps canonical normalization → actual key used in metadata
 *
 * These artist keys intentionally differ from canonical normalization for:
 * - Better URL readability (removing "The" prefix)
 * - Artist name preferences (US vs UK names)
 * - Disambiguation (distinguishing similar band names)
 * - Punctuation handling (maintaining recognizable abbreviations)
 */
const ARTIST_NORMALIZATION_OVERRIDES: Record<string, string> = {
  // Remove "The" prefix for cleaner URLs
  'the-beach-boys': 'beach-boys',           // The Beach Boys → beach-boys (not the-beach-boys)
  'art-of-noise': 'the-art-of-noise',       // Art of Noise → the-art-of-noise (manual override)

  // Preserve "and" for readability
  'echo-the-bunnymen': 'echo-and-the-bunnymen',  // Echo & The Bunnymen → echo-and-the-bunnymen
  'peter-hook-the-light': 'peter-hook-and-the-light',  // Peter Hook & The Light

  // Disambiguation for band names
  'the-beat': 'the-english-beat',           // The Beat (UK) vs The Beat (US) → the-english-beat

  // Maintain recognizable abbreviations
  'run-d-m-c': 'run-dmc',                   // Run-D.M.C. → run-dmc (not run-d-m-c)
  'tone-l-c': 'tone-loc',                   // Tone-Lōc → tone-loc (not tone-l-c)

  // Artist name preference (US vs UK)
  'yazoo': 'yaz',                           // Yazoo (UK) known as Yaz (US) → yaz
}

interface ValidationIssue {
  type: 'duplicate' | 'mismatch' | 'missing'
  severity: 'error' | 'warning'
  message: string
  details?: any
}

function validateArtistNormalization(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Load artists-metadata.json
  const metadataPath = join(process.cwd(), 'public', 'data', 'artists-metadata.json')
  if (!existsSync(metadataPath)) {
    issues.push({
      type: 'missing',
      severity: 'error',
      message: 'artists-metadata.json not found',
    })
    return issues
  }

  const rawData = JSON.parse(readFileSync(metadataPath, 'utf-8'))
  const metadata: Record<string, any> = rawData.artists || rawData

  // Check for duplicates (same artist with multiple keys)
  const artistNameToKeys = new Map<string, string[]>()

  for (const [key, data] of Object.entries(metadata)) {
    if (!data.name) {
      issues.push({
        type: 'missing',
        severity: 'error',
        message: `Artist entry missing name field`,
        details: { key, data },
      })
      continue
    }

    const canonicalKey = normalizeArtistName(data.name)

    if (!artistNameToKeys.has(canonicalKey)) {
      artistNameToKeys.set(canonicalKey, [])
    }
    artistNameToKeys.get(canonicalKey)!.push(key)

    // Check if the key matches the canonical normalization
    // Allow intentional overrides from the allowlist
    const expectedKey = ARTIST_NORMALIZATION_OVERRIDES[canonicalKey] || canonicalKey
    if (key !== expectedKey) {
      issues.push({
        type: 'mismatch',
        severity: 'error',
        message: `Artist key "${key}" doesn't match canonical normalization "${canonicalKey}"`,
        details: { artistName: data.name, actualKey: key, expectedKey },
      })
    }
  }

  // Check for duplicates
  for (const [canonicalKey, keys] of artistNameToKeys) {
    if (keys.length > 1) {
      const artistName = metadata[keys[0]].name
      issues.push({
        type: 'duplicate',
        severity: 'error',
        message: `Artist "${artistName}" has ${keys.length} duplicate entries`,
        details: { artistName, canonicalKey, duplicateKeys: keys },
      })
    }
  }

  return issues
}

function validateConcertsArtistNormalization(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Load concerts.json
  const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
  if (!existsSync(concertsPath)) {
    issues.push({
      type: 'missing',
      severity: 'error',
      message: 'concerts.json not found',
    })
    return issues
  }

  const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
  const concerts = concertsData.concerts

  // Check that headlinerNormalized matches our normalization function
  for (const concert of concerts) {
    const expectedNormalized = normalizeArtistName(concert.headliner)

    if (concert.headlinerNormalized !== expectedNormalized) {
      issues.push({
        type: 'mismatch',
        severity: 'error',
        message: `Concert ${concert.id} headliner normalization mismatch`,
        details: {
          concertId: concert.id,
          headliner: concert.headliner,
          actual: concert.headlinerNormalized,
          expected: expectedNormalized,
        },
      })
    }
  }

  return issues
}

function validateVenueNormalization(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Load venues-metadata.json
  const metadataPath = join(process.cwd(), 'public', 'data', 'venues-metadata.json')
  if (!existsSync(metadataPath)) {
    // Venue metadata is optional
    return issues
  }

  const metadata: Record<string, any> = JSON.parse(readFileSync(metadataPath, 'utf-8'))

  // Check for duplicates and normalization consistency
  const venueNameToKeys = new Map<string, string[]>()

  for (const [key, data] of Object.entries(metadata)) {
    if (!data.name) {
      issues.push({
        type: 'missing',
        severity: 'error',
        message: `Venue entry missing name field`,
        details: { key },
      })
      continue
    }

    const canonicalKey = normalizeVenueName(data.name)

    if (!venueNameToKeys.has(canonicalKey)) {
      venueNameToKeys.set(canonicalKey, [])
    }
    venueNameToKeys.get(canonicalKey)!.push(key)

    // Check if the key matches the canonical normalization
    if (key !== canonicalKey) {
      issues.push({
        type: 'mismatch',
        severity: 'error',
        message: `Venue key "${key}" doesn't match canonical normalization "${canonicalKey}"`,
        details: { venueName: data.name, actualKey: key, expectedKey: canonicalKey },
      })
    }
  }

  // Check for duplicates
  for (const [canonicalKey, keys] of venueNameToKeys) {
    if (keys.length > 1) {
      const venueName = metadata[keys[0]].name
      issues.push({
        type: 'duplicate',
        severity: 'error',
        message: `Venue "${venueName}" has ${keys.length} duplicate entries`,
        details: { venueName, canonicalKey, duplicateKeys: keys },
      })
    }
  }

  return issues
}

function validateGenreNormalization(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Load concerts.json
  const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
  if (!existsSync(concertsPath)) {
    issues.push({
      type: 'missing',
      severity: 'error',
      message: 'concerts.json not found',
    })
    return issues
  }

  const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
  const concerts = concertsData.concerts

  // Check that genreNormalized matches our normalization function
  for (const concert of concerts) {
    // Skip validation if genreNormalized doesn't exist (for backwards compatibility)
    if (!concert.hasOwnProperty('genreNormalized')) {
      continue
    }

    const expectedNormalized = normalizeGenreName(concert.genre)

    if (concert.genreNormalized !== expectedNormalized) {
      issues.push({
        type: 'mismatch',
        severity: 'error',
        message: `Concert ${concert.id} genre normalization mismatch`,
        details: {
          concertId: concert.id,
          genre: concert.genre,
          actual: concert.genreNormalized,
          expected: expectedNormalized,
        },
      })
    }
  }

  return issues
}

function validateVenueNormalized(): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Load concerts.json
  const concertsPath = join(process.cwd(), 'public', 'data', 'concerts.json')
  if (!existsSync(concertsPath)) {
    issues.push({
      type: 'missing',
      severity: 'error',
      message: 'concerts.json not found',
    })
    return issues
  }

  const concertsData = JSON.parse(readFileSync(concertsPath, 'utf-8'))
  const concerts = concertsData.concerts

  // Check that venueNormalized matches our normalization function
  for (const concert of concerts) {
    // Skip validation if venueNormalized doesn't exist (for backwards compatibility)
    if (!concert.hasOwnProperty('venueNormalized')) {
      continue
    }

    const expectedNormalized = normalizeVenueName(concert.venue)

    if (concert.venueNormalized !== expectedNormalized) {
      issues.push({
        type: 'mismatch',
        severity: 'error',
        message: `Concert ${concert.id} venue normalization mismatch`,
        details: {
          concertId: concert.id,
          venue: concert.venue,
          actual: concert.venueNormalized,
          expected: expectedNormalized,
        },
      })
    }
  }

  return issues
}

function main() {
  console.log('🔍 Validating data normalization consistency...\n')

  const allIssues: ValidationIssue[] = []

  // Validate artist normalization
  console.log('📊 Checking artists-metadata.json...')
  const artistIssues = validateArtistNormalization()
  allIssues.push(...artistIssues)
  if (artistIssues.length === 0) {
    console.log('   ✅ No issues found\n')
  } else {
    console.log(`   ⚠️  Found ${artistIssues.length} issue(s)\n`)
  }

  // Validate concerts normalization
  console.log('📅 Checking concerts.json normalization...')
  const concertIssues = validateConcertsArtistNormalization()
  allIssues.push(...concertIssues)
  if (concertIssues.length === 0) {
    console.log('   ✅ No issues found\n')
  } else {
    console.log(`   ⚠️  Found ${concertIssues.length} issue(s)\n`)
  }

  // Validate venue normalization
  console.log('🏛️  Checking venues-metadata.json...')
  const venueIssues = validateVenueNormalization()
  allIssues.push(...venueIssues)
  if (venueIssues.length === 0) {
    console.log('   ✅ No issues found\n')
  } else {
    console.log(`   ⚠️  Found ${venueIssues.length} issue(s)\n`)
  }

  // Validate venueNormalized field in concerts.json
  console.log('🎪 Checking venueNormalized field in concerts.json...')
  const venueNormalizedIssues = validateVenueNormalized()
  allIssues.push(...venueNormalizedIssues)
  if (venueNormalizedIssues.length === 0) {
    console.log('   ✅ No issues found\n')
  } else {
    console.log(`   ⚠️  Found ${venueNormalizedIssues.length} issue(s)\n`)
  }

  // Validate genreNormalized field in concerts.json
  console.log('🎵 Checking genreNormalized field in concerts.json...')
  const genreIssues = validateGenreNormalization()
  allIssues.push(...genreIssues)
  if (genreIssues.length === 0) {
    console.log('   ✅ No issues found\n')
  } else {
    console.log(`   ⚠️  Found ${genreIssues.length} issue(s)\n`)
  }

  // Print detailed issues
  if (allIssues.length > 0) {
    console.log('=' .repeat(60))
    console.log('⚠️  VALIDATION ISSUES FOUND')
    console.log('=' .repeat(60))
    console.log()

    const errors = allIssues.filter((i) => i.severity === 'error')
    const warnings = allIssues.filter((i) => i.severity === 'warning')

    if (errors.length > 0) {
      console.log(`❌ Errors (${errors.length}):`)
      errors.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. [${issue.type.toUpperCase()}] ${issue.message}`)
        if (issue.details) {
          console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`)
        }
      })
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${warnings.length}):`)
      warnings.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. [${issue.type.toUpperCase()}] ${issue.message}`)
        if (issue.details) {
          console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`)
        }
      })
    }

    console.log('\n' + '=' .repeat(60))
    console.log('💡 SUGGESTED FIXES')
    console.log('=' .repeat(60))
    console.log('\nFor duplicate artists:')
    console.log('  npm run deduplicate-artists')
    console.log('\nFor normalization mismatches:')
    console.log('  npm run fetch-sheet   # Regenerate concerts.json')
    console.log('  npm run enrich        # Regenerate artist metadata')

    console.log()
    process.exit(1)
  }

  // All good!
  console.log('=' .repeat(60))
  console.log('✅ ALL VALIDATION CHECKS PASSED')
  console.log('=' .repeat(60))
  console.log()
  console.log('✨ Data normalization is consistent across all files!')
  console.log()
  process.exit(0)
}

main()
