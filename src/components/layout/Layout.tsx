import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeft } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  // Desktop: sidebar starts open. Mobile: sidebar starts closed (bottom nav is primary nav)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const location = useLocation()

  // When viewport changes, reset sidebar state
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  // On mobile, close the sidebar overlay when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  return (
    <div
      className="flex h-full w-full relative"
      style={{ paddingBottom: isMobile ? '60px' : 0 }}
    >
      {/* Aurora background (persists across pages) */}
      <div className="aurora-bg" />
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />

      {/* ── MOBILE: Sidebar as overlay sheet ── */}
      {isMobile && (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  zIndex: 'var(--z-modal)' as any,
                }}
              />
              {/* Sheet */}
              <motion.aside
                key="mobile-sheet"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 280,
                  zIndex: 'calc(var(--z-modal) + 1)' as any,
                }}
              >
                <Sidebar onCollapse={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      {/* ── DESKTOP: Persistent sidebar ── */}
      {!isMobile && (
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 overflow-hidden"
              style={{ zIndex: 'var(--z-sidebar)' as any }}
            >
              <Sidebar onCollapse={() => setSidebarOpen(false)} />
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Collapsed sidebar toggle (desktop only) */}
      {!isMobile && !sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 left-4 p-2 cursor-pointer"
          style={{
            zIndex: 'var(--z-header)' as any,
            background: 'var(--color-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
          }}
          whileHover={{ backgroundColor: 'var(--color-glass-hover)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeft size={18} />
        </motion.button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton={isMobile} />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <MobileBottomNav />}
    </div>
  )
}
