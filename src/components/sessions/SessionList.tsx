import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useSessionsStore } from '../../stores/sessions'
import { useConnectionStore } from '../../stores/connection'
import { SessionItem } from './SessionItem'
import { SessionSearch } from './SessionSearch'

export function SessionList() {
  const { sessions, setSessions, loading, setLoading, addSession, setActiveSession } = useSessionsStore()
  const status = useConnectionStore((s) => s.status)
  const getAdapter = useConnectionStore((s) => s.getAdapter)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchSessions = useCallback(async () => {
    if (status !== 'connected') return
    setLoading(true)
    try {
      const list = await getAdapter().listSessions()
      setSessions(list)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [status, getAdapter, setSessions, setLoading])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleNewSession = async () => {
    try {
      const session = await getAdapter().createSession()
      addSession(session)
      setActiveSession(session.id)
    } catch {
      // ignore
    }
  }

  const filtered = searchQuery
    ? sessions.filter(
        (s) =>
          (s.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.lastMessagePreview || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions

  // Group by status
  const active = filtered.filter((s) => s.status === 'active')
  const idle = filtered.filter((s) => s.status === 'idle')
  const other = filtered.filter((s) => s.status !== 'active' && s.status !== 'idle')
  const grouped = [...active, ...idle, ...other]

  return (
    <div className="flex flex-col gap-2">
      {/* Search + New */}
      <div className="flex items-center gap-1.5 px-1">
        <div className="flex-1">
          <SessionSearch onSearch={setSearchQuery} />
        </div>
        <button
          onClick={handleNewSession}
          className="p-1.5 rounded-md flex-shrink-0"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
          }}
          title="New session"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Session list */}
      {loading && sessions.length === 0 ? (
        <div className="space-y-2 px-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-md animate-pulse"
              style={{ background: 'var(--color-bg-tertiary)' }}
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
          {searchQuery ? 'No matching sessions' : 'No sessions yet'}
        </p>
      ) : (
        <AnimatePresence>
          {grouped.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
