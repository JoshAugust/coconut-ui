import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  Plus,
  RotateCcw,
  Moon,
  Sun,
  Zap,
  Settings,
  Search,
  Brain,
  Gauge,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeStore()
  const disconnect = useConnectionStore((s) => s.disconnect)

  // Cmd+K to open
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
    // Navigation
    { id: 'nav-chat', label: 'Go to Chat', icon: MessageSquare, category: 'Navigation', shortcut: '⌘1', action: () => { navigate('/chat'); setOpen(false) } },
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation', shortcut: '⌘2', action: () => { navigate('/dashboard'); setOpen(false) } },
    { id: 'nav-agents', label: 'Go to Agents', icon: Users, category: 'Navigation', shortcut: '⌘3', action: () => { navigate('/agents'); setOpen(false) } },
    // Session
    { id: 'session-new', label: 'New Session', icon: Plus, category: 'Session', shortcut: '⌘N', action: () => { setOpen(false) } },
    { id: 'session-reset', label: 'Reset Session', icon: RotateCcw, category: 'Session', action: () => { setOpen(false) } },
    // Agent
    { id: 'agent-spawn', label: 'Spawn Sub-Agent', icon: Zap, category: 'Agents', action: () => { setOpen(false) } },
    // System
    { id: 'theme-toggle', label: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`, icon: mode === 'dark' ? Sun : Moon, category: 'System', action: () => { toggleMode(); setOpen(false) } },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System', action: () => { setOpen(false) } },
    { id: 'disconnect', label: 'Disconnect', icon: RotateCcw, category: 'System', action: () => { disconnect(); setOpen(false) } },
    // Slash commands
    { id: 'cmd-think', label: '/think — Enable Reasoning', icon: Brain, category: 'Commands', action: () => { setOpen(false) } },
    { id: 'cmd-status', label: '/status — Session Status', icon: Gauge, category: 'Commands', action: () => { setOpen(false) } },
    { id: 'cmd-search', label: '/search — Search Messages', icon: Search, category: 'Commands', action: () => { setOpen(false) } },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <Command
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Command.Input
                placeholder="Type a command or search..."
                className="w-full px-4 py-3 text-sm outline-none bg-transparent"
                style={{
                  color: 'var(--color-text-primary)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              />
              <Command.List
                className="max-h-80 overflow-y-auto p-2"
                style={{ scrollbarWidth: 'thin' }}
              >
                <Command.Empty
                  className="text-center py-6 text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No results found.
                </Command.Empty>

                {['Navigation', 'Session', 'Agents', 'Commands', 'System'].map((category) => {
                  const items = commands.filter((c) => c.category === category)
                  if (items.length === 0) return null
                  return (
                    <Command.Group
                      key={category}
                      heading={category}
                      className="mb-2"
                    >
                      <div
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {category}
                      </div>
                      {items.map((cmd) => {
                        const Icon = cmd.icon
                        return (
                          <Command.Item
                            key={cmd.id}
                            value={cmd.label}
                            onSelect={cmd.action}
                            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                            data-selected-style="background: var(--color-bg-hover)"
                          >
                            <Icon size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                            <span className="flex-1">{cmd.label}</span>
                            {cmd.shortcut && (
                              <kbd
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: 'var(--color-bg-tertiary)',
                                  color: 'var(--color-text-muted)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>

              <div
                className="flex items-center justify-between px-4 py-2 text-[10px]"
                style={{
                  borderTop: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
