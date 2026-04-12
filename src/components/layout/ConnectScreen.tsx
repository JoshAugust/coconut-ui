import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Loader2, AlertCircle, Zap, Shield } from 'lucide-react'
import { useConnectionStore } from '../../stores/connection'

export function ConnectScreen() {
  const { config, status, error, connect, connectDemo } = useConnectionStore()
  const [url, setUrl] = useState(config?.gatewayUrl || '')
  const [token, setToken] = useState(config?.token || '')
  const [agentName, setAgentName] = useState(config?.agentName || '')
  const connecting = status === 'connecting'

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !token) return
    try {
      await connect({ gatewayUrl: url, token, agentName: agentName || undefined })
    } catch { /* error state handled by store */ }
  }

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-bg" />
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow behind card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.06) 0%, rgba(129, 140, 248, 0.03) 40%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 relative"
        style={{
          borderRadius: '24px',
          padding: '44px',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(16, 185, 129, 0.03)',
        }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="inline-block text-5xl mb-3"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🥥
          </motion.div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Coconut
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Universal Agent Dashboard
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleConnect}>
          <div className="space-y-4">
            {/* Gateway URL */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Gateway URL
              </label>
              <div className="relative">
                <Wifi
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="wss://your-relay.up.railway.app"
                  disabled={connecting}
                  className="w-full pl-10 pr-4 py-3 text-sm outline-none connect-input"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '14px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-muted)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </motion.div>

            {/* Token */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Token
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Gateway auth token"
                  disabled={connecting}
                  className="w-full pl-10 pr-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '14px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-muted)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </motion.div>

            {/* Agent Name (optional) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Agent Name <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Brock"
                disabled={connecting}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '14px',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-muted)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </motion.div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: 'var(--color-error-muted)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connect button */}
          <motion.button
            type="submit"
            disabled={connecting || !url || !token}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 font-medium text-sm flex items-center justify-center gap-2 mt-6 text-white cursor-pointer"
            style={{
              background: connecting
                ? 'var(--color-primary-muted)'
                : 'linear-gradient(135deg, #10b981, #0891b2)',
              borderRadius: '14px',
              border: 'none',
              height: '44px',
              opacity: (!url || !token) ? 0.5 : 1,
              boxShadow: (!url || !token || connecting) ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            {connecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Zap size={16} />
                Connect
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Demo button */}
        <motion.button
          onClick={connectDemo}
          disabled={connecting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 font-medium text-sm mt-4 cursor-pointer"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all var(--transition-base)',
          }}
        >
          🥥 Try Demo Mode
        </motion.button>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Backend-agnostic · Works with any agent system
        </p>
      </motion.div>
    </div>
  )
}
