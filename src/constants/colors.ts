// Genre Colors - Concert Poster Palette
// Deep jewel tones at 35-45% lightness, 65-80% saturation
// Source: docs/design/Morperhaus-Color-Specification-Guide.md

export const GENRE_COLORS: Record<string, string> = {
  'New Wave': '#1e40af',        // Deep navy blue (synth, 80s)
  'Punk': '#991b1b',            // Dried blood red (raw, aggressive)
  'Alternative': '#5b21b6',     // Deep violet (moody, introspective)
  'Ska': '#f59e0b',             // Bright amber (brass, sunshine) - CHANGED for visibility
  'Indie Rock': '#0ea5e9',      // Sky blue (melodic, expansive) - CHANGED from royal blue
  'Electronic': '#06b6d4',      // Bright cyan (synthetic, club lights) - CHANGED for differentiation
  'Pop Rock': '#dc2626',        // Bright red (warm, accessible) - CHANGED from burnt sienna
  'Pop Punk': '#ec4899',        // Hot pink (youthful, loud) - CHANGED to brighter magenta
  'Classic Rock': '#92400e',    // Dark brown leather (vintage, worn) - CHANGED for differentiation
  'Jazz': '#4338ca',            // Rich indigo (smoky, sophisticated) - CHANGED from midnight
  'Reggae': '#16a34a',          // Vibrant green (roots, earth) - CHANGED to brighter green

  // Expanded Metal & Rock Palette (Vibrant)
  'Metal': '#64748b',           // Slate (generic metal)
  'Thrash Metal': '#ef4444',    // Bright Red (aggressive)
  'Death Metal': '#b91c1c',     // Blood Red (intense)
  'Black Metal': '#1f2937',     // Dark Grey (grim)
  'Heavy Metal': '#9333ea',     // Electric Purple (classic)
  'Nu Metal': '#84cc16',        // Lime Green (toxic/modern)
  'Industrial Metal': '#f97316',// Bright Orange (mechanical)
  'Doom Metal': '#4c1d95',      // Deep Purple (slow/heavy)
  'Groove Metal': '#d97706',    // Amber (rhythmic)
  'Progressive Metal': '#06b6d4', // Cyan (technical)
  'Sludge Metal': '#78350f',    // Deep Brown (murky)
  'Metalcore': '#db2777',       // Pink (modern aggressive)
  'Grindcore': '#be123c',       // Dark Rose (fast/violent)
  'Stoner Metal': '#15803d',    // Green (hazy)

  'Hard Rock': '#e11d48',       // Rose Red (energetic)
  'Rock': '#2563eb',            // Royal Blue (classic)
  'Blues Rock': '#1d4ed8',      // Blue (bluesy)

  'Hip Hop': '#ea580c',         // Bright orange (street, bold)
  'R&B/Soul': '#7c3aed',        // Electric purple (smooth, rich)
  'Folk/Country': '#a16207',    // Golden brown (acoustic, earthy)
  'Funk': '#ca8a04',            // Yellow Gold (groove)
  'Blues': '#1e3a8a',           // Deep blue (soulful, late night) - SWAPPED with New Wave
  'World': '#14b8a6',           // Bright teal (global, oceanic) - CHANGED to more vibrant
  'Experimental': '#d8b4fe',    // Lavender (weird)
  'Post Punk': '#be123c',       // Deep rose red (dark, angular) - NEW
  'Rockabilly': '#78350f',      // Dark tobacco brown (vintage, retro) - NEW
  'Other': '#6b7280',           // Medium gray (neutral bucket) - CHANGED for better visibility
} as const

export const BACKGROUNDS = {
  light1: '#ffffff',
  light2: '#f3f4f6',
  light3: '#fafaf9',
  light4: '#fef3c7',
  light5: '#ede9fe',
  dark1: '#111827',
  dark2: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 100%)',
  dark3: '#0c0a09',
  dark4: '#1e1b4b',
  dark5: '#172554',
} as const

export const DEFAULT_GENRE_COLOR = '#4b5563'

export function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] || DEFAULT_GENRE_COLOR
}
