import { getGenreColor } from '../../../constants/colors'
import { ArtistPlaceholder } from './ArtistPlaceholder'

interface ArtistCardFrontProps {
  artistName: string
  albumCover?: string
  genre: string
}

/**
 * Front of the artist card - displays album cover or placeholder
 * Uniform size: 240px
 */
export function ArtistCardFront({
  artistName,
  albumCover,
  genre
}: ArtistCardFrontProps) {
  const genreColor = getGenreColor(genre)

  // Uniform size: 200px (will expand to 480px 2×2 grid when flipped)
  const dimension = 'w-[200px] h-[200px]'

  return (
    <div
      className={`${dimension} relative overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]`}
      style={{
        border: `2px solid ${genreColor}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {albumCover ? (
        <img
          src={albumCover}
          alt={`${artistName} album cover`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <ArtistPlaceholder artistName={artistName} genre={genre} />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
    </div>
  )
}
