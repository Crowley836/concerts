import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import type { Concert } from '../../types/concert'
import { useConcertStats } from '../../hooks/useConcertStats'

interface Scene7DataProps {
    concerts: Concert[]
}

export function Scene7Data({ concerts }: Scene7DataProps) {
    // State for mobile details modal
    type ModalState = { title: string; content: string[] } | null
    const [activeModal, setActiveModal] = useState<ModalState>(null)

    // State for search and filter
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<{ type: 'venue' | 'year', value: string | number } | null>(null)

    // Compute stats for filter chips
    const stats = useConcertStats(concerts)
    const filterChips = useMemo(() => {
        return [
            ...stats.topVenues.slice(0, 4).map(v => ({ type: 'venue' as const, label: v.name, value: v.name })),
            ...(stats.busiestYear ? [stats.busiestYear] : []).map(y => ({ type: 'year' as const, label: y.year.toString(), value: y.year })),
            // Add other recent top years if we want, for now just busiest or maybe top 3 years?
            // Let's grab top 3 years manually since hook only gives busiest
            ...Array.from(concerts.reduce((acc, c) => {
                acc.set(c.year, (acc.get(c.year) || 0) + 1)
                return acc
            }, new Map<number, number>()).entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .filter(y => !stats.busiestYear || y[0] !== stats.busiestYear.year) // Avoid dupes
                .map(y => ({ type: 'year' as const, label: y[0].toString(), value: y[0] }))
        ]
    }, [stats, concerts])

    // Helper to open modal
    const showModal = (title: string, content: string | string[]) => {
        const items = Array.isArray(content) ? content : [content]
        setActiveModal({ title, content: items })
    }

    // Filter and Sort concerts
    const filteredAndSortedConcerts = useMemo(() => {
        let result = [...concerts]

        // 1. Apply Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            result = result.filter(c =>
                c.headliner.toLowerCase().includes(query) ||
                c.venue.toLowerCase().includes(query) ||
                c.city.toLowerCase().includes(query) ||
                c.year.toString().includes(query) ||
                c.date.includes(query) ||
                c.attendedWith?.toLowerCase().includes(query) ||
                c.openers.some(o => o.toLowerCase().includes(query))
            )
        }

        // 2. Apply Chip Filter
        if (activeFilter) {
            if (activeFilter.type === 'venue') {
                result = result.filter(c => c.venue === activeFilter.value)
            } else if (activeFilter.type === 'year') {
                result = result.filter(c => c.year === activeFilter.value)
            }
        }

        // 3. Sort (newest first)
        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    }, [concerts, searchQuery, activeFilter])

    return (
        <section className="relative min-h-screen w-full snap-start bg-slate-900 flex flex-col pt-16 md:pt-20 pb-8 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 flex-shrink-0"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        The Archive
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base mb-4">
                        {filteredAndSortedConcerts.length} {filteredAndSortedConcerts.length === 1 ? 'show' : 'shows'} found.
                    </p>

                    {/* Search & Filter Controls */}
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search bands, venues, cities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2">
                            {filterChips.map((chip, i) => (
                                <button
                                    key={`${chip.type}-${chip.value}-${i}`}
                                    onClick={() => {
                                        if (activeFilter?.type === chip.type && activeFilter?.value === chip.value) {
                                            setActiveFilter(null) // Toggle off
                                        } else {
                                            setActiveFilter({ type: chip.type, value: chip.value })
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${activeFilter?.type === chip.type && activeFilter?.value === chip.value
                                        ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                            {/* Clear Filter Button (only if filter is active) */}
                            {activeFilter && (
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Table Container - Scrollable */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 min-h-0 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col backdrop-blur-sm"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/20 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider sticky top-0 z-10">
                        <div className="col-span-3 md:col-span-2">Date</div>
                        <div className="col-span-3 md:col-span-3">Headliner</div>
                        <div className="col-span-2 md:col-span-2">Openers</div>
                        <div className="col-span-4 md:col-span-3 text-right md:text-left">Venue</div>
                        <div className="hidden md:block col-span-2">Attended With</div>
                    </div>

                    {/* Table Body - Scrollable Area */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                        {filteredAndSortedConcerts.length > 0 ? (
                            filteredAndSortedConcerts.map((concert) => (
                                <motion.div
                                    key={concert.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "50px" }}
                                    className="grid grid-cols-12 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm items-center group relative"
                                >
                                    {/* Date */}
                                    <div className="col-span-3 md:col-span-2 flex flex-col pointer-events-none">
                                        <span className="text-white font-medium">{concert.date}</span>
                                        <span className="text-gray-500 text-xs md:hidden">{concert.dayOfWeek}</span>
                                    </div>

                                    {/* Headliner */}
                                    <div
                                        className="col-span-3 md:col-span-3 font-semibold text-white truncate md:cursor-default cursor-pointer active:opacity-70 relative z-10 touch-manipulation"
                                        title={concert.headliner}
                                        onClick={(e) => { e.stopPropagation(); showModal('Headliner', concert.headliner) }}
                                    >
                                        {concert.headliner}
                                    </div>

                                    {/* Openers */}
                                    <div className="col-span-2 md:col-span-2 text-gray-400 text-xs md:text-sm truncate relative z-10">
                                        <span className="hidden md:inline" title={concert.openers.join(', ')}>
                                            {concert.openers.length > 0 ? concert.openers.join(', ') : '-'}
                                        </span>
                                        <span
                                            className="md:hidden flex items-center gap-1 cursor-pointer active:opacity-70 touch-manipulation"
                                            onClick={(e) => { e.stopPropagation(); concert.openers.length > 0 && showModal('Openers', concert.openers) }}
                                        >
                                            {concert.openers.length > 0 ? (
                                                <>
                                                    <span className="truncate">{concert.openers[0]}</span>
                                                    {concert.openers.length > 1 && (
                                                        <span className="text-[10px] bg-slate-700 px-1 py-0.5 rounded text-gray-300 font-medium whitespace-nowrap">
                                                            +{concert.openers.length - 1}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </span>
                                    </div>

                                    {/* Venue & City */}
                                    <div className="col-span-4 md:col-span-3 text-right md:text-left flex flex-col md:flex-row md:items-center justify-end md:justify-start gap-1 relative z-10">
                                        <span
                                            className="text-indigo-300 truncate cursor-pointer md:cursor-default active:opacity-70 touch-manipulation inline-block"
                                            title={concert.venue}
                                            onClick={(e) => { e.stopPropagation(); showModal('Venue', concert.venue) }}
                                        >
                                            {concert.venue}
                                        </span>
                                        <span className="hidden md:inline text-gray-600 mx-1">•</span>
                                        <span
                                            className="text-gray-500 text-xs md:text-sm truncate cursor-pointer md:cursor-default active:opacity-70 touch-manipulation inline-block"
                                            title={concert.city}
                                            onClick={(e) => { e.stopPropagation(); showModal('City', concert.city) }}
                                        >
                                            {concert.city}
                                        </span>
                                    </div>

                                    {/* Attended With (Desktop only) */}
                                    <div className="hidden md:block col-span-2 text-gray-400 truncate" title={concert.attendedWith}>
                                        {concert.attendedWith || '-'}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                <p>No shows found matching your search.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter(null) }}
                                    className="mt-4 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mobile Details Modal - Portalled to body to escape overflow/stacking issues */}
                {createPortal(
                    <AnimatePresence>
                        {activeModal && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 md:hidden">
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setActiveModal(null)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-sm touch-none"
                                />

                                {/* Modal Content */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10000]"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-white">{activeModal.title}</h3>
                                            <button
                                                onClick={() => setActiveModal(null)}
                                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                        <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            {activeModal.content.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-white/5">
                                                    {activeModal.content.length > 1 && (
                                                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs font-medium text-gray-400">
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                    <span className="font-medium text-lg leading-snug">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </section>
    )
}
