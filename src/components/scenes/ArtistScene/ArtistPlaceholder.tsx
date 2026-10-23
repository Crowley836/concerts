import { getGenreColor } from '../../../constants/colors'

interface ArtistPlaceholderProps {
  artistName: string
  genre: string
}

/**
 * Get artist initials for placeholder display
 */
function getArtistInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  // Take first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Placeholder card for artists without album art
 * Shows genre-colored background with artist initials
 * Uniform size: 240px
 */
export function ArtistPlaceholder({ artistName, genre }: ArtistPlaceholderProps) {
  const genreColor = getGenreColor(genre)
  const initials = getArtistInitials(artistName)

  // Uniform size: 200px (will expand to 480px 2×2 grid when flipped)
  const dimension = 'w-[200px] h-[200px] text-6xl'

  return (
    <div
      className={`${dimension} flex items-center justify-center font-sans font-semibold text-white/90 relative overflow-hidden`}
      style={{ backgroundColor: genreColor }}
      aria-label={`${artistName} - No album art available`}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }}
      />

      {/* Initials */}
      <span className="relative z-10 tracking-tight">{initials}</span>
    </div>
  )
}
