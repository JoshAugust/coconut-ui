import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  Brain,
  Calendar,
} from 'lucide-react'

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { to: '/agents', icon: Users, label: 'Agents' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/cron', icon: Calendar, label: 'Cron' },
]

export function MobileBottomNav() {
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(var(--glass-blur-xl))',
        WebkitBackdropFilter: 'blur(var(--glass-blur-xl))',
        borderTop: '1px solid var(--color-glass-border)',
        zIndex: 'var(--z-header)' as any,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            className="no-underline"
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center gap-0.5 py-2 relative"
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  style={{
                    position: 'absolute',
                    inset: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-active)',
                    border: '1px solid var(--color-glass-border)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Icon size={20} />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: '10px',
                  position: 'relative',
                  zIndex: 1,
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </motion.span>
            </motion.div>
          </NavLink>
        )
      })}
    </motion.nav>
  )
}
