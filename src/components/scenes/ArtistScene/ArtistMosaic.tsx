import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArtistCard } from './ArtistCard'
import { sortArtistCards } from './useArtistData'
import type { ArtistCard as ArtistCardType, SortOrder } from './types'

interface ArtistMosaicProps {
  artists: ArtistCardType[]
  sortOrder: SortOrder
  showFrequencyBadge: boolean // Show badge when Weighted sort is active
  onArtistCountUpdate?: (count: number) => void
}

const INITIAL_LOAD = 100
const BATCH_SIZE = 50

/**
 * Responsive mosaic grid with lazy loading
 */
export function ArtistMosaic({
  artists,
  sortOrder,
  showFrequencyBadge,
  onArtistCountUpdate
}: ArtistMosaicProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cardsPerRow, setCardsPerRow] = useState(6) // Default to 6 cards per row

  // Calculate cards per row based on viewport width
  useEffect(() => {
    const calculateCardsPerRow = () => {
      const cardWidth = 200 // Card size in pixels
      const viewportWidth = window.innerWidth
      const calculatedCards = Math.floor(viewportWidth / cardWidth)
      setCardsPerRow(Math.max(1, Math.min(calculatedCards, 6))) // Min 1, max 6
    }

    calculateCardsPerRow()
    window.addEventListener('resize', calculateCardsPerRow)
    return () => window.removeEventListener('resize', calculateCardsPerRow)
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Report artist count to parent
  useEffect(() => {
    onArtistCountUpdate?.(artists.length)
  }, [artists.length, onArtistCountUpdate])

  // Sort artists (all uniform size now)
  const processedArtists = useMemo(() => {
    return sortArtistCards(artists, sortOrder)
  }, [artists, sortOrder])

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current) return
    if (visibleCount >= processedArtists.length) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, processedArtists.length))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [visibleCount, processedArtists.length])

  // Close active card on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCardId) {
        setActiveCardId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeCardId])

  // Reset visible count when sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD)
    setActiveCardId(null)
  }, [sortOrder])

  const visibleArtists = processedArtists.slice(0, visibleCount)
  const hasMore = visibleCount < processedArtists.length

  const handleCardFlip = (artistId: string) => {
    setActiveCardId(prev => (prev === artistId ? null : artistId))
  }

  return (
    <div className="w-full h-full overflow-y-auto pt-48 pb-32">
      {/* Flexbox Container - Centered horizontally, NO GAPS */}
      <motion.div
        layout={!reducedMotion}
        className="w-full flex flex-wrap justify-center"
        style={{
          gap: 0,
          margin: 0
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleArtists.map((artist, index) => (
            <motion.div
              key={artist.normalizedName}
              layout={!reducedMotion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: reducedMotion ? 0 : 0.2,
                delay: reducedMotion ? 0 : Math.min(index * 0.03, 1)
              }}
              className="relative flex-shrink-0"
              style={{
                zIndex: activeCardId === artist.normalizedName ? 100 : 1
              }}
            >
              {/* Frequency Badge (TOS-compliant: outside album art) */}
              {showFrequencyBadge && artist.timesSeen > 1 && (
                <div className="absolute -top-2 -right-2 z-10 bg-violet-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  ×{artist.timesSeen}
                </div>
              )}
              <ArtistCard
                artist={artist}
                isFlipped={activeCardId === artist.normalizedName}
                onFlip={() => handleCardFlip(artist.normalizedName)}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Loading Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </div>
      )}

      {/* End of List Message */}
      {!hasMore && visibleArtists.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-sm mt-12 mb-8"
        >
          {processedArtists.length} artists loaded
        </motion.div>
      )}
    </div>
  )
}
