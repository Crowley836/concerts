/**
 * LinerNotesPanel - Displays concert setlist from setlist.fm
 * Slides in from the right to cover the Spotify panel
 * Size: 380×380px (10px margin inside 400×400px panel)
 */

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import type { Setlist } from '../../../types/setlist'
import type { ArtistConcert } from './types'

interface LinerNotesPanelProps {
  concert: ArtistConcert
  artistName: string
  setlist: Setlist | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

/**
 * Main liner notes panel component
 */
export function LinerNotesPanel({
  concert,
  artistName,
  setlist,
  isLoading,
  error,
  onClose
}: LinerNotesPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus close button when panel opens (accessibility)
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="absolute top-0 right-0 w-[400px] h-[400px] liner-notes-panel"
      style={{
        zIndex: 25 // Above Spotify panel (20) but below cover (30)
      }}
      role="dialog"
      aria-modal="false"
      aria-label={`Setlist for ${artistName} on ${format(new Date(concert.date), 'MMMM d, yyyy')}`}
    >
      <div
        className="w-full h-full p-[10px]"
        style={{
          background: 'rgba(24, 24, 24, 0.98)',
          borderRadius: '4px',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="w-[380px] h-[380px] flex flex-col">
          {/* Close Button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-[26px] right-[26px] w-6 h-6 flex items-center justify-center text-white hover:text-[#1DB954] transition-all duration-150 hover:scale-110"
            aria-label="Close setlist"
            style={{ zIndex: 30 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="flex-shrink-0 pt-8 px-8 pb-5">
            <h2 className="font-serif text-[1.75rem] font-medium text-white tracking-tight leading-tight mb-2">
              {artistName}
            </h2>
            <p className="font-sans text-[1.125rem] text-[#e5e5e5] mb-1">
              {concert.venue}
            </p>
            <p className="font-sans text-[0.875rem] text-[#a3a3a3]">
              {concert.city} · {format(new Date(concert.date), 'dd MMM yyyy')}
            </p>
          </div>

          {/* Divider */}
          <div
            className="flex-shrink-0 mx-8 mb-6"
            style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)'
            }}
          />

          {/* Content Area - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8 liner-notes-scrollbar">
            {isLoading && <LoadingState />}
            {error && <ErrorState error={error} />}
            {!isLoading && !error && !setlist && <NotFoundState />}
            {!isLoading && !error && setlist && <SetlistContent setlist={setlist} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading state with skeleton animation
 */
function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Skeleton bars */}
      {[1, 2, 3, 4, 5].map((idx) => (
        <div key={idx} className="space-y-2">
          <div
            className="h-3 rounded animate-pulse"
            style={{
              background: '#2a2a2a',
              width: `${60 + Math.random() * 30}%`
            }}
          />
          <div
            className="h-2.5 rounded animate-pulse"
            style={{
              background: '#2a2a2a',
              width: `${40 + Math.random() * 20}%`
            }}
          />
        </div>
      ))}

      <p className="font-sans text-xs text-[#737373] text-center pt-4">
        Loading setlist...
      </p>
    </div>
  )
}

/**
 * Error state
 */
function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="font-sans text-base text-[#e5e5e5] mb-2">
        Unable to load setlist
      </p>
      <p className="font-sans text-sm text-[#737373] max-w-[280px]">
        {error || 'Check your connection and try again.'}
      </p>
    </div>
  )
}

/**
 * Not found state
 */
function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="text-4xl mb-4">📋</div>
      <p className="font-sans text-base text-[#e5e5e5] mb-2">
        No setlist available
      </p>
      <p className="font-sans text-sm text-[#737373] mb-1">
        for this concert
      </p>
      <p className="font-sans text-xs text-[#737373] max-w-[280px] mt-4 leading-relaxed">
        Setlists are community-contributed and may not exist for all shows.
      </p>
    </div>
  )
}

/**
 * Setlist content display
 */
function SetlistContent({ setlist }: { setlist: Setlist }) {
  // Show tour info if available
  const showTourInfo = setlist.tour && setlist.tour.name

  // Count total songs
  let totalSongs = 0
  if (setlist.sets && setlist.sets.set) {
    for (const set of setlist.sets.set) {
      totalSongs += set.song.length
    }
  }

  return (
    <div className="space-y-5">
      {/* Tour Info (if available) */}
      {showTourInfo && (
        <div className="pb-2">
          <p className="font-sans text-xs text-[#737373]">
            Tour: {setlist.tour!.name}
          </p>
        </div>
      )}

      {/* Show Notes (if available) */}
      {setlist.info && (
        <div className="pb-2">
          <p className="font-sans text-sm text-[#a3a3a3] italic leading-relaxed">
            "{setlist.info}"
          </p>
        </div>
      )}

      {/* Sets */}
      {setlist.sets && setlist.sets.set && setlist.sets.set.length > 0 ? (
        setlist.sets.set.map((set, setIdx) => {
          // Determine set name
          let setName = 'SET'
          if (set.encore) {
            setName = set.encore === 1 ? 'ENCORE' : `ENCORE ${set.encore}`
          } else if (set.name) {
            setName = set.name.toUpperCase()
          } else if (setlist.sets.set.length > 1 && !set.encore) {
            setName = `SET ${setIdx + 1}`
          }

          return (
            <div key={setIdx} className="space-y-3">
              {/* Set Header */}
              <h3 className="font-sans text-[0.75rem] font-semibold text-[#1DB954] uppercase tracking-wider">
                {setName}
              </h3>

              {/* Song List */}
              <ol className="space-y-1.5">
                {set.song.map((song, songIdx) => (
                  <li
                    key={songIdx}
                    className="flex items-baseline gap-3 font-sans text-[0.9375rem] text-[#e5e5e5]"
                  >
                    <span className="font-sans text-[0.875rem] font-medium text-[#737373] min-w-[20px] tabular-nums">
                      {songIdx + 1}.
                    </span>
                    <span className="flex-1">
                      {song.name}
                      {song.cover && (
                        <span className="text-[#737373] text-[0.8125rem] ml-2">
                          ({song.cover.name} cover)
                        </span>
                      )}
                      {song.with && (
                        <span className="text-[#737373] text-[0.8125rem] ml-2">
                          (with {song.with.name})
                        </span>
                      )}
                      {song.tape && (
                        <span className="text-[#737373] text-[0.8125rem] ml-2">
                          (tape)
                        </span>
                      )}
                      {song.info && (
                        <span className="text-[#737373] text-[0.8125rem] block ml-[32px] mt-0.5">
                          {song.info}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )
        })
      ) : (
        <p className="font-sans text-sm text-[#737373] text-center py-4">
          No songs listed for this show
        </p>
      )}

      {/* Attribution Footer */}
      <div className="pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[0.6875rem] text-[#737373]">
            via setlist.fm
          </p>
          {totalSongs > 0 && (
            <p className="font-sans text-[0.6875rem] text-[#737373]">
              {totalSongs} {totalSongs === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>
        {setlist.url && (
          <a
            href={setlist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[0.6875rem] text-[#1DB954] hover:underline inline-block mt-1"
          >
            View on setlist.fm →
          </a>
        )}
      </div>
    </div>
  )
}
