import { motion } from 'framer-motion'

interface YearMarkerProps {
  year: number
  concertCount: number
}

export function YearMarker({ year, concertCount }: YearMarkerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 my-8"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent origin-left"
      />
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
      >
        <span className="text-2xl font-display text-purple-400 tracking-wider">{year}</span>
        <span className="text-sm font-mono text-gray-500">
          {concertCount} {concertCount === 1 ? 'show' : 'shows'}
        </span>
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent origin-right"
      />
    </motion.div>
  )
}
