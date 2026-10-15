import { useState, useEffect } from 'react'

interface GatefoldOrientation {
  isPhone: boolean
  dimensions: { width: number; height: number }
  safeAreas: { top: number; bottom: number; left: number; right: number }
}

/**
 * Hook to detect viewport orientation and dimensions for gatefold layout
 * Returns phone detection (<768px), viewport dimensions, and safe area insets
 */
export function useGatefoldOrientation(): GatefoldOrientation {
  const [state, setState] = useState<GatefoldOrientation>({
    isPhone: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    dimensions: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    },
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0 },
  })

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Read CSS env variables for safe areas (iOS notch, home indicator, etc.)
      const style = getComputedStyle(document.documentElement)

      const parseSafeArea = (envVar: string): number => {
        const value = style.getPropertyValue(envVar)
        const parsed = parseInt(value || '0', 10)
        return isNaN(parsed) ? 0 : parsed
      }

      const safeAreas = {
        top: parseSafeArea('safe-area-inset-top'),
        bottom: parseSafeArea('safe-area-inset-bottom'),
        left: parseSafeArea('safe-area-inset-left'),
        right: parseSafeArea('safe-area-inset-right'),
      }

      setState({
        isPhone: width < 768,
        dimensions: { width, height },
        safeAreas,
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
