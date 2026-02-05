import { getGenreColor } from '../../../constants/colors'

interface ArtistPlaceholderProps {
  artistName: string
  genre: string
}

export function ArtistPlaceholder({ artistName, genre }: ArtistPlaceholderProps) {
  const genreColor = getGenreColor(genre)

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
      {/* Skull Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="relative z-10 w-24 h-24 opacity-80"
        aria-hidden="true"
      >
        <path d="M12 2C7.58 2 4 5.58 4 10c0 2.05.8 3.91 2.11 5.3.36 1.76 1.13 3.39 2.14 4.85.5.73 1.25 1.15 2.08 1.15h.33c.48 0 .88-.35.98-.82.16-.76.36-1.5.58-2.22.42-1.38.68-2.82.78-4.26h2c.1 1.44.36 2.88.78 4.26.22.72.42 1.46.58 2.22.1.47.5.82.98.82h.33c.83 0 1.58-.42 2.08-1.15 1.01-1.46 1.78-3.09 2.14-4.85C20 13.91 20.8 12.05 20.8 10c0-4.42-3.58-8-8-8zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10zM9.5 15c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h5c.28 0 .5.22.5.5s-.22.5-.5.5h-5z" />
      </svg>
    </div>
  )
}
