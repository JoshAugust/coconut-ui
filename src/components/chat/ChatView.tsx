import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ArrowDown } from 'lucide-react'
import { useMessagesStore } from '../../stores/messages'
import { useSessionsStore } from '../../stores/sessions'
import { useConnectionStore } from '../../stores/connection'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

const EMPTY_MESSAGES: import('../../types').NormalizedMessage[] = []

export function ChatView() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)

  const activeSessionId = useSessionsStore((s) => s.activeSessionId) ?? 'main'
  const messages = useMessagesStore((s) => s.messagesBySession[activeSessionId]) ?? EMPTY_MESSAGES
  const streamingContent = useMessagesStore((s) => s.streamingContent)
  const setMessages = useMessagesStore((s) => s.setMessages)
  const addMessage = useMessagesStore((s) => s.addMessage)
  const updateStreamingContent = useMessagesStore((s) => s.updateStreamingContent)
  const finalizeStream = useMessagesStore((s) => s.finalizeStream)
  const setLoadingHistory = useMessagesStore((s) => s.setLoadingHistory)
  const status = useConnectionStore((s) => s.status)
  const getAdapter = useConnectionStore((s) => s.getAdapter)

  // Load history on mount / session change
  useEffect(() => {
    if (status !== 'connected') return
    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        const history = await getAdapter().getHistory(activeSessionId, { limit: 50, includeTools: true })
        setMessages(activeSessionId, history)
      } catch {
        // ignore
      } finally {
        setLoadingHistory(false)
      }
    }
    loadHistory()
  }, [activeSessionId, status, getAdapter, setMessages, setLoadingHistory])

  // Subscribe to live messages
  const isScrolledUpRef = useRef(isScrolledUp)
  isScrolledUpRef.current = isScrolledUp

  useEffect(() => {
    if (status !== 'connected') return
    const adapter = getAdapter()

    const unsubMsg = adapter.onMessage((msg) => {
      addMessage({ ...msg, sessionId: msg.sessionId || activeSessionId })
      if (isScrolledUpRef.current) {
        setNewMessageCount((c) => c + 1)
      }
    })

    const unsubStream = adapter.onStreamToken((token) => {
      updateStreamingContent(token.messageId, token.token)
      if (token.done) {
        finalizeStream(token.messageId)
      }
    })

    return () => {
      unsubMsg()
      unsubStream()
    }
  }, [status, activeSessionId, getAdapter, addMessage, updateStreamingContent, finalizeStream])

  // Auto-scroll to bottom
  const messageCount = messages.length
  useEffect(() => {
    if (!isScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messageCount, streamingContent, isScrolledUp])

  // Scroll detection
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const scrolled = distanceFromBottom > 100
    setIsScrolledUp(scrolled)
    if (!scrolled) setNewMessageCount(0)
  }, [])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setNewMessageCount(0)
  }

  const handleApprove = async (callId: string) => {
    try { await getAdapter().approveToolCall(callId) } catch { /* ignore */ }
  }

  const handleDeny = async (callId: string) => {
    try { await getAdapter().denyToolCall(callId) } catch { /* ignore */ }
  }

  // Active streaming message
  const streamingEntries = Object.entries(streamingContent)

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 && streamingEntries.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <MessageSquare size={36} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </motion.div>
            <div className="text-center">
              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Start a conversation
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Type a message below to begin
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onApproveToolCall={handleApprove}
                  onDenyToolCall={handleDeny}
                />
              ))}
            </AnimatePresence>

            {/* Streaming messages */}
            {streamingEntries.map(([msgId, content]) => (
              <MessageBubble
                key={`streaming-${msgId}`}
                message={{
                  id: msgId,
                  sessionId: activeSessionId,
                  role: 'assistant',
                  content,
                  timestamp: new Date().toISOString(),
                  streaming: true,
                }}
              />
            ))}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* "New messages" indicator */}
      <AnimatePresence>
        {isScrolledUp && newMessageCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium z-10"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ArrowDown size={14} />
            {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput
        onSend={async (text) => {
          const userMsg = {
            id: crypto.randomUUID(),
            sessionId: activeSessionId,
            role: 'user' as const,
            content: text,
            timestamp: new Date().toISOString(),
          }
          addMessage(userMsg)
          try {
            await getAdapter().sendMessage(activeSessionId, text)
          } catch { /* ignore */ }
        }}
        disabled={status !== 'connected'}
      />
    </div>
  )
}
