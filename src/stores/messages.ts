// Coconut — Messages Store
// Manages chat messages and streaming state

import { create } from 'zustand'
import type { NormalizedMessage } from '../types'

interface MessagesState {
  // Messages keyed by session ID
  messagesBySession: Record<string, NormalizedMessage[]>
  // Currently streaming message content (being assembled)
  streamingContent: Record<string, string> // messageId -> accumulated content
  // Loading states
  loadingHistory: boolean
  sending: boolean

  addMessage: (msg: NormalizedMessage) => void
  updateStreamingContent: (messageId: string, token: string) => void
  finalizeStream: (messageId: string) => void
  setMessages: (sessionId: string, messages: NormalizedMessage[]) => void
  clearSession: (sessionId: string) => void
  setLoadingHistory: (loading: boolean) => void
  setSending: (sending: boolean) => void
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messagesBySession: {},
  streamingContent: {},
  loadingHistory: false,
  sending: false,

  addMessage: (msg) => {
    set((state) => {
      const sessionMessages = state.messagesBySession[msg.sessionId] || []
      // Check for duplicate
      const exists = sessionMessages.some((m) => m.id === msg.id)
      if (exists) {
        return {
          messagesBySession: {
            ...state.messagesBySession,
            [msg.sessionId]: sessionMessages.map((m) =>
              m.id === msg.id ? msg : m
            ),
          },
        }
      }
      return {
        messagesBySession: {
          ...state.messagesBySession,
          [msg.sessionId]: [...sessionMessages, msg],
        },
      }
    })
  },

  updateStreamingContent: (messageId, token) => {
    set((state) => ({
      streamingContent: {
        ...state.streamingContent,
        [messageId]: (state.streamingContent[messageId] || '') + token,
      },
    }))
  },

  finalizeStream: (messageId) => {
    const { streamingContent } = get()
    const content = streamingContent[messageId]
    if (content) {
      set((state) => {
        const newStreaming = { ...state.streamingContent }
        delete newStreaming[messageId]
        return { streamingContent: newStreaming }
      })
    }
  },

  setMessages: (sessionId, messages) => {
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages,
      },
    }))
  },

  clearSession: (sessionId) => {
    set((state) => {
      const newMessages = { ...state.messagesBySession }
      delete newMessages[sessionId]
      return { messagesBySession: newMessages }
    })
  },

  setLoadingHistory: (loading) => set({ loadingHistory: loading }),
  setSending: (sending) => set({ sending }),
}))
