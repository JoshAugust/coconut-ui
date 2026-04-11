import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown } from 'lucide-react'

interface ThinkingBlockProps {
  text: string
}

export function ThinkingBlock({ text }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const preview = text.slice(0, 100) + (text.length > 100 ? '…' : '')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden cursor-pointer w-full"
      style={{
        background: 'rgba(139, 92, 246, 0.06)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        borderRadius: '14px',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 py-3.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(139, 92, 246, 0.15)' }}
          >
            <Brain size={11} style={{ color: '#a78bfa' }} />
          </div>
          <span
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: '#a78bfa' }}
          >
            Thinking
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronDown size={13} style={{ color: 'rgba(139, 92, 246, 0.5)' }} />
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
              className="text-[12px] leading-[1.5]"
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
