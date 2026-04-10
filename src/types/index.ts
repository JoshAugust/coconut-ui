// Coconut — Normalized Data Contracts
// Backend-agnostic types that any adapter must produce

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string; collapsed?: boolean }
  | {
      type: 'tool_call'
      id: string
      name: string
      args: Record<string, unknown>
      result?: string
      error?: string
      duration_ms?: number
      status: 'pending' | 'running' | 'success' | 'error' | 'approval_required'
    }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'file'; name: string; url: string; mimeType: string }
  | { type: 'code'; language: string; code: string }

export interface Attachment {
  name: string
  url?: string
  mimeType: string
  size?: number
  data?: string // base64
}

export interface NormalizedMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  blocks?: ContentBlock[]
  timestamp: string
  model?: string
  tokenUsage?: { input: number; output: number; cost?: number }
  replyTo?: string
  attachments?: Attachment[]
  metadata?: Record<string, unknown>
  streaming?: boolean
}

export interface NormalizedSession {
  id: string
  agentId?: string
  label?: string
  model: string
  status: 'active' | 'idle' | 'error' | 'archived'
  createdAt: string
  lastMessageAt?: string
  lastMessagePreview?: string
  messageCount: number
  tokenUsage: { input: number; output: number; cost?: number }
  channel?: string
  metadata?: Record<string, unknown>
}

export type AgentStatus = 'running' | 'idle' | 'completed' | 'failed' | 'killed'

export interface NormalizedAgent {
  id: string
  parentId?: string
  status: AgentStatus
  task?: string
  model: string
  startedAt: string
  elapsed_ms: number
  tokenUsage: { input: number; output: number; cost?: number }
  sessionId?: string
}

export interface SystemStatus {
  version: string
  uptime_ms: number
  activeAgents: number
  activeSessions: number
  connectedChannels: string[]
  costToday: number
  costThisMonth: number
  contextPressure: 'low' | 'medium' | 'high' | 'critical'
  memoryUsageMb: number
}

export interface BackendCapabilities {
  streaming: boolean
  subAgents: boolean
  toolApprovals: boolean
  workflows: boolean
  cron: boolean
  memory: boolean
  skills: boolean
  channels: boolean
  costTracking: boolean
  hands: boolean
  branching: boolean
  voice: boolean
  a2a: boolean
  mcp: boolean
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface ConnectionConfig {
  gatewayUrl: string
  token: string
  agentName?: string
}

export interface StreamToken {
  sessionId: string
  messageId: string
  token: string
  done: boolean
}

export interface SessionFilter {
  status?: NormalizedSession['status']
  agentId?: string
  channel?: string
  limit?: number
}

export interface HistoryOpts {
  limit?: number
  before?: string
  includeTools?: boolean
}

export interface SpawnOpts {
  task: string
  model?: string
  label?: string
  parentId?: string
}

export interface SessionOpts {
  model?: string
  label?: string
}

export interface CostMetrics {
  totalCost: number
  inputTokens: number
  outputTokens: number
  byModel: Record<string, { cost: number; input: number; output: number }>
  bySession: Record<string, { cost: number; input: number; output: number }>
}

export interface TimeRange {
  from: string
  to: string
}

export interface ContextPressure {
  used: number
  total: number
  percentage: number
  level: 'low' | 'medium' | 'high' | 'critical'
}

export interface ThemeConfig {
  name: string
  primaryColor: string
  accentColor: string
  logo?: string
  favicon?: string
  title: string
  agentName: string
  userTitle: string
}
