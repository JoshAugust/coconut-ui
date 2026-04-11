import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, XCircle, Eye, Send, Cpu, Coins, Timer } from 'lucide-react'
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

/** Left-border + glow color by status */
const statusAccent: Record<string, { border: string; glow: string }> = {
  running:   { border: '#3b82f6', glow: 'rgba(59,130,246,0.12)' },
  idle:      { border: '#f59e0b', glow: 'rgba(245,158,11,0.10)' },
  completed: { border: '#10b981', glow: 'rgba(16,185,129,0.10)' },
  failed:    { border: '#ef4444', glow: 'rgba(239,68,68,0.12)' },
  killed:    { border: '#6b7280', glow: 'rgba(107,114,128,0.08)' },
}

export function AgentCard({ agent, depth = 0 }: AgentCardProps) {
  const [showSteer, setShowSteer] = useState(false)
  const [steerText, setSteerText] = useState('')
  const [confirmKill, setConfirmKill] = useState(false)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  const accent = statusAccent[agent.status] ?? statusAccent.idle

  const handleSteer = async () => {
    if (!steerText.trim()) return
    try {
      await getAdapter().steerAgent(agent.id, steerText)
      setSteerText('')
      setShowSteer(false)
    } catch {
      /* ignore */
    }
  }

  const handleKill = async () => {
    if (!confirmKill) {
      setConfirmKill(true)
      setTimeout(() => setConfirmKill(false), 3000)
      return
    }
    try {
      await getAdapter().killAgent(agent.id)
    } catch {
      /* ignore */
    }
    setConfirmKill(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.98 }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      style={{ marginLeft: depth * 24, marginBottom: '8px' }}
      className="group relative"
    >
      {/* Card */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-elevated)',
          border: `1px solid var(--color-border)`,
          borderLeft: `3px solid ${accent.border}`,
          boxShadow: `0 4px 20px ${accent.glow}, 0 1px 4px rgba(0,0,0,0.2)`,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Subtle glow sweep on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accent.glow} 0%, transparent 70%)`,
            transition: 'opacity 0.3s ease',
          }}
        />

        <div className="relative px-5 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <AgentStatusBadge status={agent.status} />
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {agent.model.split('/').pop()}
            </span>
          </div>

          {/* Task description */}
          {agent.task && (
            <p
              className="mt-2 line-clamp-2"
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)',
              }}
            >
              {agent.task}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Timer size={11} />
              <span>{formatElapsed(agent.elapsed_ms)}</span>
            </div>

            {agent.tokenUsage && (
              <div
                className="flex items-center gap-1 text-[11px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Cpu size={11} />
                <span>
                  {formatTokens(agent.tokenUsage.input)}↑ {formatTokens(agent.tokenUsage.output)}↓
                </span>
              </div>
            )}

            {agent.tokenUsage?.cost != null && (
              <div
                className="flex items-center gap-1 text-[11px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Coins size={11} />
                <span>${agent.tokenUsage.cost.toFixed(3)}</span>
              </div>
            )}
          </div>

          {/* Action buttons — appear on hover */}
          <motion.div
            className="flex items-center gap-1 mt-3"
            initial={{ opacity: 0, y: 4 }}
            whileHover={{ opacity: 1, y: 0 }}
            style={{ opacity: 0 }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
              <button
                onClick={() => setShowSteer(!showSteer)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
                style={{
                  background: showSteer ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  color: showSteer ? 'white' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                title="Steer agent"
              >
                <MessageSquare size={11} />
                <span>Steer</span>
              </button>

              <button
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-info)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                title="View session"
              >
                <Eye size={11} />
                <span>View</span>
              </button>

              <button
                onClick={handleKill}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
                style={{
                  background: confirmKill
                    ? 'rgba(239,68,68,0.2)'
                    : 'var(--color-bg-tertiary)',
                  color: 'var(--color-error)',
                  border: confirmKill
                    ? '1px solid var(--color-error)'
                    : '1px solid var(--color-border-subtle)',
                }}
                title={confirmKill ? 'Click again to confirm kill' : 'Kill agent'}
              >
                <XCircle size={11} />
                <span>{confirmKill ? 'Confirm?' : 'Kill'}</span>
              </button>
            </div>
          </motion.div>

          {/* Steer input */}
          <AnimatePresence>
            {showSteer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="flex gap-2 mt-3 p-2 rounded-lg"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <input
                    type="text"
                    value={steerText}
                    onChange={(e) => setSteerText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSteer()}
                    placeholder="Steer this agent..."
                    className="flex-1 text-xs px-2 py-1 rounded outline-none bg-transparent"
                    style={{ color: 'var(--color-text-primary)' }}
                    autoFocus
                  />
                  <button
                    onClick={handleSteer}
                    className="p-1.5 rounded-md transition-all"
                    style={{
                      background: steerText.trim()
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-elevated)',
                      color: steerText.trim() ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    <Send size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
