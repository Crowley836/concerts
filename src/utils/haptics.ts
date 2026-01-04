/**
 * Haptic Feedback Utility (v1.6.1)
 *
 * Provides tactile feedback using the Web Vibration API.
 * Conservative pattern: primarily light haptics for responsiveness without battery drain.
 *
 * Browser Support:
 * - Chrome/Edge for Android: Full support
 * - Safari iOS: Full support (iOS 13+)
 * - Firefox Android: Full support
 * - Desktop browsers: Gracefully degrades (no-op)
 *
 * Usage:
 * ```typescript
 * import { haptics } from '@/utils/haptics'
 *
 * // On button tap
 * haptics.light()
 *
 * // On successful async operation
 * haptics.success()
 * ```
 */

/**
 * Check if vibration API is supported
 */
const isSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Haptic feedback patterns
 */
export const haptics = {
  /**
   * Light haptic (10ms)
   * Use for: Most tap interactions, navigation dots, timeline dots, genre segments
   */
  light: (): void => {
    if (isSupported()) {
      navigator.vibrate(10)
    }
  },

  /**
   * Medium haptic (20ms)
   * Use for: Major actions like opening gatefold, expanding venues
   */
  medium: (): void => {
    if (isSupported()) {
      navigator.vibrate(20)
    }
  },

  /**
   * Heavy haptic (50ms)
   * Use for: Drill-down actions, major state changes
   * Note: Use sparingly to conserve battery
   */
  heavy: (): void => {
    if (isSupported()) {
      navigator.vibrate(50)
    }
  },

  /**
   * Success pattern (10ms, pause 50ms, 10ms)
   * Use for: Successful async operations like setlist loaded
   */
  success: (): void => {
    if (isSupported()) {
      navigator.vibrate([10, 50, 10])
    }
  },

  /**
   * Error pattern (50ms, pause 100ms, 50ms)
   * Use for: API errors, validation failures
   */
  error: (): void => {
    if (isSupported()) {
      navigator.vibrate([50, 100, 50])
    }
  },
}

/**
 * Cancel any ongoing vibration
 * Useful if user navigates away during a long vibration pattern
 */
export const cancelHaptics = (): void => {
  if (isSupported()) {
    navigator.vibrate(0)
  }
}
