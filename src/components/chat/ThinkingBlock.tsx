import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown } from 'lucide-react'

interface ThinkingBlockProps {
  text: string
  defaultCollapsed?: boolean
}

export function ThinkingBlock({ text, defaultCollapsed = true }: ThinkingBlockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div
      className="rounded-lg overflow-hidden my-2"
      style={{
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
        }}
      >
        <Brain size={14} />
        <span className="text-xs font-medium flex-1">Thinking</span>
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="px-3 pb-3 text-xs leading-relaxed whitespace-pre-wrap"
              style={{
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
