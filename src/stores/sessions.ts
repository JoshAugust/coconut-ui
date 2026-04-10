// Coconut — Sessions Store

import { create } from 'zustand'
import type { NormalizedSession } from '../types'

interface SessionsState {
  sessions: NormalizedSession[]
  activeSessionId: string | null
  loading: boolean

  setSessions: (sessions: NormalizedSession[]) => void
  addSession: (session: NormalizedSession) => void
  updateSession: (id: string, patch: Partial<NormalizedSession>) => void
  removeSession: (id: string) => void
  setActiveSession: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: [],
  activeSessionId: null,
  loading: false,

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  updateSession: (id, patch) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId:
        state.activeSessionId === id ? null : state.activeSessionId,
    })),

  setActiveSession: (id) => set({ activeSessionId: id }),
  setLoading: (loading) => set({ loading }),
}))
