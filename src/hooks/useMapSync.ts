import { useState, useCallback } from 'react'
import type { Concert } from '@/types/concert'

export function useMapSync() {
  const [focusedConcert, setFocusedConcert] = useState<Concert | null>(null)

  const focusOnConcert = useCallback((concert: Concert) => {
    setFocusedConcert(concert)
  }, [])

  const clearFocus = useCallback(() => {
    setFocusedConcert(null)
  }, [])

  return {
    focusedConcert,
    focusOnConcert,
    clearFocus,
  }
}
