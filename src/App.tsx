import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './stores/theme'
import { useConnectionStore } from './stores/connection'
import { Layout } from './components/layout/Layout'
import { ConnectScreen } from './components/layout/ConnectScreen'
import { ChatView } from './components/chat/ChatView'
import { DashboardView } from './components/dashboard/DashboardView'

function App() {
  const mode = useThemeStore((s) => s.mode)
  const status = useConnectionStore((s) => s.status)

  return (
    <div data-theme={mode} className="h-full w-full" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <BrowserRouter>
        {status === 'connected' ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatView />} />
              <Route path="/chat/:sessionId" element={<ChatView />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </Layout>
        ) : (
          <ConnectScreen />
        )}
      </BrowserRouter>
    </div>
  )
}

export default App
