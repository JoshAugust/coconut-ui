import { motion } from 'framer-motion'
import { MessageSquare, Hash, Radio } from 'lucide-react'
import type { NormalizedSession } from '../../types'
import { useSessionsStore } from '../../stores/sessions'

interface SessionItemProps {
  session: NormalizedSession
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

export function SessionItem({ session }: SessionItemProps) {
  const { activeSessionId, setActiveSession } = useSessionsStore()
  const isActive = activeSessionId === session.id
  const ChannelIcon = channelIcons[session.channel || 'default'] || channelIcons.default

  return (
    <motion.div
      layout
      onClick={() => setActiveSession(session.id)}
      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md transition-all"
      style={{
        background: isActive ? 'var(--color-bg-hover)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
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
      <ChannelIcon size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className="text-xs font-medium truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {session.label || `Session ${session.id.slice(0, 8)}`}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {timeAgo(session.lastMessageAt)}
          </span>
        </div>
        {session.lastMessagePreview && (
          <p
            className="text-[11px] truncate mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {session.lastMessagePreview}
          </p>
        )}
      </div>

      {/* Status dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: statusColors[session.status] || 'var(--color-text-muted)' }}
      />
    </motion.div>
  )
}
