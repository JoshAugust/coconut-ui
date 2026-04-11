import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { NormalizedAgent } from '../../types'
import { AgentCard } from './AgentCard'

/** Status → color mapping (mirrors AgentCard) */
const statusColor: Record<string, string> = {
  running:   '#3b82f6',
  idle:      '#f59e0b',
  completed: '#10b981',
  failed:    '#ef4444',
  killed:    '#6b7280',
}

function getStatusColor(status: string) {
  return statusColor[status] ?? statusColor.idle
}

// ─── Animated trunk line (vertical) ────────────────────────────────────────
interface TrunkProps {
  color: string
  hasRunning: boolean
}

function TrunkLine({ color, hasRunning }: TrunkProps) {
  return (
    <div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Static gradient trunk */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, ${color}CC, ${color}22)`,
          transformOrigin: 'top',
          borderRadius: 1,
        }}
      />

      {/* Pulsing energy bead travelling down the trunk when a child is running */}
      {hasRunning && (
        <motion.div
          animate={{
            top: ['-10%', '110%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 0.8,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: 20,
            background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  )
}

// ─── Connector arm (horizontal) + junction dot ──────────────────────────────
interface ArmProps {
  color: string
  delay: number
  isLast: boolean
}

function ConnectorArm({ color, delay, isLast }: ArmProps) {
  return (
    <>
      {/* Vertical segment that closes the gap between siblings */}
      {!isLast && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3, delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: -20,
            top: '50%',
            bottom: 0,
            width: 2,
            background: `${color}33`,
            transformOrigin: 'top',
            borderRadius: 1,
          }}
        />
      )}

      {/* Horizontal arm */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.25, delay: delay + 0.1, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: -20,
          top: 'calc(50% - 1px)',
          width: 20,
          height: 2,
          background: `linear-gradient(to right, ${color}55, ${color}CC)`,
          transformOrigin: 'left',
          borderRadius: 1,
        }}
      />

      {/* Junction glow dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: delay + 0.28, type: 'spring', stiffness: 600, damping: 20 }}
        style={{
          position: 'absolute',
          left: -24,
          top: 'calc(50% - 4px)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px 2px ${color}66, 0 0 3px 1px ${color}`,
          border: '1.5px solid var(--color-bg-secondary)',
          zIndex: 2,
        }}
      />
    </>
  )
}

// ─── Tree node ──────────────────────────────────────────────────────────────
interface TreeNodeProps {
  agent: NormalizedAgent
  children: NormalizedAgent[]
  allAgents: NormalizedAgent[]
  depth: number
  isLast?: boolean
  delay?: number
}

function TreeNode({ agent, children, allAgents, depth, isLast = true, delay = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = children.length > 0
  const agentColor = getStatusColor(agent.status)
  const hasRunningChild = children.some((c) => c.status === 'running')

  return (
    <div className={depth > 0 ? 'relative' : undefined}>
      {/* Connector arm for non-root nodes */}
      {depth > 0 && (
        <ConnectorArm color={agentColor} delay={delay} isLast={isLast} />
      )}

      {/* Card row with expand toggle */}
      <div className="flex items-start gap-1">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 p-0.5 rounded hover:opacity-80 transition-all flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <ChevronRight size={14} />
            </motion.div>
          </button>
        )}
        {!hasChildren && depth > 0 && <div className="w-5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <AgentCard agent={agent} depth={0} />
        </div>
      </div>

      {/* Children subtree */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="relative"
              style={{
                marginLeft: 28,
                paddingLeft: 20,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {/* Animated vertical trunk line */}
              <TrunkLine color={agentColor} hasRunning={hasRunningChild} />

              {children.map((child, idx) => {
                const grandchildren = allAgents.filter((a) => a.parentId === child.id)
                const childIsLast = idx === children.length - 1
                const childDelay = idx * 0.06

                return (
                  <TreeNode
                    key={child.id}
                    agent={child}
                    children={grandchildren}
                    allAgents={allAgents}
                    depth={depth + 1}
                    isLast={childIsLast}
                    delay={childDelay}
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Public component ───────────────────────────────────────────────────────
interface AgentTreeProps {
  agents: NormalizedAgent[]
}

export function AgentTree({ agents }: AgentTreeProps) {
  const rootAgents = agents.filter((a) => !a.parentId)

  if (agents.length === 0) return null

  return (
    <div className="space-y-1">
      {rootAgents.map((agent, idx) => {
        const children = agents.filter((a) => a.parentId === agent.id)
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
          >
            <TreeNode
              agent={agent}
              children={children}
              allAgents={agents}
              depth={0}
              isLast={idx === rootAgents.length - 1}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
