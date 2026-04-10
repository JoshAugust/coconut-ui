// Coconut — Connection Store

import { create } from 'zustand'
import type { ConnectionConfig, ConnectionStatus, BackendCapabilities } from '../types'
import type { AgentBackendAdapter } from '../adapters/interface'
import { EragonAdapter } from '../adapters/eragon'
import { MockAdapter } from '../adapters/mock'

interface ConnectionState {
  adapter: AgentBackendAdapter | null
  status: ConnectionStatus
  config: ConnectionConfig | null
  capabilities: BackendCapabilities | null
  error: string | null
  isDemo: boolean

  connect: (config: ConnectionConfig) => Promise<void>
  connectDemo: () => Promise<void>
  disconnect: () => Promise<void>
  getAdapter: () => AgentBackendAdapter
}

const STORAGE_KEY = 'coconut:connection'

function loadSavedConfig(): ConnectionConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

function saveConfig(config: ConnectionConfig | null) {
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  adapter: null,
  status: 'disconnected',
  config: loadSavedConfig(),
  capabilities: null,
  error: null,
  isDemo: false,

  connect: async (config: ConnectionConfig) => {
    const adapter = new EragonAdapter()
    adapter.onConnectionChange((status) => set({ status }))

    try {
      set({ adapter, config, status: 'connecting', error: null, isDemo: false })
      await adapter.connect(config)
      saveConfig(config)
      set({ capabilities: adapter.capabilities(), status: 'connected' })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Connection failed' })
      throw err
    }
  },

  connectDemo: async () => {
    const adapter = new MockAdapter()
    const demoConfig: ConnectionConfig = { gatewayUrl: 'demo://mock', token: 'demo' }

    set({ adapter, config: demoConfig, status: 'connecting', error: null, isDemo: true })
    await adapter.connect(demoConfig)
    set({ capabilities: adapter.capabilities(), status: 'connected' })
  },

  disconnect: async () => {
    const { adapter } = get()
    if (adapter) await adapter.disconnect()
    set({ adapter: null, status: 'disconnected', capabilities: null, isDemo: false })
  },

  getAdapter: () => {
    const { adapter } = get()
    if (!adapter) throw new Error('Not connected to any backend')
    return adapter
  },
}))
