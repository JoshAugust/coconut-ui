import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, Loader2, AlertCircle } from 'lucide-react'
import { useConnectionStore } from '../../stores/connection'

export function ConnectScreen() {
  const { config, status, error, connect } = useConnectionStore()
  const [url, setUrl] = useState(config?.gatewayUrl || '')
  const [token, setToken] = useState(config?.token || '')
  const [agentName, setAgentName] = useState(config?.agentName || '')
  const connecting = status === 'connecting'

  // Auto-connect if we have saved config
  useEffect(() => {
    if (config?.gatewayUrl && config?.token && status === 'disconnected') {
      connect(config).catch(() => { /* show error */ })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !token.trim()) return
    try {
      await connect({ gatewayUrl: url.trim(), token: token.trim(), agentName: agentName.trim() || undefined })
    } catch {
      // Error is set in store
    }
  }

  return (
    <div
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, var(--color-primary) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, var(--color-accent) 0%, transparent 50%)',
          filter: 'blur(80px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))` }}
            >
              <span className="text-3xl">🥥</span>
            </motion.div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Coconut
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Connect to your agent
            </p>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Gateway URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ws://127.0.0.1:19789"
                disabled={connecting}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your gateway token"
                disabled={connecting}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Agent Name <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Brock"
                disabled={connecting}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={connecting || !url.trim() || !token.trim()}
              className="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: connecting
                  ? 'var(--color-bg-tertiary)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: connecting ? 'var(--color-text-muted)' : 'white',
              }}
            >
              {connecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi size={16} />
                  Connect
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Coconut — Universal Agent Dashboard
          </p>
        </div>
      </motion.div>
    </div>
  )
}
