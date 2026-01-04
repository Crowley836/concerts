/**
 * ChangelogToast Component
 *
 * Bottom-center toast notification for new features
 * Auto-dismisses after 10 seconds with progress bar
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { ChangelogToastProps } from './types'
import { TOAST } from './constants'

export function ChangelogToast({
  isVisible,
  newFeatureCount,
  onDismiss,
  onNavigate,
}: ChangelogToastProps) {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(100)

  // Auto-dismiss timer and progress bar
  useEffect(() => {
    if (!isVisible) {
      setProgress(100) // Reset progress when hidden
      return
    }

    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
      onDismiss()
    }, TOAST.AUTO_DISMISS_DURATION)

    // Progress bar countdown
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / TOAST.AUTO_DISMISS_DURATION) * 100)
      setProgress(remaining)
    }, 50) // Update every 50ms for smooth animation

    return () => {
      clearTimeout(dismissTimer)
      clearInterval(progressInterval)
    }
  }, [isVisible, onDismiss])

  // Handle ESC key
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, onDismiss])

  // Handle navigation
  const handleNavigate = () => {
    onNavigate()
    navigate('/liner-notes')
  }

  // Handle click anywhere on toast to navigate
  const handleToastClick = () => {
    handleNavigate()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: 0.5,
          }}
          className="fixed z-[9999] cursor-pointer"
          style={{
            bottom: `${TOAST.BOTTOM_OFFSET}px`,
            right: `${TOAST.RIGHT_OFFSET}px`,
            width: `min(${TOAST.WIDTH}px, calc(100vw - 48px))`,
          }}
          onClick={handleToastClick}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className="rounded-lg p-4 backdrop-blur-sm"
            style={{
              backgroundColor: TOAST.BG_COLOR,
              borderWidth: '2px',
              borderColor: TOAST.BORDER_COLOR,
            }}
          >
            {/* Content */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎵</span>
                <span className="text-sm font-semibold text-white">
                  {newFeatureCount} new feature{newFeatureCount !== 1 ? 's' : ''} added!
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation() // Prevent toast click
                  onDismiss()
                }}
                className="text-slate-400 hover:text-white transition-colors text-xl leading-none -mt-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Latest additions to the Morperhaus concert archives
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent double navigation
                handleNavigate()
              }}
              className="w-full py-2 rounded-lg text-sm font-medium transition-colors min-h-[36px]"
              style={{
                backgroundColor: TOAST.BUTTON_BG,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = TOAST.BUTTON_HOVER
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = TOAST.BUTTON_BG
              }}
              aria-label="View new features in changelog"
            >
              See What's Playing →
            </button>

            {/* Progress bar */}
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  backgroundColor: '#f59e0b', // amber-500
                  width: `${progress}%`,
                }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
