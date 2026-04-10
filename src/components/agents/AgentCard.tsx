import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, XCircle, Eye, Send } from 'lucide-react'
import type { NormalizedAgent } from '../../types'
import { AgentStatusBadge } from './AgentStatusBadge'
import { useConnectionStore } from '../../stores/connection'

interface AgentCardProps {
  agent: NormalizedAgent
  depth?: number
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(1)}K`
}

export function AgentCard({ agent, depth = 0 }: AgentCardProps) {
  const [showSteer, setShowSteer] = useState(false)
  const [steerText, setSteerText] = useState('')
  const [confirmKill, setConfirmKill] = useState(false)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  const handleSteer = async () => {
    if (!steerText.trim()) return
    try {
      await getAdapter().steerAgent(agent.id, steerText)
      setSteerText('')
      setShowSteer(false)
    } catch { /* ignore */ }
  }

  const handleKill = async () => {
    if (!confirmKill) {
      setConfirmKill(true)
      setTimeout(() => setConfirmKill(false), 3000)
      return
    }
    try {
      await getAdapter().killAgent(agent.id)
    } catch { /* ignore */ }
    setConfirmKill(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      style={{
        marginLeft: depth * 24,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        marginBottom: '8px',
      }}
      className="group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <AgentStatusBadge status={agent.status} />
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
        >
          {agent.model.split('/').pop()}
        </span>
      </div>

      {/* Task description */}
      {agent.task && (
        <p
          className="mt-2 text-sm line-clamp-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {agent.task}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>⏱ {formatElapsed(agent.elapsed_ms)}</span>
        {agent.tokenUsage && (
          <span>
            {formatTokens(agent.tokenUsage.input)} in / {formatTokens(agent.tokenUsage.output)} out
          </span>
        )}
        {agent.tokenUsage?.cost != null && (
          <span>${agent.tokenUsage.cost.toFixed(3)}</span>
        )}
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowSteer(!showSteer)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          title="Steer agent"
        >
          <MessageSquare size={14} />
        </button>
        <button
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-info)' }}
          title="View session"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={handleKill}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{
            background: confirmKill ? 'var(--color-error)' : 'var(--color-bg-tertiary)',
            color: confirmKill ? 'white' : 'var(--color-error)',
          }}
          title={confirmKill ? 'Click again to confirm' : 'Kill agent'}
        >
          <XCircle size={14} />
        </button>
      </div>

      {/* Steer input */}
      {showSteer && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="flex gap-2 mt-2"
        >
          <input
            type="text"
            value={steerText}
            onChange={(e) => setSteerText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSteer()}
            placeholder="Steer message..."
            className="flex-1 text-sm px-2 py-1 rounded outline-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            autoFocus
          />
          <button
            onClick={handleSteer}
            className="p-1.5 rounded"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <Send size={14} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
