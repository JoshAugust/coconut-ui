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
        className="flex justify-center py-3"
      >
        <span
          className="text-[11px] px-4 py-1.5 rounded-full font-medium"
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex gap-3.5 group ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ padding: '14px 0' }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))'
            : 'linear-gradient(135deg, var(--color-accent), #818cf8)',
          boxShadow: isUser
            ? '0 2px 8px rgba(16, 185, 129, 0.25)'
            : '0 2px 8px rgba(99, 102, 241, 0.25)',
        }}
      >
        {isUser ? (
          <User size={15} style={{ color: 'white' }} />
        ) : (
          <Bot size={15} style={{ color: 'white' }} />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-3 max-w-[80%] min-w-0 ${isUser ? 'items-end' : ''}`}>
        {/* Thinking blocks */}
        {message.blocks
          ?.filter((b) => b.type === 'thinking')
          .map((block, i) => (
            <ThinkingBlock key={i} text={'text' in block ? block.text : ''} />
          ))}

        {/* Main text bubble */}
        {message.content && (
          <div
            className="relative group/bubble"
            style={{
              borderRadius: isUser
                ? '20px 20px 6px 20px'
                : '20px 20px 20px 6px',
              padding: '14px 18px',
              background: isUser
                ? 'linear-gradient(135deg, #10b981, #0891b2)'
                : 'var(--color-bg-elevated)',
              borderLeft: isUser ? 'none' : '2px solid var(--color-accent)',
              border: isUser ? 'none' : undefined,
              color: isUser ? 'white' : 'var(--color-text-primary)',
              boxShadow: isUser
                ? '0 4px 16px rgba(16, 185, 129, 0.2)'
                : '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {isUser ? (
              <p className="text-[14px] leading-[1.7] whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="text-[14px] leading-[1.7]">
                <MarkdownRenderer content={message.content} />
              </div>
            )}

            {/* Copy button */}
            <motion.button
              onClick={handleCopy}
              className="absolute -top-2.5 -right-2.5 p-1.5 opacity-0 group-hover/bubble:opacity-80 cursor-pointer"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-muted)',
                transition: 'opacity 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </motion.button>
          </div>
        )}

        {/* Tool call cards */}
        {message.blocks
          ?.filter((b) => b.type === 'tool_call')
          .map((block) =>
            'id' in block ? <ToolCallCard key={block.id} block={block} /> : null
          )}

        {/* Meta info pills */}
        {(message.model || message.tokenUsage) && (
          <div className="flex items-center gap-2 px-1">
            {message.model && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                style={{
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {message.model.split('/').pop()}
              </span>
            )}
            {message.tokenUsage?.cost != null && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                style={{
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                ${message.tokenUsage.cost.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
