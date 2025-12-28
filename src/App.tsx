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
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Minimal Header - 60px */}
      <header className="h-[60px] border-b border-gray-800 bg-gray-950 flex items-center px-6 shrink-0">
        <h1 className="text-xl font-display uppercase tracking-wider text-purple-400">
          Morperhaus
        </h1>
        <div className="ml-4 flex gap-3 text-sm text-gray-500 font-mono">
          <span>{stats.filtered}</span>
          <span>·</span>
          <span>{stats.artists}</span>
          <span>·</span>
          <span>{stats.venues}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search concerts..."
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm focus:outline-none focus:border-indigo-500 w-64"
          />
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors">
            📊 Story
          </button>
        </div>
      </header>

      {/* Collapsible Filter Chips */}
      <div className="px-6 py-2 border-b border-gray-800 bg-gray-950/50 shrink-0">
        <FilterBar
          uniqueArtists={uniqueArtists}
          uniqueGenres={uniqueGenres}
          uniqueVenues={uniqueVenues}
          uniqueCities={uniqueCities}
          yearRange={yearRange}
          filteredCount={stats.filtered}
          totalCount={stats.total}
        />
      </div>

      {/* Main Dashboard - Three Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Stats - 250px */}
        <aside className="w-[250px] border-r border-gray-800 bg-gray-950 p-4 overflow-y-auto shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-3">Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Shows</span>
                  <span className="font-semibold text-white">{stats.filtered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Artists</span>
                  <span className="font-semibold text-white">{stats.artists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Venues</span>
                  <span className="font-semibold text-white">{stats.venues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cities</span>
                  <span className="font-semibold text-white">{stats.cities}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-3">Top Artists</h3>
              <div className="space-y-2">
                {uniqueArtists.slice(0, 5).map((artist) => {
                  const count = filteredConcerts.filter(c => c.headliner === artist).length
                  return (
                    <div key={artist} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 truncate">{artist}</span>
                        <span className="text-gray-500">{count}x</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${(count / filteredConcerts.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-3">Genre Mix</h3>
              <div className="space-y-2">
                {uniqueGenres.slice(0, 4).map((genre) => {
                  const count = filteredConcerts.filter(c => c.genre === genre).length
                  const percentage = ((count / filteredConcerts.length) * 100).toFixed(0)
                  return (
                    <div key={genre} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{genre}</span>
                        <span className="text-gray-500">{percentage}%</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Concert List */}
        <div className="flex-1 overflow-y-auto bg-black">
          <TimelineContainer concerts={filteredConcerts} onMapFocus={focusOnConcert} />
        </div>

        {/* Right Sidebar: Map - 400px */}
        <aside className="w-[400px] border-l border-gray-800 bg-gray-950 shrink-0">
          <MapContainer
            concerts={filteredConcerts}
            focusedConcert={focusedConcert}
            onMarkerClick={focusOnConcert}
          />
        </aside>
      </main>
    </div>
  )
}

export default App
