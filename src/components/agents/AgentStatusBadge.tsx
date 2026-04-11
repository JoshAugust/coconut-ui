import { motion } from 'framer-motion'
import type { AgentStatus } from '../../types'

const statusConfig: Record<
  AgentStatus,
  { color: string; glow: string; label: string; animate: boolean; pulse: boolean }
> = {
  running: {
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    label: 'Running',
    animate: true,
    pulse: true,
  },
  idle: {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    label: 'Idle',
    animate: false,
    pulse: true,
  },
  completed: {
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    label: 'Completed',
    animate: false,
    pulse: false,
  },
  failed: {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.4)',
    label: 'Failed',
    animate: false,
    pulse: false,
  },
  killed: {
    color: '#6b7280',
    glow: 'rgba(107,114,128,0.25)',
    label: 'Killed',
    animate: false,
    pulse: false,
  },
}

interface AgentStatusBadgeProps {
  status: AgentStatus
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function AgentStatusBadge({
  status,
  size = 'sm',
  showLabel = true,
}: AgentStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.idle
  const dotSize = size === 'sm' ? 8 : 10
  const fontSize = size === 'sm' ? '0.75rem' : '0.8125rem'

  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ fontSize, color: config.color }}
    >
      {/* Animated dot */}
      <span className="relative inline-flex" style={{ width: dotSize, height: dotSize }}>
        {/* Pulse ring — only for running/idle */}
        {config.pulse && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: config.color }}
            animate={{
              opacity: [0.6, 0],
              scale: [1, config.animate ? 2.4 : 1.8],
            }}
            transition={{
              duration: config.animate ? 1.2 : 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Second pulse ring for running (double-ring effect) */}
        {config.animate && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: config.color }}
            animate={{ opacity: [0.4, 0], scale: [1, 2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.4,
            }}
          />
        )}

        {/* Core dot */}
        <span
          className="relative rounded-full z-10"
          style={{
            width: dotSize,
            height: dotSize,
            background: config.color,
            boxShadow: `0 0 ${size === 'sm' ? 6 : 8}px ${config.glow}`,
          }}
        />
      </span>

      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
