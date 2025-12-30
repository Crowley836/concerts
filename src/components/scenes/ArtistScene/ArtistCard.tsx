import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArtistCardFront } from './ArtistCardFront'
import { ArtistCardBack } from './ArtistCardBack'
import type { ArtistCard as ArtistCardType } from './types'

interface ArtistCardProps {
  artist: ArtistCardType
  isFlipped: boolean
  onFlip: () => void
  reducedMotion: boolean
}

/**
 * Flip card component with 3D rotation animation
 */
export function ArtistCard({ artist, isFlipped, onFlip, reducedMotion }: ArtistCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transformOrigin, setTransformOrigin] = useState('center center')

  // Calculate transform origin based on screen position when flipping
  const handleFlip = () => {
    if (!isFlipped && cardRef.current) {
      // About to flip - calculate position
      const rect = cardRef.current.getBoundingClientRect()
      const cardCenterX = rect.left + rect.width / 2
      const viewportCenterX = window.innerWidth / 2

      // Cards expand INTO the viewport (toward center)
      // Left half: anchor right, expand left (into view)
      // Right half: anchor left, expand right (into view)
      const origin = cardCenterX < viewportCenterX ? 'top right' : 'top left'

      setTransformOrigin(origin)
    } else if (isFlipped) {
      // About to unflip - reset to center
      setTransformOrigin('center center')
    }

    onFlip()
  }

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  // Animation variants
  const flipTransition = reducedMotion
    ? { duration: 0 } // Instant for reduced motion
    : {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] // cubic-bezier(0.4, 0, 0.2, 1)
      }

  return (
    <div
      ref={cardRef}
      className="relative w-[200px] h-[200px]"
      role="button"
      tabIndex={0}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      aria-label={`View ${artist.name} concert history${isFlipped ? ', currently showing details' : ''}`}
      aria-expanded={isFlipped}
      style={{
        perspective: '1000px'
      }}
    >
      {/* Animated wrapper for scale + flip */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: transformOrigin,
          zIndex: isFlipped ? 50 : 1
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: isFlipped ? 2.0 : 1, // 2 rows = 400px (2.0x scale)
          rotateY: isFlipped ? 180 : 0
        }}
        transition={{
          scale: { duration: 0.3 },
          rotateY: flipTransition
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <ArtistCardFront
            artistName={artist.name}
            albumCover={artist.albumCover}
            genre={artist.primaryGenre}
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <ArtistCardBack artist={artist} />
        </div>

        {/* Spacer to maintain layout space */}
        <div
          className="invisible pointer-events-none"
          aria-hidden="true"
        >
          <ArtistCardFront
            artistName={artist.name}
            albumCover={artist.albumCover}
            genre={artist.primaryGenre}
          />
        </div>
      </motion.div>
    </div>
  )
}
