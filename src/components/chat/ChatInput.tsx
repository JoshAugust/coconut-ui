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
    // Reset height
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
      className="px-4 pb-4 pt-2"
    >
      <div
        className="glass flex items-end gap-2 px-3 py-2"
        style={{
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
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
            borderRadius: 'var(--radius-sm)',
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
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none outline-none text-sm py-2 leading-relaxed"
          style={{
            background: 'transparent',
            color: 'var(--color-text-primary)',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            maxHeight: '160px',
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
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className="p-2.5 shrink-0 cursor-pointer mb-0.5"
          style={{
            background: canSend
              ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
              : 'var(--color-bg-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: canSend ? 'white' : 'var(--color-text-muted)',
            transition: 'all var(--transition-base)',
            boxShadow: canSend ? 'var(--shadow-glow)' : 'none',
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
