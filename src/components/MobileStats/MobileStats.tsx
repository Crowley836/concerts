import { motion } from 'framer-motion'
import { Trophy, MapPin, Calendar, Activity } from 'lucide-react'
import type { Concert } from '../../types/concert'
import { useConcertStats } from '../../hooks/useConcertStats'

interface MobileStatsProps {
    concerts: Concert[]
}

export function MobileStats({ concerts }: MobileStatsProps) {
    const stats = useConcertStats(concerts)

    return (
        <div className="w-full md:hidden py-8 px-4 space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 block px-2">
                    Your Highlights
                </span>

                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 snap-x snap-mandatory custom-scrollbar">

                    {/* Card 1: Top Bands */}
                    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[280px] w-[85vw] max-w-[320px] snap-center flex-shrink-0 flex flex-col items-start gap-4 shadow-xl">
                        <div className="flex items-center gap-2 text-indigo-300">
                            <Trophy size={20} />
                            <h3 className="font-bold text-lg text-white">Heavy Hitters</h3>
                        </div>

                        <div className="w-full space-y-3">
                            {stats.topBands.map((band, i) => (
                                <div key={band.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-mono w-4 text-right">{i + 1}</span>
                                        <span className="text-gray-200 font-medium truncate max-w-[160px]">{band.name}</span>
                                    </div>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-400 font-mono">
                                        {band.count}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full h-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mt-auto" />
                    </div>

                    {/* Card 2: Top Genres */}
                    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[280px] w-[85vw] max-w-[320px] snap-center flex-shrink-0 flex flex-col items-start gap-4 shadow-xl">
                        <div className="flex items-center gap-2 text-pink-300">
                            <Activity size={20} />
                            <h3 className="font-bold text-lg text-white">Vibe Check</h3>
                        </div>

                        <div className="w-full space-y-4 my-auto">
                            {stats.topGenres.map((genre, i) => (
                                <div key={genre.name} className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>{genre.name}</span>
                                        <span>{genre.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(genre.count / stats.topGenres[0].count) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                            className="h-full bg-pink-500/60 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 3: Top Venues */}
                    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[280px] w-[85vw] max-w-[320px] snap-center flex-shrink-0 flex flex-col items-start gap-4 shadow-xl">
                        <div className="flex items-center gap-2 text-emerald-300">
                            <MapPin size={20} />
                            <h3 className="font-bold text-lg text-white">Favorite Haunts</h3>
                        </div>

                        <div className="w-full space-y-3">
                            {stats.topVenues.map((venue) => (
                                <div key={venue.name} className="flex justify-between items-start text-sm border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-gray-200 font-medium truncate max-w-[180px]">{venue.name}</span>
                                        <span className="text-gray-500 text-xs truncate max-w-[180px]">{venue.city}</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold ml-2">
                                        {venue.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 4: Busiest Year */}
                    {stats.busiestYear && (
                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 backdrop-blur-md rounded-2xl p-5 min-w-[260px] w-[75vw] max-w-[300px] snap-center flex-shrink-0 flex flex-col items-center justify-center gap-2 shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Calendar size={100} />
                            </div>

                            <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-sm relative z-10">Peak Year</h3>

                            <div className="text-6xl font-black text-white relative z-10 tracking-tighter my-2">
                                {stats.busiestYear.year}
                            </div>

                            <div className="text-gray-400 text-sm relative z-10">
                                You went to <span className="text-white font-bold">{stats.busiestYear.count}</span> shows!
                            </div>

                            <div className="h-16 w-full mt-4 flex items-end justify-center gap-1 opacity-50 relative z-10">
                                {[0.4, 0.7, 0.3, 1, 0.6, 0.8, 0.5].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h * 100}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className="w-2 bg-indigo-400 rounded-t-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    )
}
