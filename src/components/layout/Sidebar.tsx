import { NavLink } from 'react-router-dom'
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  PanelLeftClose,
  Brain,
  Wrench,
  Calendar,
} from 'lucide-react'

// SessionList may not exist yet — wrap in lazy import
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
]

export function Sidebar({ onCollapse }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Title */}
      <div
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <span className="text-2xl">🥥</span>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Coconut
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2 pt-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="no-underline"
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--color-bg-hover)' : 'transparent',
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pt-4 min-h-0">
        <div
          className="text-xs font-medium uppercase tracking-wider px-3 pb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sessions
        </div>
        <SessionList />
      </div>

      {/* Collapse toggle */}
      <div
        className="px-2 pb-3 pt-2 shrink-0"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={onCollapse}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
          <span className="text-sm">Collapse</span>
        </button>
      </div>
    </div>
  )
}
