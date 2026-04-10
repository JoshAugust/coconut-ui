import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  FilePlus,
  Terminal,
  Search,
  Globe,
  Wrench,
  Check,
  X,
  Loader2,
  ShieldAlert,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react'
import type { ContentBlock } from '../../types'

type ToolCallBlock = Extract<ContentBlock, { type: 'tool_call' }>

interface ToolTimelineProps {
  toolCalls: ToolCallBlock[]
}

const toolIcons: Record<string, React.ElementType> = {
  read: FileText,
  write: FilePlus,
  edit: FilePlus,
  exec: Terminal,
  web_search: Search,
  web_fetch: Globe,
  browser: Globe,
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: '#f59e0b', icon: Loader2 },
  running: { color: '#3b82f6', icon: Loader2 },
  success: { color: '#10b981', icon: Check },
  error: { color: '#ef4444', icon: X },
  approval_required: { color: '#f97316', icon: ShieldAlert },
}

function formatDuration(ms?: number): string {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ToolTimeline({ toolCalls }: ToolTimelineProps) {
  const [filter, setFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toolTypes = [...new Set(toolCalls.map((t) => t.name))]
  const filtered = filter ? toolCalls.filter((t) => t.name === filter) : toolCalls

  const totalDuration = toolCalls.reduce((sum, t) => sum + (t.duration_ms || 0), 0)
  const successCount = toolCalls.filter((t) => t.status === 'success').length
  const errorCount = toolCalls.filter((t) => t.status === 'error').length

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Tool Timeline
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
          >
            {toolCalls.length}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatDuration(totalDuration)}
          </span>
          <span style={{ color: 'var(--color-success)' }}>✓ {successCount}</span>
          {errorCount > 0 && <span style={{ color: 'var(--color-error)' }}>✗ {errorCount}</span>}
        </div>
      </div>

      {/* Filter bar */}
      {toolTypes.length > 1 && (
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <Filter size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <button
            onClick={() => setFilter(null)}
            className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: !filter ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
              color: !filter ? 'white' : 'var(--color-text-muted)',
            }}
          >
            All
          </button>
          {toolTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type === filter ? null : type)}
              className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: filter === type ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: filter === type ? 'white' : 'var(--color-text-muted)',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <Wrench size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No tool calls yet
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[15px] top-0 bottom-0 w-px"
              style={{ background: 'var(--color-border)' }}
            />

            <AnimatePresence>
              {filtered.map((call, index) => {
                const Icon = toolIcons[call.name] || Wrench
                const config = statusConfig[call.status] || statusConfig.success
                const StatusIcon = config.icon
                const isExpanded = expandedId === call.id

                return (
                  <motion.div
                    key={call.id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative pl-10 pb-4"
                  >
                    {/* Dot on timeline */}
                    <div
                      className="absolute left-[11px] top-2 w-[9px] h-[9px] rounded-full z-10"
                      style={{
                        background: config.color,
                        boxShadow: `0 0 6px ${config.color}40`,
                      }}
                    />

                    {/* Card */}
                    <div
                      className="rounded-lg cursor-pointer"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : (call.id || String(index)))}
                    >
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Icon size={14} style={{ color: config.color, flexShrink: 0 }} />
                        <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {call.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDuration(call.duration_ms)}
                        </span>
                        <StatusIcon
                          size={12}
                          style={{ color: config.color }}
                          className={call.status === 'running' ? 'animate-spin' : ''}
                        />
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
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
                            <div className="px-3 pb-3 space-y-2">
                              {call.args && Object.keys(call.args).length > 0 && (
                                <pre className="text-[10px] p-2 rounded overflow-x-auto" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                                  {JSON.stringify(call.args, null, 2)}
                                </pre>
                              )}
                              {call.result && (
                                <pre className="text-[10px] p-2 rounded overflow-x-auto max-h-32 overflow-y-auto" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                                  {call.result.slice(0, 1000)}{call.result.length > 1000 ? '...' : ''}
                                </pre>
                              )}
                              {call.error && (
                                <div className="text-[10px] p-2 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
                                  {call.error}
                                </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
