import { Loader2, CheckCircle, XCircle, Slash, Clock } from 'lucide-react'
import type { AgentStatus } from '../../types'

const statusConfig: Record<AgentStatus, { icon: React.ElementType; color: string; label: string }> = {
  running: { icon: Loader2, color: '#3b82f6', label: 'Running' },
  idle: { icon: Clock, color: '#f59e0b', label: 'Idle' },
  completed: { icon: CheckCircle, color: '#10b981', label: 'Completed' },
  failed: { icon: XCircle, color: '#ef4444', label: 'Failed' },
  killed: { icon: Slash, color: '#6b7280', label: 'Killed' },
}

interface AgentStatusBadgeProps {
  status: AgentStatus
  size?: 'sm' | 'md'
}

export function AgentStatusBadge({ status, size = 'sm' }: AgentStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const iconSize = size === 'sm' ? 12 : 16
  const fontSize = size === 'sm' ? '0.75rem' : '0.8125rem'

  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ color: config.color, fontSize }}
    >
      <Icon
        size={iconSize}
        className={status === 'running' ? 'animate-spin' : ''}
      />
      <span>{config.label}</span>
    </span>
  )
}
