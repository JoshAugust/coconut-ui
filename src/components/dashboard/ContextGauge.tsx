import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { ContextPressure } from '../../types'

interface ContextGaugeProps {
  pressure: ContextPressure | null
}

const levelColors: Record<string, { stroke: string; glow: string; label: string }> = {
  low:      { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)',  label: 'Healthy' },
  medium:   { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)',  label: 'Moderate' },
  high:     { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.3)',  label: 'Elevated' },
  critical: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.35)',  label: 'Critical' },
}

const SIZE = 140
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
// We show a 270° arc (starting from bottom-left, going clockwise)
const ARC_FRACTION = 0.75
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION
const GAP = CIRCUMFERENCE * (1 - ARC_FRACTION)

// Rotation so the arc starts at ~225° (bottom-left)
const START_ROTATION = 135

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

/** Animated number that smoothly transitions */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`)
  const prevRef = useRef(0)

  useEffect(() => {
    motionVal.set(prevRef.current)
    spring.set(value)
    prevRef.current = value
  }, [value, motionVal, spring])

  return <motion.span>{display}</motion.span>
}

export function ContextGauge({ pressure }: ContextGaugeProps) {
  const level = pressure?.level ?? 'low'
  const { stroke: strokeColor, glow: glowColor, label: levelLabel } = levelColors[level] ?? levelColors.low
  const percentage = Math.min(pressure?.percentage ?? 0, 100)

  // Arc progress: 0 → ARC_LENGTH
  const filled = (percentage / 100) * ARC_LENGTH
  const dash = `${filled} ${CIRCUMFERENCE - filled}`

  // The track arc
  const trackDash = `${ARC_LENGTH} ${GAP}`

  const cx = SIZE / 2
  const cy = SIZE / 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative rounded-xl p-5 flex flex-col"
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
          background: `linear-gradient(90deg, transparent, ${strokeColor}50, transparent)`,
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Context Window
          </p>
          {pressure && (
            <p className="text-xs mt-0.5 font-medium" style={{ color: strokeColor }}>
              {levelLabel}
            </p>
          )}
        </div>
        {pressure && (
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {formatTokens(pressure.used)} / {formatTokens(pressure.total)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              tokens
            </p>
          </div>
        )}
      </div>

      {!pressure ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Not available</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* SVG Radial Gauge */}
          <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ transform: `rotate(${START_ROTATION}deg)` }}
            >
              {/* Glow filter */}
              <defs>
                <filter id="gauge-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Track arc */}
              <circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={STROKE}
                strokeDasharray={trackDash}
                strokeLinecap="round"
              />

              {/* Progress arc */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={strokeColor}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`0 ${CIRCUMFERENCE}`}
                animate={{ strokeDasharray: dash }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                filter="url(#gauge-glow)"
              />
            </svg>

            {/* Center content — rotated back to upright */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ paddingBottom: SIZE * 0.12 }}
            >
              <p
                className="text-3xl font-bold leading-none"
                style={{ color: strokeColor, textShadow: `0 0 16px ${glowColor}` }}
              >
                <AnimatedNumber value={Math.round(percentage)} suffix="%" />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                used
              </p>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Used</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatTokens(pressure.used)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: strokeColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Remaining</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatTokens(pressure.total - pressure.used)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - percentage}%` }}
                  transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Capacity:{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {formatTokens(pressure.total)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
