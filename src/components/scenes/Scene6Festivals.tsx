import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Concert } from '../../types/concert'
import { haptics } from '../../utils/haptics'

interface Scene6FestivalsProps {
    concerts: Concert[]
}

export function Scene6Festivals({ concerts }: Scene6FestivalsProps) {
    // Filter for festivals
    // Sort by date (newest first for relevance? or oldest?)
    // Let's go Newest First.
    const festivals = concerts
        .filter(c => c.isFestival)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const scrollRef = useRef<HTMLDivElement>(null)
    const [activeCard, setActiveCard] = useState<string | null>(null)

    return (
        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: '-20%' }}
            transition={{ duration: 0.8 }}
            className="h-screen flex flex-col items-center justify-center relative snap-start snap-always overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', // Indigo/Deep Purple
            }}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            </div>

            {/* Header */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-16 md:top-20 text-center z-10 w-full px-4"
            >
                <h2 className="font-serif text-4xl md:text-6xl text-white mb-2 tracking-tight drop-shadow-lg">
                    Festival Archives
                </h2>
                <p className="font-sans text-white/60 text-sm md:text-base uppercase tracking-widest">
                    {festivals.length} Massive Events
                </p>
            </motion.div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollRef}
                className="w-full h-[60vh] md:h-[50vh] mt-20 flex items-center overflow-x-auto snap-x snap-mandatory px-8 md:px-[50vw] pb-8 hide-scrollbar gap-6 md:gap-12"
                style={{
                    perspective: '1000px',
                }}
            >
                {festivals.map((festival) => (
                    <motion.div
                        key={festival.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => {
                            setActiveCard(activeCard === festival.id ? null : festival.id)
                            haptics.light()
                        }}
                        className={`
              relative flex-shrink-0 snap-center
              w-[280px] md:w-[400px] 
              bg-white/10 backdrop-blur-md border border-white/20
              rounded-2xl p-6 md:p-8
              flex flex-col justify-between
              cursor-pointer hover:bg-white/15 transition-colors
              ${activeCard === festival.id ? 'ring-2 ring-purple-400 bg-white/20' : ''}
            `}
                        style={{
                            height: '100%',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* Date Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-600/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {festival.year}
                            </div>
                            <div className="text-white/50 text-xs font-mono uppercase">
                                {festival.city}, {festival.state}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col justify-center text-center">
                            {/* Title - Link logic: Reference > MDF Special > Wikipedia Fallback */}
                            {(() => {
                                // 1. Priority: Explicit Reference from Google Sheet
                                if (festival.reference) {
                                    return (
                                        <a
                                            href={festival.reference}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-serif text-3xl md:text-4xl text-white mb-4 leading-none hover:text-purple-300 transition-colors underline decoration-purple-500/50 underline-offset-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {festival.headliner}
                                        </a>
                                    )
                                }

                                // 2. Special Case: Maryland Deathfest
                                if (festival.headliner.toLowerCase().includes('maryland deathfest') || festival.headliner.toLowerCase().includes('mdf')) {
                                    return (
                                        <a
                                            href="https://deathfests.com/history/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-serif text-3xl md:text-4xl text-white mb-4 leading-none hover:text-purple-300 transition-colors underline decoration-purple-500/50 underline-offset-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {festival.headliner}
                                        </a>
                                    )
                                }

                                // 3. Special Case: Ozzfest
                                if (festival.headliner.toLowerCase().includes('ozzfest')) {
                                    return (
                                        <a
                                            href={`https://en.wikipedia.org/wiki/Ozzfest_lineups_by_year#${festival.year}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-serif text-3xl md:text-4xl text-white mb-4 leading-none hover:text-purple-300 transition-colors underline decoration-purple-500/50 underline-offset-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {festival.headliner}
                                        </a>
                                    )
                                }

                                // 4. Special Case: Woodstock
                                if (festival.headliner.toLowerCase().includes('woodstock')) {
                                    return (
                                        <a
                                            href="https://en.wikipedia.org/wiki/Woodstock_%2799"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-serif text-3xl md:text-4xl text-white mb-4 leading-none hover:text-purple-300 transition-colors underline decoration-purple-500/50 underline-offset-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {festival.headliner}
                                        </a>
                                    )
                                }

                                // 5. Fallback: No Link
                                return (
                                    <h3 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-none">
                                        {festival.headliner}
                                    </h3>
                                )
                            })()}

                            <div className="w-12 h-0.5 bg-purple-400 mx-auto mb-6 opacity-50" />

                            {/* Lineup Preview */}
                            <div className="text-white/80 text-sm md:text-base space-y-1 font-medium leading-relaxed line-clamp-6">
                                {festival.openers.slice(0, 10).map((band, i) => (
                                    <span key={i} className="inline-block mr-2">
                                        {band}{i < Math.min(festival.openers.length, 10) - 1 ? ' • ' : ''}
                                    </span>
                                ))}
                                {festival.openers.length > 10 && (
                                    <div className="text-purple-300 text-xs mt-2 italic">
                                        + {festival.openers.length - 10} more
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-white/40 text-xs">
                                {festival.venue}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white/70 text-lg">🎟️</span>
                            </div>
                        </div>

                    </motion.div>
                ))}

                {/* Spacer for end of list centering */}
                <div className="w-8 md:w-[calc(50vw-200px)] flex-shrink-0" />
            </div>

            {/* Helper Text */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 md:bottom-12 text-white/30 text-xs uppercase tracking-widest animate-pulse"
            >
                &larr; Swipe to Explore &rarr;
            </motion.div>

        </motion.section>
    )
}
