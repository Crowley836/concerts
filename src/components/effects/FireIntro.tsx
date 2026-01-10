import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FireIntroProps {
    onComplete: () => void
}

export function FireIntro({ onComplete }: FireIntroProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Sequence:
        // 0s: Start
        // 0.5s: Fade in complete (handled by motion)
        // 2.5s: Start fade out
        // 3.5s: Complete
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 2800)

        const completeTimer = setTimeout(() => {
            onComplete()
        }, 4000) // Allow for exit animation

        return () => {
            clearTimeout(timer)
            clearTimeout(completeTimer)
        }
    }, [onComplete])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5 } }} // Slow fade out
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.8) 100%)' }}
                >
                    <div className="relative w-full h-full overflow-hidden flex items-end justify-center pb-20 md:pb-0">
                        {/* Fire Container */}
                        <motion.div
                            initial={{ y: 100, scale: 0.8 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-64 h-64 md:w-96 md:h-96"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_50px_rgba(239,68,68,0.6)]">
                                <defs>
                                    <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                        <stop offset="0%" stopColor="#fef08a" /> {/* yellow-200 */}
                                        <stop offset="40%" stopColor="#f97316" /> {/* orange-500 */}
                                        <stop offset="80%" stopColor="#ef4444" /> {/* red-500 */}
                                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" /> {/* red-900 transparent */}
                                    </linearGradient>
                                    <filter id="fireBlur">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                                    </filter>
                                </defs>

                                {/* Base flames */}
                                <motion.path
                                    d="M50 90 C 20 90 20 60 30 50 C 35 45 40 45 40 30 C 40 20 50 10 50 10 C 50 10 60 20 60 30 C 60 45 65 45 70 50 C 80 60 80 90 50 90 Z"
                                    fill="url(#fireGradient)"
                                    style={{ filter: 'url(#fireBlur)' }}
                                    animate={{
                                        d: [
                                            "M50 92 C 15 92 15 55 30 50 C 35 45 35 45 40 25 C 40 15 50 0 50 0 C 50 0 60 15 60 25 C 65 45 65 45 70 50 C 85 55 85 92 50 92 Z",
                                            "M50 90 C 25 90 25 58 32 52 C 37 48 38 48 42 28 C 42 18 50 5 50 5 C 50 5 58 18 58 28 C 62 48 63 48 68 52 C 75 58 75 90 50 90 Z",
                                            "M50 92 C 15 92 15 55 30 50 C 35 45 35 45 40 25 C 40 15 50 0 50 0 C 50 0 60 15 60 25 C 65 45 65 45 70 50 C 85 55 85 92 50 92 Z"
                                        ],
                                        scaleY: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut"
                                    }}
                                />

                                {/* Inner core flame */}
                                <motion.path
                                    d="M50 90 C 35 90 35 70 40 60 C 45 50 50 30 50 30 C 50 30 55 50 60 60 C 65 70 65 90 50 90 Z"
                                    fill="#fff"
                                    opacity="0.6"
                                    style={{ filter: 'url(#fireBlur)' }}
                                    animate={{
                                        d: [
                                            "M50 90 C 32 90 32 68 40 55 C 45 45 50 25 50 25 C 50 25 55 45 60 55 C 68 68 68 90 50 90 Z",
                                            "M50 90 C 38 90 38 72 42 62 C 46 52 50 35 50 35 C 50 35 54 52 58 62 C 62 72 62 90 50 90 Z",
                                            "M50 90 C 32 90 32 68 40 55 C 45 45 50 25 50 25 C 50 25 55 45 60 55 C 68 68 68 90 50 90 Z"
                                        ]
                                    }}
                                    transition={{
                                        duration: 0.4,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut"
                                    }}
                                />

                            </svg>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
