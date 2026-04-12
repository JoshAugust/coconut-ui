import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldAlert,
  Terminal,
  FileText,
  Globe,
  Search,
  Database,
  Image as ImageIcon,
} from 'lucide-react'

interface ToolBlock {
  type: 'tool_call'
  id: string
  name: string
  args?: Record<string, unknown>
  result?: string
  duration_ms?: number
  status: 'success' | 'error' | 'running' | 'approval_required' | 'pending'
}

const toolIcons: Record<string, typeof Terminal> = {
  exec: Terminal,
  read: FileText,
  write: FileText,
  edit: FileText,
  web_search: Search,
  web_fetch: Globe,
  browser: Globe,
  image: ImageIcon,
  sessions_spawn: Database,
  memory_search: Search,
}

const statusConfig = {
  success: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Done' },
  error: { icon: XCircle, color: 'var(--color-error)', label: 'Error' },
  running: { icon: Loader2, color: 'var(--color-info)', label: 'Running' },
  approval_required: { icon: ShieldAlert, color: 'var(--color-warning)', label: 'Approval' },
  pending: { icon: Clock, color: 'var(--color-text-muted)', label: 'Pending' },
}

/** Format duration: 1234 → "1.2s", 450 → "450ms" */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ToolCallCard({ block }: { block: ToolBlock }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[block.status]
  const StatusIcon = config.icon
  const ToolIcon = toolIcons[block.name] || Terminal

  // Status-colored left border
  const borderColor = block.status === 'success' ? 'var(--color-success)'
    : block.status === 'error' ? 'var(--color-error)'
    : block.status === 'running' ? 'var(--color-info)'
    : block.status === 'approval_required' ? 'var(--color-warning)'
    : 'var(--color-border)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden hover-lift"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Header — single row, compact */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Tool icon — 16px, matches text */}
        <ToolIcon size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />

        {/* Name */}
        <span
          className="text-[13px] font-medium font-mono"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {block.name}
        </span>

        {/* Duration */}
        {block.duration_ms != null && (
          <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {formatDuration(block.duration_ms)}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status pill badge */}
        <span
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
          style={{
            borderRadius: 'var(--radius-full)',
            color: config.color,
            background: block.status === 'success' ? 'var(--color-success-muted)'
              : block.status === 'error' ? 'var(--color-error-muted)'
              : block.status === 'running' ? 'var(--color-info-muted)'
              : block.status === 'approval_required' ? 'var(--color-warning-muted)'
              : 'var(--color-bg-tertiary)',
          }}
        >
          <StatusIcon
            size={11}
            className={block.status === 'running' ? 'status-running' : ''}
          />
          {config.label}
        </span>

        {/* Expand chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </div>

      {/* Collapsed args preview */}
      {!expanded && block.args && (
        <div className="px-3.5 pb-2.5 -mt-1">
          <p
            className="text-[11px] truncate font-mono"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {Object.entries(block.args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ').slice(0, 60)}
          </p>
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="px-3.5 pb-3.5 space-y-2.5"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {block.args && (
                <div className="pt-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Arguments
                  </span>
                  <pre
                    className="mt-1.5 p-3 overflow-x-auto"
                    style={{
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      lineHeight: '1.6',
                    }}
                  >
                    {JSON.stringify(block.args, null, 2)}
                  </pre>
                </div>
              )}

              {block.result && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Result
                  </span>
                  <pre
                    className="mt-1.5 p-3 overflow-x-auto max-h-48"
                    style={{
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      lineHeight: '1.6',
                    }}
                  >
                    {block.result}
                  </pre>
                </div>
              )}

              {block.status === 'approval_required' && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 text-sm font-medium text-white cursor-pointer"
                    style={{
                      background: 'var(--color-success)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 text-sm font-medium cursor-pointer"
                    style={{
                      background: 'transparent',
                      color: 'var(--color-error)',
                      border: '1px solid var(--color-error)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    Deny
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
