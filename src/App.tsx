import { useThemeStore } from './stores/theme'
import { useConnectionStore } from './stores/connection'
import { ConnectScreen } from './components/layout/ConnectScreen'
import { AppShell } from './components/layout/AppShell'
import { CommandPalette } from './components/common/CommandPalette'

function App() {
  const mode = useThemeStore((s) => s.mode)
  const status = useConnectionStore((s) => s.status)

  return (
    <div data-theme={mode} className="h-full w-full" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {status === 'connected' ? (
        <>
          <CommandPalette />
          <AppShell />
        </>
      ) : (
        <ConnectScreen />
      )}
    </div>
  )
}

export default App
