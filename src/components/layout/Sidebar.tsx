import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  PanelLeftClose,
  Brain,
  Wrench,
  Calendar,
  Settings,
} from 'lucide-react'
import { SessionList } from '../sessions/SessionList'

interface SidebarProps {
  onCollapse: () => void
}

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Users, label: 'Agents' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/cron', icon: Calendar, label: 'Scheduler' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ onCollapse }: SidebarProps) {
  const location = useLocation()

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full glass-lg"
      style={{
        borderRight: '1px solid var(--color-glass-border)',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(var(--glass-blur-xl))',
        WebkitBackdropFilter: 'blur(var(--glass-blur-xl))',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-16 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          🥥
        </motion.span>
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Coconut
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="no-underline"
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                className="relative flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-md)',
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  transition: 'color var(--transition-fast)',
                }}
                whileHover={{
                  backgroundColor: 'var(--color-bg-hover)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-active)',
                      border: '1px solid var(--color-glass-border)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={18} style={{ position: 'relative', zIndex: 1 }} />
                <span
                  className="text-sm font-medium"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {label}
                </span>
                {/* Active dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full relative z-[1]"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 pt-5 min-h-0">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.1em] px-3 pb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sessions
        </div>
        <SessionList />
      </div>

      {/* Collapse toggle */}
      <div
        className="px-3 pb-3 pt-2 shrink-0"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <motion.button
          onClick={onCollapse}
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 w-full px-3 py-2.5 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-md)',
          }}
          title="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
          <span className="text-sm">Collapse</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
