import { useEffect, useState } from 'react'
import type { ConcertData } from './types/concert'
import { useConcertData } from './hooks/useConcertData'
import { useMapSync } from './hooks/useMapSync'
import { FilterBar } from './components/filters/FilterBar'
import { TimelineContainer } from './components/timeline/TimelineContainer'
import { MapContainer } from './components/map/MapContainer'

function App() {
  const [data, setData] = useState<ConcertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    fetch('/data/concerts.json')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load concert data:', err)
        setLoading(false)
      })
  }, [])

  const {
    filteredConcerts,
    uniqueArtists,
    uniqueGenres,
    uniqueVenues,
    uniqueCities,
    yearRange,
    stats,
  } = useConcertData(data)

  const { focusedConcert, focusOnConcert } = useMapSync()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Vinyl record spinning effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gray-950"></div>
            <div className="absolute inset-8 rounded-full bg-purple-500/20"></div>
            <div className="absolute inset-10 rounded-full bg-gray-950"></div>
          </div>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-wider animate-pulse">
            Loading your concert history...
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl font-semibold mb-2">Failed to load concert data</p>
          <p className="text-gray-500">Please check the console for errors</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-display uppercase tracking-wider text-purple-400">
            Morperhaus
          </h1>
          <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mt-1">
            Concert Archives
          </p>
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>{stats.filtered} Shows</span>
            <span>·</span>
            <span>{stats.artists} Artists</span>
            <span>·</span>
            <span>{stats.venues} Venues</span>
            <span>·</span>
            <span>{stats.cities} Cities</span>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        uniqueArtists={uniqueArtists}
        uniqueGenres={uniqueGenres}
        uniqueVenues={uniqueVenues}
        uniqueCities={uniqueCities}
        yearRange={yearRange}
        filteredCount={stats.filtered}
        totalCount={stats.total}
      />

      {/* Main Content - Desktop: Split Layout, Mobile: Toggle */}
      <main className="relative">
        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-[1fr,500px] lg:gap-6 container mx-auto px-4 py-8">
          {/* Timeline */}
          <div className="overflow-y-auto">
            <TimelineContainer concerts={filteredConcerts} onMapFocus={focusOnConcert} />
          </div>

          {/* Map - Sticky */}
          <div className="sticky top-[320px] h-[calc(100vh-340px)]">
            <MapContainer
              concerts={filteredConcerts}
              focusedConcert={focusedConcert}
              onMarkerClick={focusOnConcert}
            />
          </div>
        </div>

        {/* Mobile: Timeline with floating map button */}
        <div className="lg:hidden container mx-auto px-4 py-8">
          <TimelineContainer concerts={filteredConcerts} onMapFocus={focusOnConcert} />

          {/* Floating Map Toggle Button */}
          <button
            onClick={() => setShowMap(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="font-medium">Map</span>
          </button>

          {/* Full-screen Map Overlay for Mobile */}
          {showMap && (
            <div className="fixed inset-0 z-50 bg-gray-950">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
                  <h2 className="text-lg font-display uppercase text-purple-400">Concert Map</h2>
                  <button
                    onClick={() => setShowMap(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Map */}
                <div className="flex-1">
                  <MapContainer
                    concerts={filteredConcerts}
                    focusedConcert={focusedConcert}
                    onMarkerClick={focusOnConcert}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>Built with love for live music 🎸</p>
      </footer>
    </div>
  )
}

export default App
