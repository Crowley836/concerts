import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimelineHoverContent } from './TimelineHoverContent'
import { useArtistMetadata } from './useArtistMetadata'
import { ANIMATION, LAYOUT, BREAKPOINTS } from './constants'
import type { TimelineHoverPreviewProps } from './types'

/**
 * Main Timeline Hover Preview Component
 *
 * Displays a preview popup when hovering over timeline dots.
 * Handles positioning, animations, and responsive behavior.
 *
 * @param props - Component props
 * @returns React component
 */
export function TimelineHoverPreview({
  hoverState,
  onMouseEnter,
  onMouseLeave,
}: TimelineHoverPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { getArtistImage } = useArtistMetadata()

  // Check if viewport is mobile (disable on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.MOBILE_MAX

  /**
   * Update visibility based on hover state
   */
  useEffect(() => {
    if (hoverState && !isMobile) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [hoverState, isMobile])

  /**
   * Track mouse position for parallax effect
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  /**
   * Calculate popup position to keep it within viewport bounds
   */
  const calculatePosition = useCallback(() => {
    if (!hoverState) return { x: 0, y: 0 }

    const { x, y } = hoverState.position
    let popupX = x - LAYOUT.WIDTH / 2
    let popupY = y + LAYOUT.OFFSET_Y - LAYOUT.HEIGHT

    // Keep within horizontal bounds
    const maxX = window.innerWidth - LAYOUT.WIDTH - LAYOUT.EDGE_MARGIN
    popupX = Math.max(LAYOUT.EDGE_MARGIN, Math.min(popupX, maxX))

    // Keep within vertical bounds (prefer above, but flip below if needed)
    if (popupY < LAYOUT.EDGE_MARGIN) {
      // Flip to below the dot
      popupY = y - LAYOUT.OFFSET_Y + 40
    }

    return { x: popupX, y: popupY }
  }, [hoverState])

  const position = calculatePosition()

  if (!hoverState || isMobile) {
    return null
  }

  const imageUrl = getArtistImage(hoverState.artistName)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            duration: ANIMATION.FADE_DURATION / 1000,
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: LAYOUT.WIDTH,
            height: LAYOUT.HEIGHT,
            pointerEvents: 'auto',
            zIndex: 100,
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <TimelineHoverContent
            artistName={hoverState.artistName}
            year={hoverState.year}
            concertCount={hoverState.concertCount}
            imageUrl={imageUrl}
            mousePosition={mousePosition}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
