import { motion, AnimatePresence } from 'framer-motion'
import { useFilterStore } from '@/store/useFilterStore'
import { ArtistFilter } from './ArtistFilter'
import { GenreFilter } from './GenreFilter'
import { VenueFilter } from './VenueFilter'
import { CityFilter } from './CityFilter'

interface FilterBarProps {
  uniqueArtists: string[]
  uniqueGenres: string[]
  uniqueVenues: string[]
  uniqueCities: string[]
  yearRange: [number, number]
  filteredCount: number
  totalCount: number
}

export function FilterBar({
  uniqueArtists,
  uniqueGenres,
  uniqueVenues,
  uniqueCities,
}: FilterBarProps) {
  const { hasOpenersOnly, setHasOpenersOnly, clearFilters, getActiveFilterCount } =
    useFilterStore()

  const activeFilters = getActiveFilterCount()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter chips */}
      <ArtistFilter artists={uniqueArtists} />
      <GenreFilter genres={uniqueGenres} />
      <VenueFilter venues={uniqueVenues} />
      <CityFilter cities={uniqueCities} />

      {/* Has Openers Toggle */}
      <button
        onClick={() => setHasOpenersOnly(!hasOpenersOnly)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${
          hasOpenersOnly
            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
        }`}
      >
        <span>🎵</span>
        <span>Openers</span>
      </button>

      {/* Clear button */}
      <AnimatePresence>
        {activeFilters > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            <span>Clear ({activeFilters})</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
