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
  success: { icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-muted)', label: 'Success' },
  error: { icon: XCircle, color: 'var(--color-error)', bg: 'var(--color-error-muted)', label: 'Error' },
  running: { icon: Loader2, color: 'var(--color-warning)', bg: 'var(--color-warning-muted)', label: 'Running' },
  approval_required: { icon: ShieldAlert, color: 'var(--color-info)', bg: 'var(--color-info-muted)', label: 'Approval Required' },
  pending: { icon: Clock, color: 'var(--color-text-muted)', bg: 'var(--color-bg-tertiary)', label: 'Pending' },
}

export function ToolCallCard({ block }: { block: ToolBlock }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[block.status]
  const StatusIcon = config.icon
  const ToolIcon = toolIcons[block.name] || Terminal

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass overflow-hidden"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ transition: 'background var(--transition-fast)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {/* Tool icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: config.bg }}
        >
          <ToolIcon size={14} style={{ color: config.color }} />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold font-mono"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {block.name}
            </span>
            {block.duration_ms != null && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <Clock size={10} />
                {block.duration_ms < 1000
                  ? `${block.duration_ms}ms`
                  : `${(block.duration_ms / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>
          {block.args && !expanded && (
            <p
              className="text-[10px] truncate mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {Object.entries(block.args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ').slice(0, 80)}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full shrink-0"
          style={{ background: config.bg }}
        >
          <StatusIcon
            size={12}
            style={{ color: config.color }}
            className={block.status === 'running' ? 'animate-spin' : ''}
          />
          <span className="text-[10px] font-medium" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        {/* Expand chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-2"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {/* Args */}
              {block.args && (
                <div className="pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Arguments
                  </span>
                  <pre
                    className="text-xs mt-1 p-2 rounded-md overflow-x-auto"
                    style={{
                      background: 'var(--color-code-bg)',
                      border: '1px solid var(--color-code-border)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    {JSON.stringify(block.args, null, 2)}
                  </pre>
                </div>
              )}

              {/* Result */}
              {block.result && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Result
                  </span>
                  <pre
                    className="text-xs mt-1 p-2 rounded-md overflow-x-auto max-h-48"
                    style={{
                      background: 'var(--color-code-bg)',
                      border: '1px solid var(--color-code-border)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    {block.result}
                  </pre>
                </div>
              )}

              {/* Approval buttons */}
              {block.status === 'approval_required' && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
                    style={{
                      background: 'var(--color-success)',
                      border: 'none',
                      boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer"
                    style={{
                      background: 'var(--color-error-muted)',
                      color: 'var(--color-error)',
                      border: '1px solid var(--color-error)',
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
