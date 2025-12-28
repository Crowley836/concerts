import { useEffect, useState } from 'react'
import type { ConcertData } from './types/concert'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">
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
            <span>{data.metadata.totalConcerts} Shows</span>
            <span>·</span>
            <span>{data.metadata.uniqueArtists} Artists</span>
            <span>·</span>
            <span>{data.metadata.uniqueVenues} Venues</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-display uppercase tracking-wide text-gray-300 mb-4">
            Recent Concerts
          </h2>
        </div>

        {/* Concert Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.concerts.map((concert) => (
            <div
              key={concert.id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display uppercase text-white mb-1">
                      {concert.headliner}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-mono uppercase bg-purple-500/20 text-purple-300 rounded">
                      {concert.genre}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <p className="font-mono">
                    {new Date(concert.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p>{concert.venue}</p>
                  <p>{concert.cityState}</p>

                  {concert.openers.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-gray-800">
                      <p className="text-xs font-mono uppercase text-gray-500 mb-1">
                        Also on the bill:
                      </p>
                      <p className="text-gray-300">
                        {concert.openers.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
