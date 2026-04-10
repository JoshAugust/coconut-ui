import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Sun, Moon, LogOut, Palette, User, Server } from 'lucide-react'
import { useThemeStore } from '../../stores/theme'
import { useConnectionStore } from '../../stores/connection'

export function SettingsPanel() {
  const { mode, toggleMode, config: themeConfig, setConfig } = useThemeStore()
  const { config, status, disconnect, isDemo } = useConnectionStore()
  const [agentName, setAgentName] = useState(themeConfig.agentName)
  const [userTitle, setUserTitle] = useState(themeConfig.userTitle)

  const handleSavePersonalization = () => {
    setConfig({ agentName, userTitle })
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings size={24} style={{ color: 'var(--color-text-primary)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Settings
          </h1>
        </div>

        {/* Connection section */}
        <Section title="Connection" icon={<Server size={16} />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Status
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {isDemo ? 'Demo mode' : (config?.gatewayUrl || 'Not configured')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: status === 'connected' ? 'var(--color-success)' : 'var(--color-error)',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {status}
              </span>
            </div>
          </div>

          <button
            onClick={disconnect}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mt-3"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-error)',
              border: '1px solid var(--color-border)',
            }}
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </Section>

        {/* Appearance section */}
        <Section title="Appearance" icon={<Palette size={16} />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Theme
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Switch between dark and light mode
              </p>
            </div>
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {mode === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </Section>

        {/* Personalization section */}
        <Section title="Personalization" icon={<User size={16} />}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Brock"
                className="w-full px-3 py-2 rounded-lg text-sm mt-1 outline-none"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                User Title
              </label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                placeholder="Tribal Chief"
                className="w-full px-3 py-2 rounded-lg text-sm mt-1 outline-none"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <button
              onClick={handleSavePersonalization}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Save
            </button>
          </div>
        </Section>

        {/* About */}
        <Section title="About" icon={<span className="text-sm">🥥</span>}>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Coconut v0.1.0
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Universal Agent Dashboard — built by agents, for agents.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Backend-agnostic adapter pattern. Works with Eragon, OpenFang, or any system
              that speaks the common protocol.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-xl"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  )
}
