import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, Play, Pause, Trash2, RefreshCw, Calendar } from 'lucide-react'

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
    nextRun: new Date(Date.now() + 300000).toISOString(),
    lastRun: new Date(Date.now() - 120000).toISOString(),
    enabled: true,
    payload: 'Check tunnel status',
  },
  {
    id: '2',
    name: 'Daily Memory Consolidation',
    schedule: '0 3 * * *',
    nextRun: new Date(Date.now() + 43200000).toISOString(),
    enabled: true,
    payload: 'Consolidate session memories',
  },
]

function timeUntil(dateStr?: string): string {
  if (!dateStr) return '—'
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'overdue'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `in ${hours}h`
  return `in ${Math.floor(hours / 24)}d`
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

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={18} style={{ color: 'var(--color-warning)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Scheduled Jobs
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
          >
            {jobs.filter((j) => j.enabled).length} active
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
            title="New job"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <Clock size={32} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No scheduled jobs
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {jobs.map((job) => {
              const isExpanded = expandedId === job.id

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2"
                >
                  <div
                    className="rounded-lg"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      opacity: job.enabled ? 1 : 0.5,
                    }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    >
                      {/* Enable/disable toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggle?.(job.id) }}
                        className="flex-shrink-0"
                        style={{ color: job.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                      >
                        {job.enabled ? <Play size={14} /> : <Pause size={14} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {job.name}
                          </span>
                          <code className="text-[10px] px-1 rounded" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                            {job.schedule}
                          </code>
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Next: {timeUntil(job.nextRun)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onRun?.(job.id) }}
                          className="p-1 rounded hover:opacity-80"
                          style={{ color: 'var(--color-primary)' }}
                          title="Run now"
                        >
                          <Play size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete?.(job.id) }}
                          className="p-1 rounded hover:opacity-80"
                          style={{ color: 'var(--color-error)' }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
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
                            className="px-3 pb-3 text-xs space-y-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <p><strong>Payload:</strong> {job.payload}</p>
                            {job.lastRun && <p><strong>Last run:</strong> {new Date(job.lastRun).toLocaleString()}</p>}
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
