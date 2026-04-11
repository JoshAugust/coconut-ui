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
  Zap,
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

const toolColors: Record<string, string> = {
  read: '#3b82f6',
  write: '#10b981',
  edit: '#10b981',
  exec: '#f59e0b',
  web_search: '#8b5cf6',
  web_fetch: '#8b5cf6',
  browser: '#ec4899',
}

const statusConfig: Record<string, { color: string; glow: string; icon: React.ElementType; label: string }> = {
  pending: { color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', icon: Loader2, label: 'pending' },
  running: { color: '#3b82f6', glow: 'rgba(59,130,246,0.25)', icon: Loader2, label: 'running' },
  success: { color: '#10b981', glow: 'rgba(16,185,129,0.2)', icon: Check, label: 'done' },
  error: { color: '#ef4444', glow: 'rgba(239,68,68,0.2)', icon: X, label: 'error' },
  approval_required: { color: '#f97316', glow: 'rgba(249,115,22,0.2)', icon: ShieldAlert, label: 'needs approval' },
}

function formatDuration(ms?: number): string {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const cardVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.055, duration: 0.28, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, x: 8, transition: { duration: 0.16 } },
}

export function ToolTimeline({ toolCalls }: ToolTimelineProps) {
  const [filter, setFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const toolTypes = [...new Set(toolCalls.map((t) => t.name))]
  const filtered = filter ? toolCalls.filter((t) => t.name === filter) : toolCalls

  const totalDuration = toolCalls.reduce((sum, t) => sum + (t.duration_ms || 0), 0)
  const successCount = toolCalls.filter((t) => t.status === 'success').length
  const errorCount = toolCalls.filter((t) => t.status === 'error').length
  const runningCount = toolCalls.filter((t) => t.status === 'running').length

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(59,130,246,0.04) 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 8px rgba(245,158,11,0.2)' }}
          >
            <Zap size={13} style={{ color: '#f59e0b' }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Tool Timeline
          </h2>
          <motion.span
            key={toolCalls.length}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
          >
            {toolCalls.length}
          </motion.span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
          >
            <Clock size={10} /> {formatDuration(totalDuration)}
          </span>
          {runningCount > 0 && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
            >
              <Loader2 size={10} className="animate-spin" /> {runningCount}
            </motion.span>
          )}
          {successCount > 0 && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
            >
              <Check size={10} /> {successCount}
            </span>
          )}
          {errorCount > 0 && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              <X size={10} /> {errorCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {toolTypes.length > 1 && (
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <Filter size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <motion.button
            onClick={() => setFilter(null)}
            whileTap={{ scale: 0.95 }}
            className="text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium"
            style={{
              background: !filter
                ? 'linear-gradient(135deg, #f59e0b, #3b82f6)'
                : 'var(--color-bg-tertiary)',
              color: !filter ? 'white' : 'var(--color-text-muted)',
              border: '1px solid',
              borderColor: !filter ? 'transparent' : 'var(--color-border-subtle)',
              boxShadow: !filter ? '0 0 10px rgba(245,158,11,0.25)' : 'none',
            }}
          >
            All
          </motion.button>
          {toolTypes.map((type) => {
            const isActive = filter === type
            const color = toolColors[type] || '#a0a0b8'
            return (
              <motion.button
                key={type}
                onClick={() => setFilter(type === filter ? null : type)}
                whileTap={{ scale: 0.95 }}
                className="text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium transition-all"
                style={{
                  background: isActive ? color : 'var(--color-bg-tertiary)',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  border: '1px solid',
                  borderColor: isActive ? color : 'var(--color-border-subtle)',
                  boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
                }}
              >
                {type}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-3"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)' }}
            >
              <Wrench size={22} style={{ color: 'rgba(245,158,11,0.45)' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No tool calls yet
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Vertical line — gradient fade out at bottom */}
            <div
              className="absolute left-[14px] top-3 bottom-3 w-px"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.06) 80%, transparent 100%)',
              }}
            />

            <AnimatePresence mode="popLayout">
              {filtered.map((call, index) => {
                const ToolIcon = toolIcons[call.name] || Wrench
                const toolColor = toolColors[call.name] || '#a0a0b8'
                const config = statusConfig[call.status] || statusConfig.success
                const StatusIcon = config.icon
                const isExpanded = expandedId === (call.id || String(index))
                const isHovered = hoveredId === (call.id || String(index))
                const isRunning = call.status === 'running'

                return (
                  <motion.div
                    key={call.id || index}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="relative pl-9 pb-3"
                    onHoverStart={() => setHoveredId(call.id || String(index))}
                    onHoverEnd={() => setHoveredId(null)}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[10px] top-3.5 z-10">
                      {isRunning ? (
                        <>
                          {/* Outer pulsing ring for running */}
                          <motion.div
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 rounded-full"
                            style={{
                              width: 10,
                              height: 10,
                              background: config.color,
                              top: -1,
                              left: -1,
                            }}
                          />
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: config.color, boxShadow: `0 0 8px ${config.glow}` }}
                          />
                        </>
                      ) : (
                        <motion.div
                          animate={{
                            boxShadow: isHovered
                              ? `0 0 10px ${toolColor}60`
                              : `0 0 4px ${toolColor}30`,
                          }}
                          transition={{ duration: 0.2 }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: isHovered ? toolColor : config.color }}
                        />
                      )}
                    </div>

                    {/* Card */}
                    <motion.div
                      animate={{
                        borderColor: isHovered ? `${toolColor}30` : 'var(--color-border-subtle)',
                        boxShadow: isHovered
                          ? `0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px ${toolColor}20, inset 0 0 0 1px ${toolColor}10`
                          : '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl cursor-pointer overflow-hidden"
                      style={{
                        background: 'rgba(18,18,28,0.65)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid var(--color-border-subtle)',
                        borderLeft: `2px solid ${isHovered || isExpanded ? toolColor : toolColor + '50'}`,
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : (call.id || String(index)))}
                    >
                      <div className="flex items-center gap-2 px-3 py-2">
                        {/* Tool icon */}
                        <motion.div
                          animate={{
                            color: isHovered ? toolColor : config.color,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ToolIcon size={13} style={{ flexShrink: 0 }} />
                        </motion.div>

                        {/* Name */}
                        <span
                          className="text-xs font-medium flex-1 truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {call.name}
                        </span>

                        {/* Duration */}
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
                        >
                          {formatDuration(call.duration_ms)}
                        </span>

                        {/* Status icon */}
                        <motion.div
                          animate={{
                            color: config.color,
                          }}
                        >
                          <StatusIcon
                            size={12}
                            className={isRunning ? 'animate-spin' : ''}
                          />
                        </motion.div>

                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={11} style={{ color: 'var(--color-text-muted)' }} />
                        </motion.div>
                      </div>

                      {/* Running progress shimmer */}
                      {isRunning && (
                        <div className="h-[2px] overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-full w-1/3"
                            style={{ background: `linear-gradient(90deg, transparent, ${toolColor}, transparent)` }}
                          />
                        </div>
                      )}

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2">
                              {call.args && Object.keys(call.args).length > 0 && (
                                <div>
                                  <div
                                    className="text-[9px] font-medium uppercase tracking-wider mb-1 px-0.5"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    Input
                                  </div>
                                  <pre
                                    className="text-[10px] p-2.5 rounded-lg overflow-x-auto"
                                    style={{
                                      background: 'rgba(0,0,0,0.3)',
                                      color: 'var(--color-text-secondary)',
                                      border: `1px solid ${toolColor}15`,
                                      fontFamily: 'var(--font-mono)',
                                    }}
                                  >
                                    {JSON.stringify(call.args, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {call.result && (
                                <div>
                                  <div
                                    className="text-[9px] font-medium uppercase tracking-wider mb-1 px-0.5"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    Output
                                  </div>
                                  <pre
                                    className="text-[10px] p-2.5 rounded-lg overflow-x-auto max-h-32 overflow-y-auto"
                                    style={{
                                      background: 'rgba(0,0,0,0.3)',
                                      color: 'var(--color-text-secondary)',
                                      border: '1px solid rgba(16,185,129,0.15)',
                                      fontFamily: 'var(--font-mono)',
                                    }}
                                  >
                                    {call.result.slice(0, 1000)}
                                    {call.result.length > 1000 ? '…' : ''}
                                  </pre>
                                </div>
                              )}
                              {call.error && (
                                <div
                                  className="text-[10px] p-2.5 rounded-lg"
                                  style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    fontFamily: 'var(--font-mono)',
                                  }}
                                >
                                  {call.error}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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
