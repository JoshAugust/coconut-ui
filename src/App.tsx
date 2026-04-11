import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './stores/theme'
import { useConnectionStore } from './stores/connection'
import { Layout } from './components/layout/Layout'
import { ConnectScreen } from './components/layout/ConnectScreen'
import { ChatView } from './components/chat/ChatView'
import { DashboardView } from './components/dashboard/DashboardView'
import { AgentPanel } from './components/agents/AgentPanel'
import { MemoryBrowser } from './components/panels/MemoryBrowser'
import { CronScheduler } from './components/panels/CronScheduler'
import { ToolTimeline } from './components/tools/ToolTimeline'
import { SettingsPanel } from './components/panels/SettingsPanel'
import { CommandPalette } from './components/common/CommandPalette'

function App() {
  const mode = useThemeStore((s) => s.mode)
  const status = useConnectionStore((s) => s.status)

  return (
    <div data-theme={mode} className="h-full w-full" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <BrowserRouter basename="/coconut-ui">
        {status === 'connected' ? (
          <>
            <CommandPalette />
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatView />} />
                <Route path="/chat/:sessionId" element={<ChatView />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/agents" element={<PageShell><AgentPanel /></PageShell>} />
                <Route path="/memory" element={<PageShell><MemoryBrowser /></PageShell>} />
                <Route path="/tools" element={<PageShell><ToolTimeline toolCalls={[]} /></PageShell>} />
                <Route path="/cron" element={<PageShell><CronScheduler /></PageShell>} />
                <Route path="/settings" element={<SettingsPanel />} />
                <Route path="*" element={<Navigate to="/chat" replace />} />
              </Routes>
            </Layout>
          </>
        ) : (
          <ConnectScreen />
        )}
      </BrowserRouter>
    </div>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full" style={{ background: 'var(--color-bg-primary)' }}>
      {children}
    </div>
  )
}

export default App
