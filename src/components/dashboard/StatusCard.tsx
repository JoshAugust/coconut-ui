import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatusCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtitle?: string
  color?: string
}

export function StatusCard({ icon, label, value, subtitle, color }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="p-2 rounded-lg flex-shrink-0"
        style={{
          background: color ? `${color}20` : 'var(--color-bg-tertiary)',
          color: color || 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
