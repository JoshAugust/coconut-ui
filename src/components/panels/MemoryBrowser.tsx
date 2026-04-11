import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Search,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react'

// Memory entries — will be fetched from backend when adapter supports it
interface MemoryEntry {
  id: string
  title: string
  content: string
  source: 'session' | 'file' | 'embedding' | 'dream'
  timestamp: string
  path?: string
  relevance?: number
}

interface MemoryBrowserProps {
  memories?: MemoryEntry[]
  onSearch?: (query: string) => void
}

const sourceConfig: Record<string, { color: string; glow: string; icon: React.ElementType; label: string }> = {
  session: { color: '#3b82f6', glow: 'rgba(59,130,246,0.18)', icon: Clock, label: 'Session' },
  file: { color: '#10b981', glow: 'rgba(16,185,129,0.18)', icon: FileText, label: 'File' },
  embedding: { color: '#8b5cf6', glow: 'rgba(139,92,246,0.18)', icon: Sparkles, label: 'Embedding' },
  dream: { color: '#f59e0b', glow: 'rgba(245,158,11,0.18)', icon: Brain, label: 'Dream' },
}

// Demo memories for when not connected to a backend with memory support
const demoMemories: MemoryEntry[] = [
  {
    id: '1',
    title: 'Memory System',
    content:
      'Connect to an Eragon gateway to browse agent memories. The memory browser will show session memories, long-term MEMORY.md content, and autoDream consolidation events.',
    source: 'file',
    timestamp: new Date().toISOString(),
    path: 'MEMORY.md',
    relevance: 0.95,
  },
  {
    id: '2',
    title: 'How It Works',
    content:
      'Memories are organized by source: session (conversation history), file (MEMORY.md and memory/*.md), embedding (semantic search results), and dream (background memory consolidation).',
    source: 'dream',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    relevance: 0.82,
  },
  {
    id: '3',
    title: 'Semantic Search',
    content:
      'Use the search bar above to run semantic queries against your memory. Results are ranked by relevance and returned with source context.',
    source: 'embedding',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    relevance: 0.74,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.28, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.18 } },
}

export function MemoryBrowser({
  memories = demoMemories,
  onSearch,
}: MemoryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = memories.filter((m) => {
    if (activeSource && m.source !== activeSource) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
    }
    return true
  })

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    onSearch?.(q)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-1 pb-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg outline-none transition-all"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid rgba(139,92,246,0.4)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid var(--color-border-subtle)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Source filters */}
      <div
        className="flex items-center gap-1.5 px-1 pb-3 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 0 }}
      >
        <motion.button
          onClick={() => setActiveSource(null)}
          whileTap={{ scale: 0.95 }}
          className="text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium transition-all"
          style={{
            background: !activeSource
              ? 'linear-gradient(135deg, #8b5cf6, #10b981)'
              : 'var(--color-bg-tertiary)',
            color: !activeSource ? 'white' : 'var(--color-text-muted)',
            border: '1px solid',
            borderColor: !activeSource ? 'transparent' : 'var(--color-border-subtle)',
            boxShadow: !activeSource ? '0 0 10px rgba(139,92,246,0.3)' : 'none',
          }}
        >
          All
        </motion.button>
        {Object.entries(sourceConfig).map(([key, config]) => {
          const Icon = config.icon
          const isActive = activeSource === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveSource(key === activeSource ? null : key)}
              whileTap={{ scale: 0.95 }}
              className="text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 font-medium transition-all"
              style={{
                background: isActive ? config.color : 'var(--color-bg-tertiary)',
                color: isActive ? 'white' : 'var(--color-text-muted)',
                border: '1px solid',
                borderColor: isActive ? config.color : 'var(--color-border-subtle)',
                boxShadow: isActive ? `0 0 8px ${config.glow}` : 'none',
              }}
            >
              <Icon size={9} />
              {config.label}
            </motion.button>
          )
        })}
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-3"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)' }}
            >
              <Brain size={22} style={{ color: 'rgba(139,92,246,0.5)' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {searchQuery ? 'No matching memories' : 'No memories yet'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((memory, index) => {
              const config = sourceConfig[memory.source] || sourceConfig.file
              const isExpanded = expandedId === memory.id
              const isHovered = hoveredId === memory.id

              return (
                <motion.div
                  key={memory.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="mb-2"
                  onHoverStart={() => setHoveredId(memory.id)}
                  onHoverEnd={() => setHoveredId(null)}
                >
                  <motion.div
                    animate={{
                      borderColor: isHovered
                        ? `${config.color}40`
                        : isExpanded
                        ? `${config.color}25`
                        : 'var(--color-border-subtle)',
                      boxShadow: isHovered
                        ? `0 4px 20px ${config.glow}, 0 0 0 1px ${config.color}20`
                        : '0 1px 4px rgba(0,0,0,0.12)',
                    }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl cursor-pointer overflow-hidden"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : memory.id)}
                  >
                    {/* Color bar top */}
                    <div
                      className="h-[2px] w-full"
                      style={{
                        background: `linear-gradient(90deg, ${config.color}, transparent)`,
                        opacity: isHovered || isExpanded ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                      }}
                    />

                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      {/* Source icon badge — 24px */}
                      <motion.div
                        animate={{
                          boxShadow: isHovered ? `0 0 10px ${config.glow}` : '0 0 0px transparent',
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          width: '24px',
                          height: '24px',
                          background: `${config.color}18`,
                          border: `1px solid ${config.color}30`,
                          color: config.color,
                        }}
                      >
                        <config.icon size={13} />
                      </motion.div>

                      {/* Title + relevance */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-xs font-medium block truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {memory.title}
                        </span>
                        {memory.relevance != null && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="h-0.5 rounded-full"
                              style={{
                                width: 36,
                                background: 'var(--color-bg-tertiary)',
                                overflow: 'hidden',
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${memory.relevance * 100}%` }}
                                transition={{ delay: index * 0.06 + 0.2, duration: 0.5, ease: 'easeOut' }}
                                style={{ height: '100%', background: config.color, borderRadius: 999 }}
                              />
                            </div>
                            <span className="text-[10px]" style={{ color: config.color }}>
                              {(memory.relevance * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Path badge */}
                      {memory.path && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                          style={{
                            background: `${config.color}12`,
                            color: config.color,
                            border: `1px solid ${config.color}20`,
                          }}
                        >
                          {memory.path}
                        </span>
                      )}

                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mx-3 mb-3 p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap"
                            style={{
                              background: 'rgba(0,0,0,0.25)',
                              color: 'var(--color-text-secondary)',
                              border: `1px solid ${config.color}15`,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10.5px',
                            }}
                          >
                            {memory.content}
                          </div>
                          <div className="flex items-center gap-2 px-3 pb-2.5">
                            <Clock size={9} style={{ color: 'var(--color-text-muted)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(memory.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
