import { motion } from 'framer-motion'

interface DecadeHeaderProps {
  decade: string
  concertCount: number
}

export function DecadeHeader({ decade, concertCount }: DecadeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="my-12 text-center"
    >
      <div className="inline-block">
        <div className="relative">
          <motion.h2
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="text-6xl font-display uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            style={{ backgroundSize: '200% 200%' }}
          >
            {decade}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"
          />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-3 text-sm font-mono uppercase tracking-widest text-gray-500"
        >
          {concertCount} {concertCount === 1 ? 'concert' : 'concerts'} in this decade
        </motion.p>
      </div>
    </motion.div>
  )
}
