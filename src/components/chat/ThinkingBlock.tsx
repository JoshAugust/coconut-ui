import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown } from 'lucide-react'

interface ThinkingBlockProps {
  text: string
}

export function ThinkingBlock({ text }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const preview = text.slice(0, 120) + (text.length > 120 ? '…' : '')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Animated shimmer border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 'inherit',
          background: `linear-gradient(90deg, transparent 0%, var(--color-accent-muted) 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: expanded ? 'none' : 'shimmer-slide 3s ease-in-out infinite',
          opacity: 0.5,
        }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Brain size={14} style={{ color: 'var(--color-accent)' }} />
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            Thinking
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          </motion.div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="text-xs leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {text}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {preview}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
