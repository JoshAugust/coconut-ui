import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatusCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtitle?: string
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  index?: number
}

/** Animated count-up hook for numeric values */
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const prevTarget = useRef<number>(0)

  useEffect(() => {
    const from = prevTarget.current
    prevTarget.current = target
    startRef.current = null

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return count
}

/** Mini sparkline — just a simple decorative SVG wave */
function Sparkline({ color }: { color: string }) {
  // Static decorative wave — gives a "live data" feel without real data
  const points = [0, 4, 2, 7, 3, 5, 8, 4, 6, 9, 5, 7, 10]
  const max = Math.max(...points)
  const h = 20
  const w = 52
  const step = w / (points.length - 1)

  const path = points
    .map((p, i) => {
      const x = i * step
      const y = h - (p / max) * h
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ opacity: 0.5 }}>
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`${path} L ${w} ${h} L 0 ${h} Z`}
        fill={color}
        fillOpacity="0.12"
      />
    </svg>
  )
}

export function StatusCard({ icon, label, value, subtitle, color = '#10b981', trend, index = 0 }: StatusCardProps) {
  const isNumeric = typeof value === 'number'
  const animatedCount = useCountUp(isNumeric ? (value as number) : 0)

  const displayValue = isNumeric ? animatedCount : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-xl p-4 cursor-default group"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'box-shadow 250ms ease, border-color 250ms ease, transform 250ms ease',
      }}
      onHoverStart={(e) => {
        const el = e.currentTarget as HTMLElement
        if (el) {
          el.style.boxShadow = `var(--shadow-lg), 0 0 24px ${color}20`
          el.style.borderColor = `${color}30`
        }
      }}
      onHoverEnd={(e) => {
        const el = e.currentTarget as HTMLElement
        if (el) {
          el.style.boxShadow = 'var(--shadow-md)'
          el.style.borderColor = 'var(--color-glass-border)'
        }
      }}
    >
      {/* Color accent top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        }}
      />

      {/* Subtle radial glow behind icon */}
      <div
        className="absolute top-2 left-2 w-16 h-16 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}12, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className="p-2 rounded-lg flex-shrink-0"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}25`,
          }}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </p>
          <div className="flex items-end gap-2 mt-0.5">
            <p className="text-2xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {displayValue}
            </p>
            {trend === 'up' && (
              <span className="text-xs font-medium mb-0.5" style={{ color: '#10b981' }}>↑</span>
            )}
            {trend === 'down' && (
              <span className="text-xs font-medium mb-0.5" style={{ color: '#ef4444' }}>↓</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex-shrink-0 self-end mb-1">
          <Sparkline color={color} />
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
        }}
      />
    </motion.div>
  )
}
