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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden cursor-pointer w-full hover-lift"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderLeft: '3px solid rgba(139, 92, 246, 0.5)',
        borderRadius: 'var(--radius-lg)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-3.5 py-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Brain size={14} style={{ color: '#a78bfa' }} />
          <span
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: '#a78bfa' }}
          >
            Thinking
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
              className="mt-2.5"
            >
              <p
                className="text-[12px] leading-[1.7] whitespace-pre-wrap"
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
              className="text-[12px] leading-[1.5] mt-2"
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
