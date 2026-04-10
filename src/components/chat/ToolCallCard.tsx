import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  FileText,
  FilePlus,
  Terminal,
  Search,
  Globe,
  Check,
  X,
  Loader2,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import type { ContentBlock } from '../../types'
import { MarkdownRenderer } from './MarkdownRenderer'

type ToolCallBlock = Extract<ContentBlock, { type: 'tool_call' }>

interface ToolCallCardProps {
  block: ToolCallBlock
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
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

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Loader2 },
  running: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Loader2 },
  success: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Check },
  error: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: X },
  approval_required: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: ShieldAlert },
}

export function ToolCallCard({ block, onApprove, onDeny }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = toolIcons[block.name] || Wrench
  const config = statusConfig[block.status]
  const StatusIcon = config.icon

  return (
    <div
      className="rounded-lg overflow-hidden my-2"
      style={{
        background: 'var(--color-bg-tertiary)',
        borderLeft: `3px solid ${config.color}`,
        border: `1px solid var(--color-border-subtle)`,
        borderLeftWidth: '3px',
        borderLeftColor: config.color,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Icon size={14} style={{ color: config.color, flexShrink: 0 }} />
        <span
          className="text-xs font-semibold flex-1 truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {block.name}
        </span>

        {/* Duration badge */}
        {block.duration_ms != null && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
          >
            {(block.duration_ms / 1000).toFixed(1)}s
          </span>
        )}

        {/* Status icon */}
        <StatusIcon
          size={14}
          style={{ color: config.color }}
          className={block.status === 'running' || block.status === 'pending' ? 'animate-spin' : ''}
        />

        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Args */}
              {block.args && Object.keys(block.args).length > 0 && (
                <div>
                  <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Arguments
                  </p>
                  <pre
                    className="text-xs p-2 rounded overflow-x-auto"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                  >
                    {JSON.stringify(block.args, null, 2)}
                  </pre>
                </div>
              )}

              {/* Result */}
              {block.result && (
                <div>
                  <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Result
                  </p>
                  <div
                    className="text-xs p-2 rounded overflow-x-auto max-h-64 overflow-y-auto"
                    style={{ background: 'var(--color-bg-elevated)' }}
                  >
                    <MarkdownRenderer content={block.result} />
                  </div>
                </div>
              )}

              {/* Error */}
              {block.error && (
                <div
                  className="text-xs p-2 rounded"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}
                >
                  {block.error}
                </div>
              )}

              {/* Approval buttons */}
              {block.status === 'approval_required' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onApprove?.(block.id)}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium text-white"
                    style={{ background: 'var(--color-success)' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onDeny?.(block.id)}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium text-white"
                    style={{ background: 'var(--color-error)' }}
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
