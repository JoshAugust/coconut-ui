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

/** Format model name: "claude-opus-4-6" → "Opus 4" */
function formatModel(model: string): string {
  const name = model.split('/').pop() || model
  if (name.includes('opus')) return 'Opus 4'
  if (name.includes('sonnet')) return 'Sonnet 4'
  if (name.includes('haiku')) return 'Haiku 4'
  if (name.includes('gpt-4')) return 'GPT-4o'
  if (name.includes('gpt-3')) return 'GPT-3.5'
  return name
}

/** Format cost: 0.0156 → "$0.02" */
function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(3)}`
  return `$${cost.toFixed(2)}`
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
        transition={{ delay: index * 0.03 }}
        className="flex justify-center py-4"
      >
        <span
          className="text-[11px] px-3 py-1 font-medium"
          style={{
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {message.content}
        </span>
      </motion.div>
    )
  }

  // ChatGPT/Claude style: no bubbles, left-aligned, avatar + content
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group hover-bg"
      style={{
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        transition: 'background 0.15s ease',
      }}
    >
      <div className="flex gap-4 max-w-3xl mx-auto">
        {/* Avatar — 16px icon to match text */}
        <div
          className="shrink-0 w-7 h-7 flex items-center justify-center mt-0.5"
          style={{
            borderRadius: 'var(--radius-full)',
            background: isUser ? 'var(--color-bg-elevated)' : 'var(--color-primary)',
            border: isUser ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {isUser ? (
            <User size={14} style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <Bot size={14} style={{ color: 'white' }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Sender label */}
          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {isUser ? 'You' : 'Assistant'}
            </span>
            {/* Meta pills inline with sender */}
            {message.model && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5"
                style={{
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {formatModel(message.model)}
              </span>
            )}
            {message.tokenUsage?.cost != null && (
              <span
                className="text-[10px] font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {formatCost(message.tokenUsage.cost)}
              </span>
            )}

            {/* Copy button — appears on hover */}
            <motion.button
              onClick={handleCopy}
              className="ml-auto p-1 opacity-0 group-hover:opacity-60 cursor-pointer"
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
                transition: 'opacity 0.15s ease',
              }}
              whileHover={{ opacity: 1 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </motion.button>
          </div>

          {/* Thinking blocks */}
          {message.blocks
            ?.filter((b) => b.type === 'thinking')
            .map((block, i) => (
              <ThinkingBlock key={i} text={'text' in block ? block.text : ''} />
            ))}

          {/* Main text — no bubble, just text */}
          {message.content && (
            <div
              className="text-[14px] leading-[1.7]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
          )}

          {/* Tool call cards */}
          {message.blocks
            ?.filter((b) => b.type === 'tool_call')
            .map((block) =>
              'id' in block ? <ToolCallCard key={block.id} block={block} /> : null
            )}
        </div>
      </div>
    </motion.div>
  )
}
