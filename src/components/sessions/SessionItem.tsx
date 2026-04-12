import { motion } from 'framer-motion'
import { MessageSquare, Hash, Radio } from 'lucide-react'
import type { NormalizedSession } from '../../types'
import { useSessionsStore } from '../../stores/sessions'

interface SessionItemProps {
  session: NormalizedSession
  index?: number
}

const statusColors: Record<string, string> = {
  active: 'var(--color-success)',
  idle: 'var(--color-warning)',
  error: 'var(--color-error)',
  archived: 'var(--color-text-muted)',
}

const channelIcons: Record<string, React.ElementType> = {
  telegram: MessageSquare,
  discord: Hash,
  default: Radio,
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function SessionItem({ session, index = 0 }: SessionItemProps) {
  const { activeSessionId, setActiveSession } = useSessionsStore()
  const isActive = activeSessionId === session.id
  const ChannelIcon = channelIcons[session.channel || 'default'] || channelIcons.default
  const isLive = session.status === 'active'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => setActiveSession(session.id)}
      className="flex items-start gap-3 cursor-pointer"
      style={{
        padding: '10px 12px',
        background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
        borderRadius: 'var(--radius-lg)',
        borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        marginBottom: '2px',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Channel icon */}
      <ChannelIcon size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '2px' }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="truncate text-[13px] font-medium"
            style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          >
            {session.label || `Session ${session.id.slice(0, 8)}`}
          </span>
          <span
            className="flex-shrink-0 tabular-nums text-[11px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {timeAgo(session.lastMessageAt)}
          </span>
        </div>
        {session.lastMessagePreview && (
          <p
            className="truncate mt-1 text-[12px] leading-[1.4]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {session.lastMessagePreview}
          </p>
        )}
      </div>

      {/* Status dot */}
      <span
        className={isLive ? 'session-dot-pulse' : ''}
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: 'var(--radius-full)',
          flexShrink: 0,
          marginTop: '6px',
          background: statusColors[session.status] || 'var(--color-text-muted)',
        }}
      />
    </motion.div>
  )
}
