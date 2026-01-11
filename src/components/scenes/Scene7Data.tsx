import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Concert } from '../../types/concert'

interface Scene7DataProps {
    concerts: Concert[]
}

export function Scene7Data({ concerts }: Scene7DataProps) {
    // State for mobile openers modal
    const [activeOpeners, setActiveOpeners] = useState<string[] | null>(null)

    // Sort concerts by date descending (newest first)
    const sortedConcerts = [...concerts].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

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
                    <p className="text-gray-400 text-sm md:text-base">
                        {concerts.length} shows and counting.
                    </p>
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
                        {sortedConcerts.map((concert) => (
                            <motion.div
                                key={concert.id}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "50px" }}
                                className="grid grid-cols-12 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm items-center group"
                            >
                                {/* Date */}
                                <div className="col-span-3 md:col-span-2 flex flex-col">
                                    <span className="text-white font-medium">{concert.date}</span>
                                    <span className="text-gray-500 text-xs md:hidden">{concert.dayOfWeek}</span>
                                </div>

                                {/* Headliner */}
                                <div className="col-span-3 md:col-span-3 font-semibold text-white truncate" title={concert.headliner}>
                                    {concert.headliner}
                                </div>

                                {/* Openers */}
                                <div className="col-span-2 md:col-span-2 text-gray-400 text-xs md:text-sm truncate">
                                    <span className="hidden md:inline" title={concert.openers.join(', ')}>
                                        {concert.openers.length > 0 ? concert.openers.join(', ') : '-'}
                                    </span>
                                    <span
                                        className="md:hidden flex items-center gap-1 cursor-pointer active:opacity-70"
                                        onClick={() => concert.openers.length > 0 && setActiveOpeners(concert.openers)}
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
                                <div className="col-span-4 md:col-span-3 text-right md:text-left flex flex-col md:flex-row md:items-center justify-end md:justify-start gap-1">
                                    <span className="text-indigo-300 truncate" title={concert.venue}>{concert.venue}</span>
                                    <span className="hidden md:inline text-gray-600">•</span>
                                    <span className="text-gray-500 text-xs md:text-sm truncate" title={concert.city}>{concert.city}</span>
                                </div>

                                {/* Attended With (Desktop only) */}
                                <div className="hidden md:block col-span-2 text-gray-400 truncate" title={concert.attendedWith}>
                                    {concert.attendedWith || '-'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Mobile Openers Modal */}
                <AnimatePresence>
                    {activeOpeners && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:hidden">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveOpeners(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-white">Openers</h3>
                                        <button
                                            onClick={() => setActiveOpeners(null)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                    <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {activeOpeners.map((opener, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-white/5">
                                                <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs font-medium text-gray-400">
                                                    {i + 1}
                                                </span>
                                                <span className="font-medium">{opener}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
