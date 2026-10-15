/**
 * useShareLink — standard sharing & clipboard hook
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { analytics } from '../services/analytics'
import { haptics } from '../utils/haptics'

const CONFIRM_MS = 1500

export type ShareStatus = 'idle' | 'shared' | 'copied' | 'error'

interface UseShareLinkOptions {
  url: string
  title: string
  text?: string
  isPhone?: boolean
  analyticsEvent?: { name: string; params?: Record<string, unknown> }
}

interface UseShareLink {
  share: () => Promise<void>
  status: ShareStatus
}

export async function writeToClipboard(url: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      return true
    }
    throw new Error('clipboard unavailable')
  } catch {
    try {
      if (typeof document === 'undefined') return false
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textArea)
      return ok
    } catch {
      return false
    }
  }
}

export function useShareLink({
  url,
  title,
  text,
  isPhone = false,
  analyticsEvent,
}: UseShareLinkOptions): UseShareLink {
  const [status, setStatus] = useState<ShareStatus>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const flash = useCallback((next: ShareStatus) => {
    setStatus(next)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus('idle'), CONFIRM_MS)
  }, [])

  const share = useCallback(async () => {
    haptics.light()

    const track = (method: 'share_sheet' | 'clipboard', succeeded: boolean) => {
      if (!analyticsEvent) return
      analytics.trackEvent(analyticsEvent.name, {
        ...analyticsEvent.params,
        method,
        succeeded,
        device_type: isPhone ? 'mobile' : 'desktop',
      })
    }

    if (isPhone && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        track('share_sheet', true)
        setStatus('shared')
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle')
          return
        }
      }
    }

    const ok = await writeToClipboard(url)
    track('clipboard', ok)
    flash(ok ? 'copied' : 'error')
  }, [url, title, text, isPhone, analyticsEvent, flash])

  return { share, status }
}
