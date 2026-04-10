import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Terminal, Copy, Check } from 'lucide-react'
import type { NormalizedMessage, ContentBlock } from '../../types'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ToolCallCard } from './ToolCallCard'
import { ThinkingBlock } from './ThinkingBlock'

interface MessageBubbleProps {
  message: NormalizedMessage
  onApproveToolCall?: (id: string) => void
  onDenyToolCall?: (id: string) => void
}

const roleIcons: Record<string, React.ElementType> = {
  user: User,
  assistant: Bot,
  system: Terminal,
  tool: Terminal,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function renderBlock(block: ContentBlock, index: number, onApprove?: (id: string) => void, onDeny?: (id: string) => void) {
  switch (block.type) {
    case 'text':
      return <MarkdownRenderer key={index} content={block.text} />
    case 'thinking':
      return <ThinkingBlock key={index} text={block.text} />
    case 'tool_call':
      return <ToolCallCard key={block.id || index} block={block} onApprove={onApprove} onDeny={onDeny} />
    case 'code':
      return <pre key={index} className="text-sm"><code className={`language-${block.language}`}>{block.code}</code></pre>
    case 'image':
      return <img key={index} src={block.url} alt={block.alt || 'Image'} className="max-w-full rounded-lg mt-2" style={{ maxHeight: '400px' }} />
    default:
      return null
  }
}

export function MessageBubble({ message, onApproveToolCall, onDenyToolCall }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const Icon = roleIcons[message.role] || Bot

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isSystem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-2">
        <div className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 px-4 py-3 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
          color: isUser ? 'white' : 'var(--color-text-secondary)',
        }}
      >
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`} style={{ maxWidth: '85%' }}>
        <div
          className="px-4 py-3 rounded-2xl relative"
          style={{
            background: isUser ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
            color: isUser ? 'white' : 'var(--color-text-primary)',
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {message.blocks && message.blocks.length > 0
            ? message.blocks.map((block, i) => renderBlock(block, i, onApproveToolCall, onDenyToolCall))
            : <MarkdownRenderer content={message.content} />
          }

          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
              title="Copy"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{timeAgo(message.timestamp)}</span>
          {message.model && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{message.model.split('/').pop()}</span>}
          {message.tokenUsage?.cost != null && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>${message.tokenUsage.cost.toFixed(4)}</span>}
        </div>
      </div>
    </motion.div>
  )
}
