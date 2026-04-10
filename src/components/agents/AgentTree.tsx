import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { NormalizedAgent } from '../../types'
import { AgentCard } from './AgentCard'

interface AgentTreeProps {
  agents: NormalizedAgent[]
}

interface TreeNodeProps {
  agent: NormalizedAgent
  children: NormalizedAgent[]
  allAgents: NormalizedAgent[]
  depth: number
}

function TreeNode({ agent, children, allAgents, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = children.length > 0

  return (
    <div>
      <div className="flex items-start gap-1">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 p-0.5 rounded hover:opacity-80 transition-all flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
              <ChevronRight size={14} />
            </motion.div>
          </button>
        )}
        {!hasChildren && depth > 0 && <div className="w-5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <AgentCard agent={agent} depth={0} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              marginLeft: 20,
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: 12,
            }}
          >
            {children.map((child) => {
              const grandchildren = allAgents.filter((a) => a.parentId === child.id)
              return (
                <TreeNode
                  key={child.id}
                  agent={child}
                  children={grandchildren}
                  allAgents={allAgents}
                  depth={depth + 1}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AgentTree({ agents }: AgentTreeProps) {
  const rootAgents = agents.filter((a) => !a.parentId)

  if (agents.length === 0) return null

  return (
    <div className="space-y-1">
      {rootAgents.map((agent) => {
        const children = agents.filter((a) => a.parentId === agent.id)
        return (
          <TreeNode
            key={agent.id}
            agent={agent}
            children={children}
            allAgents={agents}
            depth={0}
          />
        )
      })}
    </div>
  )
}
