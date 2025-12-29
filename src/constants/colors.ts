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
  'Metal': '#18181b',           // Near-black (heavy, dark) - CHANGED to true dark
  'Hip Hop': '#ea580c',         // Bright orange (street, bold) - CHANGED for visibility
  'R&B/Soul': '#7c3aed',        // Electric purple (smooth, rich) - CHANGED to violet-purple
  'Folk/Country': '#a16207',    // Golden brown (acoustic, earthy) - SWAPPED with Funk
  'Funk': '#d97706',            // Rich gold (groove, 70s) - CHANGED to brighter gold
  'Blues': '#1e3a8a',           // Deep blue (soulful, late night) - SWAPPED with New Wave
  'World': '#14b8a6',           // Bright teal (global, oceanic) - CHANGED to more vibrant
  'Experimental': '#a855f7',    // Bright purple (weird, avant-garde) - CHANGED for visibility
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
