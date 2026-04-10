// Coconut — Eragon Backend Adapter
// Connects to an Eragon gateway via WebSocket + REST

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
  ContentBlock,
} from '../types'
import type {
  AgentBackendAdapter,
  MessageCallback,
  StreamCallback,
  ConnectionCallback,
  ToolCallCallback,
} from './interface'

export class EragonAdapter implements AgentBackendAdapter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig | null = null
  private status: ConnectionStatus = 'disconnected'
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 50
  private baseReconnectDelay = 1000

  // Callback registries
  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private messageCallbacks: Set<MessageCallback> = new Set()
  private streamCallbacks: Set<StreamCallback> = new Set()
  private toolCallCallbacks: Set<ToolCallCallback> = new Set()

  // Message assembly for streaming
  private streamingMessages: Map<string, { content: string; blocks: ContentBlock[] }> = new Map()

  async connect(config: ConnectionConfig): Promise<void> {
    this.config = config
    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = config.gatewayUrl.replace(/^http/, 'ws')
        const url = new URL('/ws/chat', wsUrl)
        url.searchParams.set('token', config.token)

        this.ws = new WebSocket(url.toString())

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          this.setStatus('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch {
            // Non-JSON message, ignore
          }
        }

        this.ws.onclose = () => {
          if (this.status !== 'disconnected') {
            this.setStatus('reconnecting')
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (err) => {
          if (this.status === 'connecting') {
            reject(new Error('WebSocket connection failed'))
          }
          console.error('[Eragon] WebSocket error:', err)
        }
      } catch (err) {
        this.setStatus('error')
        reject(err)
      }
    })
  }

  async disconnect(): Promise<void> {
    this.setStatus('disconnected')
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  onConnectionChange(cb: ConnectionCallback): () => void {
    this.connectionCallbacks.add(cb)
    cb(this.status) // Immediate callback with current status
    return () => this.connectionCallbacks.delete(cb)
  }

  async sendMessage(
    _sessionId: string,
    text: string,
    _attachments?: Attachment[]
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected')
    }
    this.ws.send(JSON.stringify({ type: 'chat', text }))
  }

  onMessage(cb: MessageCallback): () => void {
    this.messageCallbacks.add(cb)
    return () => this.messageCallbacks.delete(cb)
  }

  onStreamToken(cb: StreamCallback): () => void {
    this.streamCallbacks.add(cb)
    return () => this.streamCallbacks.delete(cb)
  }

  async listSessions(_filter?: SessionFilter): Promise<NormalizedSession[]> {
    const data = await this.apiCall('GET', '/api/sessions')
    return (data.sessions || []).map(this.normalizeSession)
  }

  async createSession(_opts?: SessionOpts): Promise<NormalizedSession> {
    const data = await this.apiCall('POST', '/api/sessions', { action: 'new' })
    return this.normalizeSession(data.session)
  }

  async resetSession(sessionId: string): Promise<void> {
    await this.apiCall('POST', `/api/sessions/${sessionId}/reset`)
  }

  async getHistory(
    sessionId: string,
    opts?: HistoryOpts
  ): Promise<NormalizedMessage[]> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.includeTools) params.set('includeTools', 'true')
    const data = await this.apiCall(
      'GET',
      `/api/sessions/${sessionId}/history?${params}`
    )
    return (data.messages || []).map((m: Record<string, unknown>) =>
      this.normalizeMessage(m, sessionId)
    )
  }

  async listAgents(): Promise<NormalizedAgent[]> {
    const data = await this.apiCall('GET', '/api/agents')
    return (data.agents || []).map(this.normalizeAgent)
  }

  async spawnAgent(opts: SpawnOpts): Promise<NormalizedAgent> {
    const data = await this.apiCall('POST', '/api/agents/spawn', opts)
    return this.normalizeAgent(data.agent)
  }

  async killAgent(agentId: string): Promise<void> {
    await this.apiCall('POST', `/api/agents/${agentId}/kill`)
  }

  async steerAgent(agentId: string, message: string): Promise<void> {
    await this.apiCall('POST', `/api/agents/${agentId}/steer`, { message })
  }

  onToolCall(cb: ToolCallCallback): () => void {
    this.toolCallCallbacks.add(cb)
    return () => this.toolCallCallbacks.delete(cb)
  }

  async approveToolCall(callId: string): Promise<void> {
    this.ws?.send(JSON.stringify({ type: 'approve', callId }))
  }

  async denyToolCall(callId: string): Promise<void> {
    this.ws?.send(JSON.stringify({ type: 'deny', callId }))
  }

  async getStatus(): Promise<SystemStatus> {
    const data = await this.apiCall('GET', '/api/status')
    return {
      version: data.version || 'unknown',
      uptime_ms: data.uptime_ms || 0,
      activeAgents: data.activeAgents || 0,
      activeSessions: data.activeSessions || 0,
      connectedChannels: data.connectedChannels || [],
      costToday: data.costToday || 0,
      costThisMonth: data.costThisMonth || 0,
      contextPressure: data.contextPressure || 'low',
      memoryUsageMb: data.memoryUsageMb || 0,
    }
  }

  async getCostMetrics(_range: TimeRange): Promise<CostMetrics> {
    const data = await this.apiCall('GET', '/api/cost')
    return data as CostMetrics
  }

  async getContextPressure(_sessionId: string): Promise<ContextPressure> {
    const data = await this.apiCall('GET', '/api/context-pressure')
    return {
      used: data.used || 0,
      total: data.total || 200000,
      percentage: data.percentage || 0,
      level: data.level || 'low',
    }
  }

  capabilities(): BackendCapabilities {
    return {
      streaming: true,
      subAgents: true,
      toolApprovals: true,
      workflows: false,
      cron: true,
      memory: true,
      skills: true,
      channels: true,
      costTracking: true,
      hands: false,
      branching: false,
      voice: true,
      a2a: false,
      mcp: true,
    }
  }

  // --- Private helpers ---

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.connectionCallbacks.forEach((cb) => cb(status))
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error')
      return
    }
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    )
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch(() => {
          // Will trigger onclose → scheduleReconnect again
        })
      }
    }, delay)
  }

  private handleMessage(data: Record<string, unknown>) {
    const type = data.type as string

    switch (type) {
      case 'stream_start': {
        const msgId = (data.messageId as string) || crypto.randomUUID()
        this.streamingMessages.set(msgId, { content: '', blocks: [] })
        break
      }

      case 'stream_token': {
        const msgId = (data.messageId as string) || ''
        const token = (data.token as string) || ''
        const existing = this.streamingMessages.get(msgId)
        if (existing) {
          existing.content += token
        }
        this.streamCallbacks.forEach((cb) =>
          cb({
            sessionId: (data.sessionId as string) || 'main',
            messageId: msgId,
            token,
            done: false,
          })
        )
        break
      }

      case 'stream_end':
      case 'message': {
        const msg = this.normalizeMessage(
          data,
          (data.sessionId as string) || 'main'
        )
        // Clean up streaming state
        if (msg.id) this.streamingMessages.delete(msg.id)
        this.messageCallbacks.forEach((cb) => cb(msg))
        break
      }

      case 'tool_call': {
        const toolMsg = this.normalizeMessage(
          data,
          (data.sessionId as string) || 'main'
        )
        this.toolCallCallbacks.forEach((cb) => cb(toolMsg))
        break
      }

      case 'agent_update': {
        // Agent status changes — could trigger re-fetch of agent list
        break
      }
    }
  }

  private normalizeMessage(
    data: Record<string, unknown>,
    sessionId: string
  ): NormalizedMessage {
    return {
      id: (data.id as string) || (data.messageId as string) || crypto.randomUUID(),
      sessionId,
      role: (data.role as NormalizedMessage['role']) || 'assistant',
      content: (data.content as string) || (data.text as string) || '',
      blocks: (data.blocks as ContentBlock[]) || undefined,
      timestamp: (data.timestamp as string) || new Date().toISOString(),
      model: data.model as string,
      tokenUsage: data.tokenUsage as NormalizedMessage['tokenUsage'],
      replyTo: data.replyTo as string,
      attachments: data.attachments as NormalizedMessage['attachments'],
      metadata: data.metadata as Record<string, unknown>,
      streaming: (data.type === 'stream_token') || false,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeSession(data: any): NormalizedSession {
    return {
      id: data.id || data.sessionId || '',
      agentId: data.agentId,
      label: data.label,
      model: data.model || 'unknown',
      status: data.status || 'idle',
      createdAt: data.createdAt || new Date().toISOString(),
      lastMessageAt: data.lastMessageAt,
      lastMessagePreview: data.lastMessagePreview,
      messageCount: data.messageCount || 0,
      tokenUsage: data.tokenUsage || { input: 0, output: 0 },
      channel: data.channel,
      metadata: data.metadata,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeAgent(data: any): NormalizedAgent {
    return {
      id: data.id || '',
      parentId: data.parentId,
      status: data.status || 'running',
      task: data.task,
      model: data.model || 'unknown',
      startedAt: data.startedAt || new Date().toISOString(),
      elapsed_ms: data.elapsed_ms || 0,
      tokenUsage: data.tokenUsage || { input: 0, output: 0 },
      sessionId: data.sessionId,
    }
  }

  private async apiCall(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Record<string, unknown>> {
    if (!this.config) throw new Error('Not configured')
    const baseUrl = this.config.gatewayUrl.replace(/^ws/, 'http')
    const url = `${baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.token}`,
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }
}
