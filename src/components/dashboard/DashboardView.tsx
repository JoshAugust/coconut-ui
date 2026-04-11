import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, MessageSquare, DollarSign, Wifi, Clock, RefreshCw } from 'lucide-react'
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export function DashboardView() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [pressure, setPressure] = useState<ContextPressure | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const status = useConnectionStore((s) => s.status)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  const fetchStatus = async (showRefresh = false) => {
    if (status !== 'connected') return
    if (showRefresh) setRefreshing(true)
    try {
      const [sys, ctx] = await Promise.all([
        getAdapter().getStatus(),
        getAdapter().getContextPressure('main'),
      ])
      setSystemStatus(sys)
      setPressure(ctx)
      setLastUpdated(new Date())
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (status !== 'connected') return
    fetchStatus()
    const interval = setInterval(() => fetchStatus(), 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">

        {/* Compact status line */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {status === 'connected' ? (
              <>
                <span style={{ color: 'var(--color-success)' }}>●</span>{' '}
                Live{lastUpdated ? ` · ${formatTime(lastUpdated)}` : ''}
              </>
            ) : (
              <>
                <span style={{ color: 'var(--color-error)' }}>●</span>{' '}
                Disconnected
              </>
            )}
          </span>
          <motion.button
            onClick={() => fetchStatus(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || refreshing}
            className="p-1.5 cursor-pointer disabled:opacity-40"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              borderRadius: '8px',
            }}
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw size={14} />
            </motion.div>
          </motion.button>
        </div>

        {/* Status cards grid */}
        {loading && !systemStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-28 rounded-xl"
                style={{
                  background: 'var(--color-glass)',
                  border: '1px solid var(--color-glass-border)',
                  backdropFilter: 'blur(var(--glass-blur))',
                  WebkitBackdropFilter: 'blur(var(--glass-blur))',
                }}
              >
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-7 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-2 w-32 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: <Wifi size={18} />,
                  label: 'Connection',
                  value: status === 'connected' ? 'Online' : status,
                  subtitle: systemStatus?.version ? `Gateway v${systemStatus.version}` : undefined,
                  color: '#10b981',
                },
                {
                  icon: <Clock size={18} />,
                  label: 'Uptime',
                  value: systemStatus ? formatUptime(systemStatus.uptime_ms) : '—',
                  color: '#6366f1',
                },
                {
                  icon: <Users size={18} />,
                  label: 'Active Agents',
                  value: systemStatus?.activeAgents ?? 0,
                  color: '#3b82f6',
                },
                {
                  icon: <MessageSquare size={18} />,
                  label: 'Sessions',
                  value: systemStatus?.activeSessions ?? 0,
                  color: '#8b5cf6',
                },
                {
                  icon: <DollarSign size={18} />,
                  label: 'Cost Today',
                  value: systemStatus ? `$${systemStatus.costToday.toFixed(2)}` : '—',
                  subtitle: systemStatus ? `$${systemStatus.costThisMonth.toFixed(2)} this month` : undefined,
                  color: '#f59e0b',
                },
                {
                  icon: <Activity size={18} />,
                  label: 'Channels',
                  value: systemStatus?.connectedChannels?.length ?? 0,
                  subtitle: systemStatus?.connectedChannels?.join(', ') || 'None',
                  color: '#ec4899',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <StatusCard {...card} index={i} />
                </motion.div>
              ))}
            </div>

            {/* Context Gauge + System Info row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <ContextGauge pressure={pressure} />

              {/* System info card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative rounded-xl p-5"
                style={{
                  background: 'var(--color-glass)',
                  backdropFilter: 'blur(var(--glass-blur))',
                  WebkitBackdropFilter: 'blur(var(--glass-blur))',
                  border: '1px solid var(--color-glass-border)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
                  }}
                />

                <p className="text-xs font-medium tracking-wide uppercase mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  System Info
                </p>

                <div className="space-y-3">
                  {systemStatus ? (
                    <>
                      {[
                        { label: 'Version', value: systemStatus.version ? `v${systemStatus.version}` : 'Unknown' },
                        { label: 'Uptime', value: formatUptime(systemStatus.uptime_ms) },
                        { label: 'Channels', value: systemStatus.connectedChannels?.join(', ') || 'None' },
                        { label: 'Cost / Month', value: `$${systemStatus.costThisMonth.toFixed(4)}` },
                      ].map(({ label, value }, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                          className="flex items-center justify-between py-2"
                          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                        >
                          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {label}
                          </span>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {status === 'connected' ? 'Loading…' : 'Not connected'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Agent Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: '1px solid var(--color-glass-border)',
                height: '400px',
              }}
            >
              <AgentPanel />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
