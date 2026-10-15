/**
 * PhoneArtistModal - Mobile-native modal for Artist Scene
 * Replaces desktop 3D gatefold on phone viewports (<768px)
 *
 * Features:
 * - Full-screen modal with tabbed navigation (Concert History, Spotify Tracks)
 * - Setlist overlay slides in from right with full setlist.fm details
 * - Copy/Share link with Web Share API and clipboard fallback
 * - Spotify Top Tracks player tab optimized for mobile
 */

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { X, Link2, History, Music } from 'lucide-react'
import { useShareLink } from '../../../hooks/useShareLink'
import { artistDeepLink, absoluteUrl } from '../../../utils/deepLinks'
import { getGenreColor } from '../../../constants/colors'
import { useArtistMetadata } from '../../TimelineHoverPreview/useArtistMetadata'
import { fetchSetlist } from '../../../services/setlistfm'
import { SpotifyPanel } from './SpotifyPanel'
import { haptics } from '../../../utils/haptics'
import type { ArtistCard, ArtistConcert } from './types'
import type { Setlist } from '../../../types/setlist'

type TabId = 'history' | 'tracks'

interface PhoneArtistModalProps {
  artist: ArtistCard | null
  onClose: () => void
  reducedMotion?: boolean
}

function getArtistInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[1][0]).toUpperCase()
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export function PhoneArtistModal({
  artist,
  onClose,
}: PhoneArtistModalProps) {
  const { getArtistImage } = useArtistMetadata()

  // Animation & UI states
  const [activeTab, setActiveTab] = useState<TabId>('history')
  const [showSetlistOverlay, setShowSetlistOverlay] = useState(false)
  const [selectedConcert, setSelectedConcert] = useState<ArtistConcert | null>(null)
  const [setlistData, setSetlistData] = useState<Setlist | null>(null)
  const [isLoadingSetlist, setIsLoadingSetlist] = useState(false)
  const [setlistError, setSetlistError] = useState<string | null>(null)

  const contentRef = useRef<HTMLDivElement>(null)

  // Share link
  const artistShareUrl = artist
    ? absoluteUrl(artistDeepLink(artist.normalizedName))
    : ''
  const { share: shareArtist, status: artistShareStatus } = useShareLink({
    url: artistShareUrl,
    title: artist?.name ?? 'Artist',
    isPhone: true,
    analyticsEvent: {
      name: 'artist_share_clicked',
      params: { artist_name: artist?.name },
    },
  })

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSetlistOverlay) {
          setShowSetlistOverlay(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSetlistOverlay, onClose])

  const handleTabSwitch = (tab: TabId) => {
    haptics.light()
    setActiveTab(tab)
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }

  const handleSetlistClick = async (concert: ArtistConcert) => {
    haptics.medium()
    setSelectedConcert(concert)
    setShowSetlistOverlay(true)
    setIsLoadingSetlist(true)
    setSetlistError(null)

    try {
      const setlist = await fetchSetlist({
        artistName: artist?.name || '',
        date: concert.date,
        venueName: concert.venue,
        city: concert.city,
        concertId: concert.concertId,
      })
      setSetlistData(setlist)
    } catch {
      setSetlistError('Could not load setlist for this show.')
    } finally {
      setIsLoadingSetlist(false)
    }
  }

  const handleCloseSetlist = () => {
    haptics.light()
    setShowSetlistOverlay(false)
    setSelectedConcert(null)
    setSetlistData(null)
  }

  if (!artist) return null

  const genreColor = getGenreColor(artist.primaryGenre)
  const artistImage = getArtistImage(artist.name)

  const tabs: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'history',
      label: 'Concerts',
      icon: <History size={16} />,
      color: '#a78bfa',
    },
    {
      id: 'tracks',
      label: 'Spotify Tracks',
      icon: <Music size={16} />,
      color: '#1DB954',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0f19] text-white animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${artist.name} details`}
    >
      {/* Top Header Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-md">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
            Artist Archive
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shareArtist()}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative"
            aria-label={`Share ${artist.name}`}
            type="button"
          >
            <Link2 size={18} />
            {artistShareStatus === 'copied' && (
              <span className="absolute -bottom-6 right-0 text-[10px] bg-black/90 text-purple-300 px-2 py-0.5 rounded shadow">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={() => {
              haptics.light()
              onClose()
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Artist Profile Card */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-18 h-18 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20 shadow-lg bg-black/40">
            {artistImage ? (
              <img
                src={artistImage}
                alt={artist.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-white shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${genreColor}, ${adjustColor(genreColor, -40)})`,
                }}
              >
                {getArtistInitials(artist.name)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-2xl font-bold text-white tracking-tight truncate">
              {artist.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: genreColor }}
              />
              <span className="text-xs text-gray-300 font-medium">
                {artist.primaryGenre}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-purple-300 font-medium">
                {artist.timesSeen} {artist.timesSeen === 1 ? 'Show' : 'Shows'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-white/10 bg-slate-900/50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span style={{ color: activeTab === tab.id ? tab.color : undefined }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto relative p-4">
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3 pb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Attended Shows ({artist.concerts.length})
              </span>
            </div>

            <ul className="space-y-2">
              {artist.concerts.map((concert, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-purple-300 mb-0.5">
                      {format(new Date(concert.date + 'T00:00:00'), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {concert.venue}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {concert.city}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSetlistClick(concert)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    aria-label={`View setlist for ${concert.venue}`}
                  >
                    <Music size={13} />
                    <span>Setlist</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="h-full flex flex-col justify-center items-center py-4">
            <div className="w-full max-w-md">
              <SpotifyPanel artist={artist} />
            </div>
          </div>
        )}
      </div>

      {/* Setlist Overlay */}
      {showSetlistOverlay && selectedConcert && (
        <SetlistOverlay
          concert={selectedConcert}
          artistName={artist.name}
          setlist={setlistData}
          isLoading={isLoadingSetlist}
          error={setlistError}
          onClose={handleCloseSetlist}
        />
      )}
    </div>
  )
}

/**
 * Slide-in Setlist Overlay for Phone
 */
interface SetlistOverlayProps {
  concert: ArtistConcert
  artistName: string
  setlist: Setlist | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

function SetlistOverlay({
  concert,
  artistName,
  setlist,
  isLoading,
  error,
  onClose,
}: SetlistOverlayProps) {
  const sets = setlist?.sets?.set || []

  return (
    <div className="absolute inset-0 z-50 bg-[#0b0f19] flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0f172a]/95">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-purple-300 font-mono">
            {format(new Date(concert.date + 'T00:00:00'), 'MMMM d, yyyy')}
          </p>
          <p className="text-sm font-bold text-white truncate">
            {artistName} · {concert.venue}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
          aria-label="Back to shows"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Fetching setlist from setlist.fm...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {setlist && !isLoading && (
          <div className="space-y-4">
            {sets.map((set, setIdx) => (
              <div key={setIdx} className="space-y-2">
                {set.name && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 pt-2 border-t border-white/5">
                    {set.name}
                  </h4>
                )}
                {set.encore !== undefined && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 pt-2 border-t border-white/5">
                    Encore {set.encore > 1 ? `#${set.encore}` : ''}
                  </h4>
                )}

                <ol className="space-y-1.5">
                  {set.song.map((song, songIdx) => (
                    <li
                      key={songIdx}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start justify-between text-xs"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-gray-500 tabular-nums w-5 flex-shrink-0">
                          {songIdx + 1}.
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium text-white">{song.name}</span>
                          {song.cover && (
                            <span className="text-gray-400 block text-[11px]">
                              ({song.cover.name} cover)
                            </span>
                          )}
                          {song.info && (
                            <span className="text-gray-500 block text-[10px] italic">
                              {song.info}
                            </span>
                          )}
                        </div>
                      </div>
                      {song.tape && (
                        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                          Tape
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {setlist.info && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-gray-300 italic">
                {setlist.info}
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && (!setlist || sets.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No setlist recorded for this show.</p>
          </div>
        )}
      </div>
    </div>
  )
}
