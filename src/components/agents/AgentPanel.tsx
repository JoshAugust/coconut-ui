import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bot, RefreshCw } from 'lucide-react'
import type { NormalizedAgent } from '../../types'
import { useConnectionStore } from '../../stores/connection'
import { AgentTree } from './AgentTree'

export function AgentPanel() {
  const [agents, setAgents] = useState<NormalizedAgent[]>([])
  const [loading, setLoading] = useState(true)
  const status = useConnectionStore((s) => s.status)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  const fetchAgents = useCallback(async () => {
    if (status !== 'connected') return
    try {
      const list = await getAdapter().listAgents()
      setAgents(list)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [status, getAdapter])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [fetchAgents])

  const activeCount = agents.filter((a) => a.status === 'running' || a.status === 'idle').length

  if (loading && agents.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ background: 'var(--color-bg-tertiary)' }}
          />
        ))}
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}
        >
          <Bot size={28} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            No active agents
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Sub-agents will appear here when spawned
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Active count + refresh */}
      <div className="flex items-center justify-between mb-4">
        {activeCount > 0 && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
          >
            {activeCount} active
          </span>
        )}
        {activeCount === 0 && <span />}
        <motion.button
          onClick={fetchAgents}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-md cursor-pointer"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      <AgentTree agents={agents} />
    </div>
  )
}
