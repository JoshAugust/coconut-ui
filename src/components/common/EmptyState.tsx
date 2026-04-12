import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div
        className="w-12 h-12 flex items-center justify-center mb-4"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <Icon size={20} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <p
        className="text-[14px] font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-[12px] mt-1.5 max-w-[240px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-4 py-2 text-[12px] font-medium cursor-pointer"
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
