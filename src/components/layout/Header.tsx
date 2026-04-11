import { Sun, Moon, Command } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useConnectionStore } from '../../stores/connection'
import { useThemeStore } from '../../stores/theme'

const routeLabels: Record<string, string> = {
  '/chat': 'Chat',
  '/dashboard': 'Dashboard',
  '/agents': 'Agents',
  '/memory': 'Memory',
  '/tools': 'Tools',
  '/cron': 'Scheduler',
  '/settings': 'Settings',
}

const statusConfig: Record<string, { color: string; label: string }> = {
  connected: { color: 'var(--color-success)', label: 'Connected' },
  connecting: { color: 'var(--color-warning)', label: 'Connecting…' },
  reconnecting: { color: 'var(--color-warning)', label: 'Reconnecting…' },
  disconnected: { color: 'var(--color-text-muted)', label: 'Disconnected' },
  error: { color: 'var(--color-error)', label: 'Error' },
}

export function Header() {
  const location = useLocation()
  const { status, isDemo } = useConnectionStore()
  const { mode, toggleMode } = useThemeStore()
  const { color, label } = statusConfig[status] || statusConfig.disconnected
  const pageLabel = routeLabels[location.pathname] || 'Coconut'

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between h-14 px-5 shrink-0"
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        zIndex: 'var(--z-header)',
      }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {pageLabel}
        </h2>
      </div>

      {/* Right: Status + Controls */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div
            className="pulse-dot"
            style={{ background: color }}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {isDemo ? 'Demo' : label}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />

        {/* Command palette hint */}
        <motion.button
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
          }}
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
        >
          <Command size={12} />
          <span className="text-[10px] font-medium">K</span>
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleMode}
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.9, rotate: 180 }}
          className="p-2 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
          }}
          title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          <motion.div
            initial={false}
            animate={{ rotate: mode === 'dark' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.div>
        </motion.button>
      </div>
    </motion.header>
  )
}
