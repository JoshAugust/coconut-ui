// Coconut — Theme Store

import { create } from 'zustand'
import type { ThemeConfig } from '../types'

type ThemeMode = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  config: ThemeConfig
  toggleMode: () => void
  setConfig: (config: Partial<ThemeConfig>) => void
}

const defaultConfig: ThemeConfig = {
  name: 'Coconut',
  primaryColor: '#10b981',     // Emerald green
  accentColor: '#6366f1',      // Indigo
  title: 'Coconut',
  agentName: 'Agent',
  userTitle: 'User',
}

const THEME_KEY = 'coconut:theme'

function loadTheme(): { mode: ThemeMode; config: ThemeConfig } {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        mode: parsed.mode || 'dark',
        config: { ...defaultConfig, ...parsed.config },
      }
    }
  } catch { /* ignore */ }
  return { mode: 'dark', config: defaultConfig }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = loadTheme()
  return {
    ...initial,

    toggleMode: () => {
      const newMode = get().mode === 'dark' ? 'light' : 'dark'
      set({ mode: newMode })
      localStorage.setItem(THEME_KEY, JSON.stringify({ mode: newMode, config: get().config }))
    },

    setConfig: (patch) => {
      const newConfig = { ...get().config, ...patch }
      set({ config: newConfig })
      localStorage.setItem(THEME_KEY, JSON.stringify({ mode: get().mode, config: newConfig }))
    },
  }
})
