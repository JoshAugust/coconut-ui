import { useState, useEffect } from 'react'
import { Activity, Users, MessageSquare, DollarSign, Wifi, Clock } from 'lucide-react'
import { useConnectionStore } from '../../stores/connection'
import type { SystemStatus, ContextPressure } from '../../types'
import { StatusCard } from './StatusCard'
import { ContextGauge } from './ContextGauge'
import { AgentPanel } from '../agents/AgentPanel'

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function DashboardView() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [pressure, setPressure] = useState<ContextPressure | null>(null)
  const [loading, setLoading] = useState(true)
  const status = useConnectionStore((s) => s.status)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  useEffect(() => {
    if (status !== 'connected') return

    const fetchStatus = async () => {
      try {
        const [sys, ctx] = await Promise.all([
          getAdapter().getStatus(),
          getAdapter().getContextPressure('main'),
        ])
        setSystemStatus(sys)
        setPressure(ctx)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [status, getAdapter])

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Dashboard
      </h1>

      {loading && !systemStatus ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ background: 'var(--color-bg-tertiary)' }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Status cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatusCard
              icon={<Wifi size={20} />}
              label="Connection"
              value={status === 'connected' ? 'Connected' : status}
              subtitle={systemStatus?.version ? `v${systemStatus.version}` : undefined}
              color="#10b981"
            />
            <StatusCard
              icon={<Clock size={20} />}
              label="Uptime"
              value={systemStatus ? formatUptime(systemStatus.uptime_ms) : '—'}
              color="#6366f1"
            />
            <StatusCard
              icon={<Users size={20} />}
              label="Active Agents"
              value={systemStatus?.activeAgents ?? 0}
              color="#3b82f6"
            />
            <StatusCard
              icon={<MessageSquare size={20} />}
              label="Sessions"
              value={systemStatus?.activeSessions ?? 0}
              color="#8b5cf6"
            />
            <StatusCard
              icon={<DollarSign size={20} />}
              label="Cost Today"
              value={systemStatus ? `$${systemStatus.costToday.toFixed(2)}` : '—'}
              subtitle={systemStatus ? `$${systemStatus.costThisMonth.toFixed(2)} this month` : undefined}
              color="#f59e0b"
            />
            <StatusCard
              icon={<Activity size={20} />}
              label="Channels"
              value={systemStatus?.connectedChannels?.length ?? 0}
              subtitle={systemStatus?.connectedChannels?.join(', ') || 'None'}
              color="#ec4899"
            />
          </div>

          {/* Context Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ContextGauge pressure={pressure} />
          </div>

          {/* Agent Panel */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', height: '400px' }}
          >
            <AgentPanel />
          </div>
        </>
      )}
    </div>
  )
}
