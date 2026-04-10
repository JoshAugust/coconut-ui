import { Sun, Moon, Settings, ChevronRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useConnectionStore } from '../../stores/connection'
import { useThemeStore } from '../../stores/theme'

const routeLabels: Record<string, string> = {
  '/chat': 'Chat',
  '/dashboard': 'Dashboard',
  '/agents': 'Agents',
}

const statusColors: Record<string, string> = {
  connected: 'var(--color-success)',
  connecting: 'var(--color-warning)',
  reconnecting: 'var(--color-warning)',
  disconnected: 'var(--color-text-muted)',
  error: 'var(--color-error)',
}

const statusLabels: Record<string, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
  error: 'Error',
}

export function Header() {
  const location = useLocation()
  const status = useConnectionStore((s) => s.status)
  const { mode, toggleMode } = useThemeStore()

  const basePath = '/' + (location.pathname.split('/')[1] || 'chat')
  const pageLabel = routeLabels[basePath] || 'Chat'

  return (
    <header
      className="flex items-center justify-between px-5 h-14 shrink-0"
      style={{
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <span style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Coconut
        </span>
        <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ color: 'var(--color-text-primary)' }} className="text-sm font-medium">
          {pageLabel}
        </span>
      </div>

      {/* Center — reserved for command palette */}
      <div className="flex-1" />

      {/* Right — Status, theme toggle, settings */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: statusColors[status] || 'var(--color-text-muted)',
              boxShadow: status === 'connected' ? `0 0 6px ${statusColors[status]}` : undefined,
            }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {statusLabels[status] || status}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-md cursor-pointer"
          style={{
            color: 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded-md cursor-pointer"
          style={{
            color: 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
