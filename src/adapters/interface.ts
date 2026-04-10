// Coconut — Backend Adapter Interface
// Every backend (Eragon, OpenFang, etc.) implements this contract

import type {
  ConnectionConfig,
  ConnectionStatus,
  NormalizedMessage,
  NormalizedSession,
  NormalizedAgent,
  StreamToken,
  SystemStatus,
  CostMetrics,
  ContextPressure,
  BackendCapabilities,
  SessionFilter,
  HistoryOpts,
  SpawnOpts,
  SessionOpts,
  TimeRange,
  Attachment,
} from '../types'

export type MessageCallback = (msg: NormalizedMessage) => void
export type StreamCallback = (token: StreamToken) => void
export type ConnectionCallback = (status: ConnectionStatus) => void
export type ToolCallCallback = (call: NormalizedMessage) => void

export interface AgentBackendAdapter {
  // Connection lifecycle
  connect(config: ConnectionConfig): Promise<void>
  disconnect(): Promise<void>
  onConnectionChange(cb: ConnectionCallback): () => void

  // Chat
  sendMessage(
    sessionId: string,
    text: string,
    attachments?: Attachment[]
  ): Promise<void>
  onMessage(cb: MessageCallback): () => void
  onStreamToken(cb: StreamCallback): () => void

  // Sessions
  listSessions(filter?: SessionFilter): Promise<NormalizedSession[]>
  createSession(opts?: SessionOpts): Promise<NormalizedSession>
  resetSession(sessionId: string): Promise<void>
  getHistory(
    sessionId: string,
    opts?: HistoryOpts
  ): Promise<NormalizedMessage[]>

  // Agents
  listAgents(): Promise<NormalizedAgent[]>
  spawnAgent(opts: SpawnOpts): Promise<NormalizedAgent>
  killAgent(agentId: string): Promise<void>
  steerAgent(agentId: string, message: string): Promise<void>

  // Tools
  onToolCall(cb: ToolCallCallback): () => void
  approveToolCall(callId: string): Promise<void>
  denyToolCall(callId: string): Promise<void>

  // System
  getStatus(): Promise<SystemStatus>
  getCostMetrics(range: TimeRange): Promise<CostMetrics>
  getContextPressure(sessionId: string): Promise<ContextPressure>

  // Capabilities
  capabilities(): BackendCapabilities
}
