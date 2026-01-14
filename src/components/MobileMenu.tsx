import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { haptics } from '../utils/haptics'
import { scenes } from '../constants/scenes'

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const toggleMenu = () => {
        haptics.light()
        setIsOpen(!isOpen)
    }

    const scrollToScene = (sceneId: number) => {
        haptics.medium()
        setIsOpen(false)

        // Tiny delay to allow menu to start closing before scrolling
        setTimeout(() => {
            const scrollContainer = document.querySelector('.snap-y')
            if (!scrollContainer) return

            const windowHeight = window.innerHeight
            scrollContainer.scrollTo({
                top: (sceneId - 1) * windowHeight,
                behavior: 'smooth',
            })
        }, 100)
    }

    return (
        <>
            {/* Toggle Button - Fixed Top Right */}
            <button
                onClick={toggleMenu}
                className="fixed top-4 right-4 z-50 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white shadow-lg md:hidden active:scale-95 transition-transform"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Full Screen Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-black/80 md:hidden flex flex-col items-center justify-center"
                    >
                        <nav className="flex flex-col gap-6 w-full max-w-xs px-6">
                            {scenes.map((scene, index) => (
                                <motion.button
                                    key={scene.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    onClick={() => scrollToScene(scene.id)}
                                    className={`group flex items-center gap-4 w-full p-4 rounded-xl border transition-all text-left transform active:scale-98 ${scene.hiddenOnMobile
                                        ? 'bg-white/5 border-transparent opacity-40 cursor-not-allowed'
                                        : 'bg-white/5 active:bg-white/10 border-white/5'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${scene.color} shadow-[0_0_10px_currentColor]`} />
                                    <span className="text-xl font-medium text-white/90 tracking-wide">
                                        {(scene as any).mobileLabel || scene.label} {scene.hiddenOnMobile && <span className="text-xs ml-2 opacity-60">(Desktop Only)</span>}
                                    </span>
                                </motion.button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
