import { useState, useRef, useCallback } from 'react'
import { SendHorizontal, Paperclip } from 'lucide-react'
import { useConnectionStore } from '../../stores/connection'
import { useMessagesStore } from '../../stores/messages'
import { useSessionsStore } from '../../stores/sessions'

export function ChatInput() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const getAdapter = useConnectionStore((s) => s.getAdapter)
  const connectionStatus = useConnectionStore((s) => s.status)
  const { sending, setSending, addMessage } = useMessagesStore()
  const activeSessionId = useSessionsStore((s) => s.activeSessionId)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || connectionStatus !== 'connected') return

    const sessionId = activeSessionId || 'main'

    // Add user message optimistically
    addMessage({
      id: crypto.randomUUID(),
      sessionId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    })

    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setSending(true)
    try {
      await getAdapter().sendMessage(sessionId, trimmed)
    } catch (err) {
      console.error('Send failed:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showSlashHint = text.startsWith('/')

  return (
    <div
      className="px-4 py-3 shrink-0"
      style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}
    >
      {/* Slash command hint */}
      {showSlashHint && (
        <div
          className="text-[11px] px-3 py-1.5 mb-2 rounded-md"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
        >
          💡 Slash commands: /new, /model, /compact, /think, /status
        </div>
      )}

      <div
        className="flex items-end gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Attachment button */}
        <button
          className="p-1.5 rounded-md flex-shrink-0 mb-0.5"
          style={{ color: 'var(--color-text-muted)' }}
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message your agent..."
          rows={1}
          disabled={sending || connectionStatus !== 'connected'}
          className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent"
          style={{
            color: 'var(--color-text-primary)',
            minHeight: '24px',
            maxHeight: '200px',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || connectionStatus !== 'connected'}
          className="p-2 rounded-lg flex-shrink-0 mb-0.5 transition-all disabled:opacity-30"
          style={{
            background: text.trim() ? 'var(--color-primary)' : 'transparent',
            color: text.trim() ? 'white' : 'var(--color-text-muted)',
          }}
          title="Send (Enter)"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
