import { useMemo } from 'react'
import type { Concert } from '../types/concert'

export interface ConcertStats {
    topBands: { name: string; count: number }[]
    topGenres: { name: string; count: number }[]
    topVenues: { name: string; count: number; city: string }[]
    busiestYear: { year: number; count: number } | null
}

export function useConcertStats(concerts: Concert[]): ConcertStats {
    return useMemo(() => {
        if (concerts.length === 0) {
            return {
                topBands: [],
                topGenres: [],
                topVenues: [],
                busiestYear: null
            }
        }

        // 1. Top Bands
        // Count headliners
        const artistCounts = new Map<string, number>()
        concerts.forEach(c => {
            // Don't count festivals as bands if possible, but for now rely on headliner field
            if (!c.isFestival) {
                artistCounts.set(c.headliner, (artistCounts.get(c.headliner) || 0) + 1)
            }
        })

        const topBands = Array.from(artistCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // 2. Top Genres
        const genreCounts = new Map<string, number>()
        concerts.forEach(c => {
            if (c.genre) {
                // Normalize: "Rock/Metal" -> "Rock", or just count "Rock" and "Metal" separately if they are array?
                // The type says genre is string. We'll rely on that.
                // Maybe split by slash if needed, but simple counting for now.
                const genre = c.genre.split('/')[0].trim() // Simple heuristic: take primary genre
                genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1)
            }
        })

        const topGenres = Array.from(genreCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // 3. Top Venues
        const venueCounts = new Map<string, { count: number; city: string }>()
        concerts.forEach(c => {
            if (c.venue) {
                const current = venueCounts.get(c.venue) || { count: 0, city: c.city }
                venueCounts.set(c.venue, { count: current.count + 1, city: c.city })
            }
        })

        const topVenues = Array.from(venueCounts.entries())
            .map(([name, data]) => ({ name, count: data.count, city: data.city }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // 4. Busiest Year
        const yearCounts = new Map<number, number>()
        concerts.forEach(c => {
            if (c.year) {
                yearCounts.set(c.year, (yearCounts.get(c.year) || 0) + 1)
            }
        })

        let busiestYear = null
        if (yearCounts.size > 0) {
            const sortedYears = Array.from(yearCounts.entries())
                .sort((a, b) => b[1] - a[1])

            busiestYear = {
                year: sortedYears[0][0],
                count: sortedYears[0][1]
            }
        }

        return {
            topBands,
            topGenres,
            topVenues,
            busiestYear
        }
    }, [concerts])
}
