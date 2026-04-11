import { motion } from 'framer-motion'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCallCard } from './ToolCallCard'
import type { NormalizedMessage } from '../../types'

interface MessageBubbleProps {
  message: NormalizedMessage
  index?: number
  onApproveToolCall?: (callId: string) => void
  onDenyToolCall?: (callId: string) => void
}

export function MessageBubble({ message, index = 0, onApproveToolCall: _onApprove, onDenyToolCall: _onDeny }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex justify-center py-2"
      >
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {message.content}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ padding: '4px 0' }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1"
        style={{
          background: isUser ? 'var(--color-primary-muted)' : 'var(--color-accent-muted)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: 'var(--color-primary)' }} />
        ) : (
          <Bot size={14} style={{ color: 'var(--color-accent)' }} />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-2 max-w-[75%] min-w-0 ${isUser ? 'items-end' : ''}`}>
        {/* Thinking blocks */}
        {message.blocks
          ?.filter((b) => b.type === 'thinking')
          .map((block, i) => (
            <ThinkingBlock key={i} text={'text' in block ? block.text : ''} />
          ))}

        {/* Main text */}
        {message.content && (
          <div
            className="relative rounded-2xl px-4 py-3"
            style={{
              background: isUser
                ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                : 'var(--color-glass)',
              backdropFilter: isUser ? 'none' : 'blur(var(--glass-blur))',
              WebkitBackdropFilter: isUser ? 'none' : 'blur(var(--glass-blur))',
              border: isUser ? 'none' : '1px solid var(--color-glass-border)',
              color: isUser ? 'white' : 'var(--color-text-primary)',
              borderRadius: isUser
                ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
            }}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="text-sm leading-relaxed prose-sm">
                <MarkdownRenderer content={message.content} />
              </div>
            )}

            {/* Copy button */}
            <motion.button
              onClick={handleCopy}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute -top-2 -right-2 p-1.5 opacity-0 group-hover:opacity-60 cursor-pointer"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
                transition: 'opacity var(--transition-fast)',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </motion.button>
          </div>
        )}

        {/* Tool call cards */}
        {message.blocks
          ?.filter((b) => b.type === 'tool_call')
          .map((block) =>
            'id' in block ? <ToolCallCard key={block.id} block={block} /> : null
          )}

        {/* Meta info */}
        {(message.model || message.tokenUsage) && (
          <div className="flex items-center gap-2 px-1">
            {message.model && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {message.model.split('/').pop()}
              </span>
            )}
            {message.tokenUsage?.cost != null && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                ${message.tokenUsage.cost.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
