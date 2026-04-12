import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeftClose, PanelLeft, Users, Brain, Gauge, Wrench, Calendar, Settings, X } from 'lucide-react'
import { useConnectionStore } from '../../stores/connection'
import { useThemeStore } from '../../stores/theme'
import { Sun, Moon } from 'lucide-react'
import { SessionList } from '../sessions/SessionList'
import { ChatView } from '../chat/ChatView'
import { AgentPanel } from '../agents/AgentPanel'
import { MemoryBrowser } from '../panels/MemoryBrowser'
import { DashboardView } from '../dashboard/DashboardView'
import { ToolTimeline } from '../tools/ToolTimeline'
import { CronScheduler } from '../panels/CronScheduler'
import { SettingsPanel } from '../panels/SettingsPanel'

type RightPanel = 'agents' | 'memory' | 'dashboard' | 'tools' | 'cron' | 'settings' | null

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

const rightPanelTabs: { id: RightPanel; icon: typeof Users; label: string }[] = [
  { id: 'agents', icon: Users, label: 'Agents' },
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'dashboard', icon: Gauge, label: 'Dashboard' },
  { id: 'tools', icon: Wrench, label: 'Tools' },
  { id: 'cron', icon: Calendar, label: 'Cron' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

function RightPanelContent({ panel }: { panel: RightPanel }) {
  switch (panel) {
    case 'agents': return <AgentPanel />
    case 'memory': return <MemoryBrowser />
    case 'dashboard': return <DashboardView />
    case 'tools': return <ToolTimeline toolCalls={[]} />
    case 'cron': return <CronScheduler />
    case 'settings': return <SettingsPanel />
    default: return null
  }
}

export function AppShell() {
  const isMobile = useIsMobile()
  const [leftOpen, setLeftOpen] = useState(!isMobile)
  const [rightPanel, setRightPanel] = useState<RightPanel>('agents')
  const { status, isDemo } = useConnectionStore()
  const { mode, toggleMode } = useThemeStore()

  useEffect(() => { setLeftOpen(!isMobile) }, [isMobile])

  const toggleRight = (panel: RightPanel) => {
    setRightPanel((cur) => cur === panel ? null : panel)
  }

  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full relative">
        {/* Aurora bg */}
        <div className="aurora-bg" />
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />

        {/* Header */}
        <MobileHeader
          onMenuClick={() => setLeftOpen(true)}
          isDemo={isDemo}
          status={status}
          mode={mode}
          toggleMode={toggleMode}
          rightPanel={rightPanel}
          onToggleRight={toggleRight}
        />

        {/* Chat */}
        <div className="flex-1 overflow-hidden relative">
          {rightPanel ? (
            <div className="h-full overflow-y-auto" style={{ background: 'var(--color-bg-primary)' }}>
              <div className="p-4">
                <RightPanelContent panel={rightPanel} />
              </div>
            </div>
          ) : (
            <ChatView />
          )}
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {leftOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLeftOpen(false)}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 40,
                }}
              />
              <motion.aside
                key="sheet"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="flex flex-col"
                style={{
                  position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, zIndex: 41,
                  background: 'var(--color-bg-secondary)',
                  borderRight: '1px solid var(--color-border)',
                }}
              >
                <LeftPanel onClose={() => setLeftOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Mobile bottom tabs */}
        <MobileBottomTabs rightPanel={rightPanel} onToggle={toggleRight} onChat={() => setRightPanel(null)} />
      </div>
    )
  }

  // Desktop: 3-panel
  return (
    <div className="flex h-full w-full relative">
      {/* Aurora bg */}
      <div className="aurora-bg" />
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />

      {/* Left Panel: Sessions */}
      <AnimatePresence mode="wait">
        {leftOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 overflow-hidden h-full"
            style={{
              background: 'var(--color-bg-secondary)',
              borderRight: '1px solid var(--color-border)',
            }}
          >
            <LeftPanel onClose={() => setLeftOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Left collapse toggle */}
      {!leftOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 p-2 z-10 cursor-pointer"
          style={{
            background: 'var(--color-glass)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
          }}
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLeftOpen(true)}
        >
          <PanelLeft size={18} />
        </motion.button>
      )}

      {/* Center: Chat + Header */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <DesktopHeader
          isDemo={isDemo}
          status={status}
          mode={mode}
          toggleMode={toggleMode}
          rightPanel={rightPanel}
          onToggleRight={toggleRight}
        />
        <div className="flex-1 overflow-hidden">
          <ChatView />
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence mode="wait">
        {rightPanel && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 overflow-hidden h-full flex flex-col"
            style={{
              background: 'var(--color-bg-secondary)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {/* Right panel header */}
            <div
              className="flex items-center justify-between px-4 h-14 shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {rightPanelTabs.find((t) => t.id === rightPanel)?.label}
              </span>
              <motion.button
                onClick={() => setRightPanel(null)}
                whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 cursor-pointer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Right panel content */}
            <div className="flex-1 overflow-y-auto p-4 scroll-fade">
              <RightPanelContent panel={rightPanel} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Sub-components ── */

function LeftPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div
        className="flex items-center justify-between px-5 h-14 shrink-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-secondary) 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🥥</span>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Coconut
          </span>
          <span
            className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-md"
            style={{
              color: 'var(--color-primary)',
              background: 'var(--color-primary-muted)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            Beta
          </span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          <PanelLeftClose size={16} />
        </motion.button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-3 pt-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 pb-2" style={{ color: 'var(--color-text-muted)' }}>
          Sessions
        </div>
        <SessionList />
      </div>
    </div>
  )
}

function DesktopHeader({
  isDemo, status, mode, toggleMode, rightPanel, onToggleRight,
}: {
  isDemo: boolean
  status: string
  mode: string
  toggleMode: () => void
  rightPanel: RightPanel
  onToggleRight: (p: RightPanel) => void
}) {
  const statusColor = status === 'connected' ? 'var(--color-success)' : 'var(--color-warning)'
  const statusLabel = isDemo ? 'Demo' : status === 'connected' ? 'Connected' : 'Disconnected'

  return (
    <header
      className="flex items-center justify-between shrink-0 px-4"
      style={{
        height: '48px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* Left: status */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: statusColor,
            boxShadow: status === 'connected' ? '0 0 6px rgba(52, 211, 153, 0.4)' : 'none',
          }}
        />
        <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {statusLabel}
        </span>
      </div>

      {/* Center: right panel tabs */}
      <div className="flex items-center gap-1">
        {rightPanelTabs.map(({ id, icon: Icon, label }) => {
          const active = rightPanel === id
          return (
            <motion.button
              key={id}
              onClick={() => onToggleRight(id)}
              whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer"
              style={{
                background: active ? 'var(--color-bg-elevated)' : 'transparent',
                border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRadius: '10px',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s ease',
                boxShadow: active ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
              }}
              title={label}
            >
              <Icon size={14} />
              <span className="hidden lg:inline">{label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Right: theme toggle */}
      <motion.button
        onClick={toggleMode}
        whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
        whileTap={{ scale: 0.9 }}
        className="p-2 cursor-pointer"
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </motion.button>
    </header>
  )
}

function MobileHeader({
  onMenuClick, isDemo, status, mode, toggleMode,
}: {
  onMenuClick: () => void
  isDemo: boolean
  status: string
  mode: string
  toggleMode: () => void
  rightPanel?: RightPanel
  onToggleRight?: (p: RightPanel) => void
}) {
  const statusColor = status === 'connected' ? 'var(--color-success)' : 'var(--color-warning)'

  return (
    <header
      className="flex items-center justify-between shrink-0 px-3"
      style={{
        height: '52px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <motion.button
        onClick={onMenuClick}
        whileTap={{ scale: 0.9 }}
        className="p-2 cursor-pointer"
        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)' }}
      >
        <PanelLeft size={20} />
      </motion.button>

      <div className="flex items-center gap-1.5">
        <div className="pulse-dot" style={{ background: statusColor }} />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {isDemo ? 'Demo' : 'Connected'}
        </span>
      </div>

      <motion.button
        onClick={toggleMode}
        whileTap={{ scale: 0.9 }}
        className="p-2 cursor-pointer"
        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)' }}
      >
        {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </motion.button>
    </header>
  )
}

function MobileBottomTabs({
  rightPanel, onToggle, onChat,
}: {
  rightPanel: RightPanel
  onToggle: (p: RightPanel) => void
  onChat: () => void
}) {
  const items: { id: RightPanel | 'chat'; icon: React.ElementType; label: string }[] = [
    { id: 'chat', icon: () => <span style={{ fontSize: 18 }}>💬</span>, label: 'Chat' },
    { id: 'agents', icon: Users, label: 'Agents' },
    { id: 'memory', icon: Brain, label: 'Memory' },
    { id: 'dashboard', icon: Gauge, label: 'Dash' },
    { id: 'cron', icon: Calendar, label: 'Cron' },
  ]

  return (
    <nav
      className="flex items-center justify-around shrink-0"
      style={{
        height: '56px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const active = id === 'chat' ? rightPanel === null : rightPanel === id
        return (
          <button
            key={id}
            onClick={() => id === 'chat' ? onChat() : onToggle(id as RightPanel)}
            className="flex flex-col items-center gap-0.5 py-1 flex-1 cursor-pointer"
            style={{
              background: 'transparent',
              border: 'none',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '10px',
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
