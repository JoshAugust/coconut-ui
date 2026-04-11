import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Zap, Settings, Search } from 'lucide-react'
import { useThemeStore } from '../../stores/theme'
import { useConnectionStore } from '../../stores/connection'

interface CommandItem {
  id: string
  label: string
  icon: React.ElementType
  category: string
  shortcut?: string
  action: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const { mode, toggleMode } = useThemeStore()
  const disconnect = useConnectionStore((s) => s.disconnect)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const commands: CommandItem[] = [
    { id: 'theme', label: mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: mode === 'dark' ? Sun : Moon, category: 'Settings', shortcut: '⌘T', action: () => { toggleMode(); setOpen(false) } },
    { id: 'disconnect', label: 'Disconnect', icon: Zap, category: 'Connection', action: () => { disconnect(); setOpen(false) } },
  ]

  const grouped = commands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    ;(acc[cmd.category] ||= []).push(cmd)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: 'min(480px, calc(100vw - 32px))',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 51,
            }}
          >
            <Command>
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                <Command.Input
                  placeholder="Type a command…"
                  className="flex-1 text-sm outline-none"
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)' }}
                />
              </div>
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="text-center py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No commands found
                </Command.Empty>
                {Object.entries(grouped).map(([cat, items]) => (
                  <Command.Group key={cat} heading={cat}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: 'var(--color-text-muted)' }}>
                      {cat}
                    </div>
                    {items.map((cmd) => {
                      const Icon = cmd.icon
                      return (
                        <Command.Item
                          key={cmd.id}
                          onSelect={cmd.action}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <Icon size={16} style={{ color: 'var(--color-text-muted)' }} />
                          <span className="flex-1">{cmd.label}</span>
                          {cmd.shortcut && (
                            <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
