import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Plus,
  Play,
  Trash2,
  RefreshCw,
  Calendar,
  ChevronDown,
  Zap,
  Timer,
} from 'lucide-react'

interface CronJob {
  id: string
  name: string
  schedule: string
  nextRun?: string
  lastRun?: string
  enabled: boolean
  payload: string
}

interface CronSchedulerProps {
  jobs?: CronJob[]
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
  onRun?: (id: string) => void
  onRefresh?: () => void
  loading?: boolean
}

const demoJobs: CronJob[] = [
  {
    id: '1',
    name: 'Tunnel Keepalive',
    schedule: '*/7 * * * *',
    nextRun: new Date(Date.now() + 300_000).toISOString(),
    lastRun: new Date(Date.now() - 120_000).toISOString(),
    enabled: true,
    payload: 'Check tunnel status and reconnect if needed',
  },
  {
    id: '2',
    name: 'Daily Memory Consolidation',
    schedule: '0 3 * * *',
    nextRun: new Date(Date.now() + 43_200_000).toISOString(),
    enabled: true,
    payload: 'Consolidate session memories into MEMORY.md',
  },
  {
    id: '3',
    name: 'Weekly Digest',
    schedule: '0 9 * * 1',
    nextRun: new Date(Date.now() + 432_000_000).toISOString(),
    enabled: false,
    payload: 'Send weekly progress summary',
  },
]

function timeUntil(dateStr?: string): { label: string; urgency: 'soon' | 'medium' | 'later' } {
  if (!dateStr) return { label: '—', urgency: 'later' }
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return { label: 'overdue', urgency: 'soon' }
  const mins = Math.floor(diff / 60_000)
  if (mins < 10) return { label: `in ${mins}m`, urgency: 'soon' }
  if (mins < 60) return { label: `in ${mins}m`, urgency: 'medium' }
  const hours = Math.floor(mins / 60)
  if (hours < 24) return { label: `in ${hours}h`, urgency: 'medium' }
  return { label: `in ${Math.floor(hours / 24)}d`, urgency: 'later' }
}

const urgencyColor = {
  soon:   '#ef4444',
  medium: '#f59e0b',
  later:  'var(--color-text-muted)',
}

/** Animated spring toggle */
function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="relative flex-shrink-0"
      style={{ width: 34, height: 20 }}
      title={enabled ? 'Disable' : 'Enable'}
    >
      {/* Track */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: enabled
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : 'var(--color-bg-tertiary)',
          boxShadow: enabled
            ? '0 0 8px rgba(16,185,129,0.4)'
            : 'none',
        }}
        transition={{ duration: 0.2 }}
        style={{ border: '1px solid var(--color-border)' }}
      />
      {/* Thumb */}
      <motion.div
        className="absolute top-[3px] rounded-full"
        style={{
          width: 14,
          height: 14,
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
        animate={{ left: enabled ? 17 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export function CronScheduler({
  jobs = demoJobs,
  onToggle,
  onDelete,
  onRun,
  onRefresh,
  loading = false,
}: CronSchedulerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  const activeCount = jobs.filter((j) => j.enabled).length

  const handleRun = async (id: string) => {
    setRunningId(id)
    onRun?.(id)
    setTimeout(() => setRunningId(null), 1500)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <Calendar size={14} style={{ color: '#f59e0b' }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Scheduled Jobs
          </h2>
          {/* Active count badge */}
          <motion.span
            key={activeCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: activeCount > 0
                ? 'rgba(16,185,129,0.15)'
                : 'var(--color-bg-tertiary)',
              color: activeCount > 0
                ? 'var(--color-success)'
                : 'var(--color-text-muted)',
              border: `1px solid ${activeCount > 0 ? 'rgba(16,185,129,0.3)' : 'var(--color-border-subtle)'}`,
            }}
          >
            {activeCount} active
          </motion.span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md transition-all hover:opacity-80"
            style={{
              background: 'rgba(99,102,241,0.1)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
            title="New job"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-bg-elevated)' }}
            >
              <Clock size={24} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No scheduled jobs
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {jobs.map((job, index) => {
              const isExpanded = expandedId === job.id
              const isRunning = runningId === job.id
              const { label: nextLabel, urgency } = timeUntil(job.nextRun)

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -1 }}
                  className="relative"
                >
                  {/* Glass card */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      opacity: job.enabled ? 1 : 0.55,
                      boxShadow: job.enabled
                        ? '0 2px 12px rgba(0,0,0,0.15)'
                        : 'none',
                      transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    >
                      {/* Toggle switch */}
                      <ToggleSwitch
                        enabled={job.enabled}
                        onToggle={() => onToggle?.(job.id)}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {job.name}
                          </span>
                          <code
                            className="text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0"
                            style={{
                              background: 'var(--color-bg-tertiary)',
                              color: 'var(--color-text-muted)',
                              fontFamily: 'var(--font-mono, monospace)',
                            }}
                          >
                            {job.schedule}
                          </code>
                        </div>
                        {/* Next run */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <Timer size={10} style={{ color: urgencyColor[urgency] }} />
                          <span
                            className="text-[11px]"
                            style={{ color: urgencyColor[urgency] }}
                          >
                            {nextLabel}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Run now */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRun(job.id)
                          }}
                          className="p-1.5 rounded-md transition-all"
                          style={{
                            background: isRunning
                              ? 'rgba(99,102,241,0.2)'
                              : 'var(--color-bg-tertiary)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-border-subtle)',
                          }}
                          title="Run now"
                          whileTap={{ scale: 0.85 }}
                        >
                          <AnimatePresence mode="wait">
                            {isRunning ? (
                              <motion.div
                                key="zap"
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                              >
                                <Zap size={12} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="play"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Play size={12} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Delete */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(job.id)
                          }}
                          className="p-1.5 rounded-md transition-all"
                          style={{
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-error)',
                            border: '1px solid var(--color-border-subtle)',
                          }}
                          title="Delete"
                          whileHover={{ background: 'rgba(239,68,68,0.15)' } as never}
                          whileTap={{ scale: 0.85 }}
                        >
                          <Trash2 size={12} />
                        </motion.button>

                        {/* Expand chevron */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <ChevronDown size={14} />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-4 pb-3 pt-1 space-y-2"
                            style={{ borderTop: '1px solid var(--color-border-subtle)' }}
                          >
                            {/* Payload */}
                            <div
                              className="text-xs p-2 rounded-lg leading-relaxed"
                              style={{
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border-subtle)',
                              }}
                            >
                              {job.payload}
                            </div>

                            {/* Timestamps */}
                            <div className="flex items-center gap-4 text-[11px]">
                              {job.lastRun && (
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                  Last ran:{' '}
                                  <span style={{ color: 'var(--color-text-secondary)' }}>
                                    {new Date(job.lastRun).toLocaleString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </span>
                              )}
                              {job.nextRun && (
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                  Next:{' '}
                                  <span style={{ color: urgencyColor[urgency] }}>
                                    {new Date(job.nextRun).toLocaleString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </span>
                              )}
                            </div>
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
