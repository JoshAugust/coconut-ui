import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Search,
  FileText,
  Clock,
  ChevronRight,
  RefreshCw,
  Sparkles,
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
  onRefresh?: () => void
  loading?: boolean
}

const sourceConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  session: { color: '#3b82f6', icon: Clock, label: 'Session' },
  file: { color: '#10b981', icon: FileText, label: 'File' },
  embedding: { color: '#8b5cf6', icon: Sparkles, label: 'Embedding' },
  dream: { color: '#f59e0b', icon: Brain, label: 'Dream' },
}

// Demo memories for when not connected to a backend with memory support
const demoMemories: MemoryEntry[] = [
  {
    id: '1',
    title: 'Memory System',
    content: 'Connect to an Eragon gateway to browse agent memories. The memory browser will show session memories, long-term MEMORY.md content, and autoDream consolidation events.',
    source: 'file',
    timestamp: new Date().toISOString(),
    path: 'MEMORY.md',
  },
  {
    id: '2',
    title: 'How It Works',
    content: 'Memories are organized by source: session (conversation history), file (MEMORY.md and memory/*.md), embedding (semantic search results), and dream (background memory consolidation).',
    source: 'dream',
    timestamp: new Date().toISOString(),
  },
]

export function MemoryBrowser({
  memories = demoMemories,
  onSearch,
  onRefresh,
  loading = false,
}: MemoryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)

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
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Brain size={18} style={{ color: 'var(--color-accent)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Memory
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
          >
            {memories.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded hover:opacity-80"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md outline-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Source filters */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <button
          onClick={() => setActiveSource(null)}
          className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            background: !activeSource ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            color: !activeSource ? 'white' : 'var(--color-text-muted)',
          }}
        >
          All
        </button>
        {Object.entries(sourceConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => setActiveSource(key === activeSource ? null : key)}
              className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1"
              style={{
                background: activeSource === key ? config.color : 'var(--color-bg-tertiary)',
                color: activeSource === key ? 'white' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={10} />
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <Brain size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {searchQuery ? 'No matching memories' : 'No memories yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((memory) => {
              const config = sourceConfig[memory.source] || sourceConfig.file
              const isExpanded = expandedId === memory.id

              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2"
                >
                  <div
                    className="rounded-lg cursor-pointer"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : memory.id)}
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      {/* Source icon */}
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: `${config.color}20`, color: config.color }}
                      >
                        <config.icon size={11} />
                      </div>

                      {/* Title */}
                      <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {memory.title}
                      </span>

                      {/* Path badge */}
                      {memory.path && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                          {memory.path}
                        </span>
                      )}

                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                        <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-3 pb-3 text-xs leading-relaxed whitespace-pre-wrap"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {memory.content}
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 pb-2"
                          >
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(memory.timestamp).toLocaleString()}
                            </span>
                            {memory.relevance != null && (
                              <span className="text-[10px]" style={{ color: config.color }}>
                                {(memory.relevance * 100).toFixed(0)}% relevant
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
