import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeft } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-full w-full relative">
      {/* Aurora background (persists across pages) */}
      <div className="aurora-bg" />
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 overflow-hidden"
            style={{ zIndex: 'var(--z-sidebar)' }}
          >
            <Sidebar onCollapse={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed sidebar toggle */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 left-4 p-2 cursor-pointer"
          style={{
            zIndex: 'var(--z-header)',
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
        <Header />
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
    </div>
  )
}
