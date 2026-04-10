import { motion } from 'framer-motion'
import type { ContextPressure } from '../../types'

interface ContextGaugeProps {
  pressure: ContextPressure | null
}

const levelColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

export function ContextGauge({ pressure }: ContextGaugeProps) {
  if (!pressure) {
    return (
      <div
        className="p-4 rounded-xl"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Context Window
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Not available
        </p>
      </div>
    )
  }

  const color = levelColors[pressure.level] || levelColors.low
  const percentage = Math.min(pressure.percentage, 100)

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Context Window
        </p>
        <span className="text-xs font-bold" style={{ color }}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--color-bg-tertiary)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {(pressure.used / 1000).toFixed(0)}K tokens
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {(pressure.total / 1000).toFixed(0)}K limit
        </span>
      </div>
    </div>
  )
}
