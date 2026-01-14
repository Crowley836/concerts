// Genre Colors - Concert Poster Palette
// Deep jewel tones at 35-45% lightness, 65-80% saturation
// Source: docs/design/Color-Specification-Guide.md

export const GENRE_COLORS: Record<string, string> = {
  // Vibrant, Modern Base
  'Indie Rock': '#06b6d4',      // Cyan-500 (Electric Cyan)
  'Alternative': '#8b5cf6',     // Violet-500 (Vibrant Purple)
  'Rock': '#3b82f6',            // Blue-500 (Royal Blue)
  'Pop': '#f43f5e',             // Rose-500 (Coral Red)
  'Pop Rock': '#f43f5e',        // Rose-500 (Coral Red)
  'Electronic': '#10b981',      // Emerald-500 (Neon Green) - Distinct from Cyan
  'Hip Hop': '#f97316',         // Orange-500 (Bright Orange)
  'Folk/Country': '#eab308',    // Yellow-500 (Goldenrod) - Readable Gold
  'Jazz': '#6366f1',            // Indigo-500 (Periwinkle)
  'Metal': '#94a3b8',           // Slate-400 (Cool Grey) - Modern Neutral

  // Specific Subgenres
  'New Wave': '#0ea5e9',        // Sky-500
  'Punk': '#dc2626',            // Red-600 (Aggressive Red)
  'Post Punk': '#be123c',       // Rose-700 (Deep Pink)
  'Classic Rock': '#d97706',    // Amber-600 (Bronze)
  'Blues': '#2563eb',           // Blue-600
  'Reggae': '#22c55e',          // Green-500
  'Ska': '#f59e0b',             // Amber-500
  'Funk': '#8b5cf6',            // Violet-500 (Funky Purple)
  'R&B/Soul': '#a855f7',        // Purple-500
  'Experimental': '#d8b4fe',    // Lavender
  'Other': '#64748b',           // Slate-500 (Balanced Grey)
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
