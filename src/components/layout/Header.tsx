import { Sun, Moon, Command, Menu } from 'lucide-react'
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

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton }: HeaderProps) {
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
      className="flex items-center justify-between shrink-0"
      style={{
        height: '56px',
        padding: '0 16px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        zIndex: 'var(--z-header)' as any,
      }}
    >
      {/* Left: Hamburger (mobile) + Page title */}
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <motion.button
            onClick={onMenuClick}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              /* Touch-friendly: 44px minimum hit target */
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <Menu size={20} />
          </motion.button>
        )}
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {pageLabel}
        </h2>
      </div>

      {/* Right: Status + Controls */}
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div
            className="pulse-dot"
            style={{ background: color }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {isDemo ? 'Demo' : label}
          </span>
        </div>

        {/* Separator — hide on very small screens */}
        <div
          className="w-px h-4 hidden sm:block"
          style={{ background: 'var(--color-border)' }}
        />

        {/* Command palette hint — hide on mobile */}
        <motion.button
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 cursor-pointer"
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

        {/* Theme toggle — always visible, but touch-friendly size on mobile */}
        <motion.button
          onClick={toggleMode}
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.9, rotate: 180 }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            /* Touch-friendly */
            minWidth: '40px',
            minHeight: '40px',
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
