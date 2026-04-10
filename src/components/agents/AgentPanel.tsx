import { useState, useEffect, useCallback } from 'react'
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

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Sub-Agents
          </h2>
          {activeCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={fetchAgents}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && agents.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded animate-pulse"
                style={{ background: 'var(--color-bg-tertiary)' }}
              />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <Bot size={48} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No active agents
            </p>
          </div>
        ) : (
          <AgentTree agents={agents} />
        )}
      </div>
    </div>
  )
}
