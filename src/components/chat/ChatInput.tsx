import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Sparkles } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Type a message…' }: ChatInputProps) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [sendHovered, setSendHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0 && !disabled

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [text])

  const handleSend = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pb-5 pt-3"
      style={{ background: 'linear-gradient(0deg, var(--color-bg-primary) 60%, transparent 100%)' }}
    >
      <div
        className="flex items-end gap-2 px-4 py-3"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-elevated)',
          border: focused
            ? '1px solid var(--color-primary)'
            : '1px solid var(--color-border)',
          boxShadow: focused
            ? '0 0 0 3px var(--color-primary-muted), inset 0 1px 2px rgba(0,0,0,0.1)'
            : '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.05)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          minHeight: '48px',
        }}
      >
        {/* Attach button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 shrink-0 cursor-pointer mb-0.5"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            borderRadius: '6px',
          }}
        >
          <Paperclip size={18} />
        </motion.button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none outline-none leading-relaxed placeholder:text-[14px] placeholder:text-[#6c6c88]"
          style={{
            background: 'transparent',
            color: 'var(--color-text-primary)',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            maxHeight: '160px',
            minHeight: '28px',
            paddingTop: '6px',
            paddingBottom: '6px',
          }}
        />

        {/* Sparkle indicator when typing */}
        {text.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="shrink-0 mb-0.5"
          >
            <Sparkles size={14} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
          </motion.div>
        )}

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          onHoverStart={() => setSendHovered(true)}
          onHoverEnd={() => setSendHovered(false)}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className="p-2.5 shrink-0 mb-0.5"
          style={{
            background: canSend
              ? 'linear-gradient(135deg, #10b981, #0891b2)'
              : 'var(--color-bg-tertiary)',
            border: 'none',
            borderRadius: '12px',
            color: canSend ? 'white' : 'var(--color-text-muted)',
            cursor: canSend ? 'pointer' : 'default',
            transition: 'box-shadow 0.15s ease, background 0.15s ease',
            boxShadow: canSend && sendHovered
              ? '0 0 12px rgba(16, 185, 129, 0.3)'
              : 'none',
          }}
        >
          <Send size={16} />
        </motion.button>
      </div>

      {/* Hint */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          Enter to send · Shift+Enter for new line · ⌘K for commands
        </span>
      </div>
    </motion.div>
  )
}
