// Coconut — Eragon Backend Adapter
//
// Protocol notes:
// 1. WebSocket connects to <gatewayUrl>/ws?token=<TOKEN>  (works for both relay and direct)
// 2. Gateway sends: {type:"event", event:"connect.challenge", payload:{nonce:"..."}}
// 3. Client responds: {type:"req", id:"c1", method:"connect", params:{...}}
//    - client.id MUST be "eragon-control-ui"
//    - client.platform = "web", client.mode = "webchat"
// 4. API calls: {type:"req", id:"<uid>", method:"<method>", params:{...}}
// 5. API responses: {type:"res", id:"<uid>", ok:bool, payload:{...}, error:{code,message}}
// 6. Server events: {type:"event", event:"<name>", payload:{...}}
//
// Origin: browsers auto-set Origin to the page URL.
// Users must add Coconut's URL to gateway.controlUi.allowedOrigins in eragon.json
// OR set gateway.controlUi.allowInsecureAuth = true for local dev.

import type {
  ConnectionConfig,
  ConnectionStatus,
  NormalizedMessage,
  NormalizedSession,
  NormalizedAgent,
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

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

export class EragonAdapter implements AgentBackendAdapter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig | null = null
  private status: ConnectionStatus = 'disconnected'
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 50
  private baseReconnectDelay = 1000
  private reqIdCounter = 0
  private pendingRequests: Map<string, PendingRequest> = new Map()

  // Connect handshake
  private connectResolve: (() => void) | null = null
  private connectReject: ((e: Error) => void) | null = null

  // Gateway snapshot from connect response
  private gatewayVersion: string = 'unknown'
  private uptimeMs: number = 0
  private availableMethods: string[] = []

  // Main session key discovered from sessions.list
  private mainSessionKey: string | null = null

  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private messageCallbacks: Set<MessageCallback> = new Set()
  private streamCallbacks: Set<StreamCallback> = new Set()
  private toolCallCallbacks: Set<ToolCallCallback> = new Set()

  // ---- Connection lifecycle ----

  async connect(config: ConnectionConfig): Promise<void> {
    this.config = config
    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      this.connectResolve = resolve
      this.connectReject = reject

      try {
        const wsUrl = this.buildWsUrl(config)
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          // Don't resolve yet — wait for challenge-response handshake
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string) as Record<string, unknown>
            this.handleRawMessage(data)
          } catch {
            /* Non-JSON frame, ignore */
          }
        }

        this.ws.onclose = () => {
          // Clear pending requests
          for (const [, pending] of this.pendingRequests) {
            clearTimeout(pending.timer)
            pending.reject(new Error('WebSocket closed'))
          }
          this.pendingRequests.clear()

          if (this.status === 'connecting' && this.connectReject) {
            this.connectReject(new Error('WebSocket connection closed during handshake'))
            this.connectResolve = null
            this.connectReject = null
          } else if (this.status !== 'disconnected') {
            this.setStatus('reconnecting')
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = () => {
          if (this.status === 'connecting' && this.connectReject) {
            this.connectReject(new Error('WebSocket connection failed — check gateway URL and that the gateway is running'))
          }
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
    cb(this.status)
    return () => this.connectionCallbacks.delete(cb)
  }

  // ---- Chat ----

  async sendMessage(sessionId: string, text: string, _attachments?: Attachment[]): Promise<void> {
    const sessionKey = sessionId || this.mainSessionKey || 'main'
    await this.sendReq('chat.send', { sessionKey, text })
  }

  onMessage(cb: MessageCallback): () => void {
    this.messageCallbacks.add(cb)
    return () => this.messageCallbacks.delete(cb)
  }

  onStreamToken(cb: StreamCallback): () => void {
    this.streamCallbacks.add(cb)
    return () => this.streamCallbacks.delete(cb)
  }

  // ---- Sessions ----

  async listSessions(_filter?: SessionFilter): Promise<NormalizedSession[]> {
    const data = await this.sendReq<{ sessions?: unknown[]; count?: number }>('sessions.list', {})
    return (data.sessions || []).map((s) => this.normalizeSession(s as Record<string, unknown>))
  }

  async createSession(opts?: SessionOpts): Promise<NormalizedSession> {
    // Eragon doesn't have a sessions.create — sessions are created on first message
    // Return a placeholder session based on config
    const agentId = this.config?.agentName || 'main'
    const key = `agent:${agentId}:main`
    return {
      id: key,
      agentId,
      label: opts?.label || `New session`,
      model: 'claude-opus-4-6',
      status: 'idle',
      createdAt: new Date().toISOString(),
      messageCount: 0,
      tokenUsage: { input: 0, output: 0 },
    }
  }

  async resetSession(sessionId: string): Promise<void> {
    await this.sendReq('sessions.reset', { sessionKey: sessionId })
  }

  async getHistory(sessionId: string, opts?: HistoryOpts): Promise<NormalizedMessage[]> {
    const params: Record<string, unknown> = {
      sessionKey: sessionId,
      limit: opts?.limit ?? 50,
    }
    if (opts?.includeTools !== false) params.includeTools = true
    const data = await this.sendReq<{ messages?: unknown[] }>('chat.history', params)
    return (data.messages || []).map((m, i) =>
      this.normalizeMessage(m as Record<string, unknown>, sessionId, i)
    )
  }

  // ---- Agents ----

  async listAgents(): Promise<NormalizedAgent[]> {
    const data = await this.sendReq<{ agents?: unknown[] }>('agents.list', {})
    return (data.agents || []).map((a) => this.normalizeAgent(a as Record<string, unknown>))
  }

  async spawnAgent(_opts: SpawnOpts): Promise<NormalizedAgent> {
    throw new Error('spawnAgent not supported via Eragon gateway WebSocket protocol')
  }

  async killAgent(_agentId: string): Promise<void> {
    throw new Error('killAgent not supported via Eragon gateway WebSocket protocol')
  }

  async steerAgent(_agentId: string, _message: string): Promise<void> {
    throw new Error('steerAgent not supported via Eragon gateway WebSocket protocol')
  }

  // ---- Tool calls ----

  onToolCall(cb: ToolCallCallback): () => void {
    this.toolCallCallbacks.add(cb)
    return () => this.toolCallCallbacks.delete(cb)
  }

  async approveToolCall(callId: string): Promise<void> {
    await this.sendReq('exec.approval.resolve', { callId, decision: 'allow-once' })
  }

  async denyToolCall(callId: string): Promise<void> {
    await this.sendReq('exec.approval.resolve', { callId, decision: 'deny' })
  }

  // ---- System ----

  async getStatus(): Promise<SystemStatus> {
    try {
      const data = await this.sendReq<Record<string, unknown>>('status', {})
      const sessions = (data.sessions as Record<string, unknown>) || {}
      return {
        version: this.gatewayVersion,
        uptime_ms: this.uptimeMs,
        activeAgents: 0,
        activeSessions: (sessions.count as number) || 0,
        connectedChannels: this.extractChannelNames(data),
        costToday: 0,
        costThisMonth: 0,
        contextPressure: 'low',
        memoryUsageMb: 0,
      }
    } catch {
      return {
        version: this.gatewayVersion || 'unknown',
        uptime_ms: this.uptimeMs || 0,
        activeAgents: 0,
        activeSessions: 0,
        connectedChannels: [],
        costToday: 0,
        costThisMonth: 0,
        contextPressure: 'low',
        memoryUsageMb: 0,
      }
    }
  }

  async getCostMetrics(_range: TimeRange): Promise<CostMetrics> {
    try {
      const data = await this.sendReq<Record<string, unknown>>('usage.cost', {})
      return data as unknown as CostMetrics
    } catch {
      return {} as CostMetrics
    }
  }

  async getContextPressure(_sessionId: string): Promise<ContextPressure> {
    return {
      used: 0,
      total: 200000,
      percentage: 0,
      level: 'low',
    }
  }

  capabilities(): BackendCapabilities {
    return {
      streaming: true,
      subAgents: false,
      toolApprovals: this.availableMethods.includes('exec.approval.resolve'),
      workflows: false,
      cron: this.availableMethods.includes('cron.list'),
      memory: false,
      skills: this.availableMethods.includes('skills.status'),
      channels: this.availableMethods.includes('channels.status'),
      costTracking: this.availableMethods.includes('usage.cost'),
      hands: false,
      branching: false,
      voice: this.availableMethods.includes('tts.convert'),
      a2a: false,
      mcp: false,
    }
  }

  // ---- Private: URL construction ----

  private buildWsUrl(config: ConnectionConfig): string {
    // Normalize to ws/wss
    let base = config.gatewayUrl
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://')

    // Strip trailing slash
    base = base.replace(/\/$/, '')

    // Append /ws path if not already present
    if (!base.endsWith('/ws')) {
      base = `${base}/ws`
    }

    // Add token as query param (required by relay for routing; also works on direct gateway)
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}token=${encodeURIComponent(config.token)}`
  }

  // ---- Private: WebSocket message handler ----

  private handleRawMessage(data: Record<string, unknown>) {
    const type = data.type as string

    // Server-initiated events
    if (type === 'event') {
      const event = data.event as string
      const payload = (data.payload || {}) as Record<string, unknown>

      switch (event) {
        case 'connect.challenge':
          this.handleChallenge()
          break

        case 'health':
        case 'tick':
          // Heartbeat — ignore
          break

        case 'message':
        case 'chat.message': {
          // Full message arrived
          const sessionKey = (payload.sessionKey as string) || this.mainSessionKey || 'main'
          const msg = this.normalizeMessage(payload, sessionKey, Date.now())
          this.messageCallbacks.forEach((cb) => cb(msg))
          break
        }

        case 'chat.token':
        case 'token':
        case 'stream.token': {
          // Streaming token
          const sessionKey = (payload.sessionKey as string) || this.mainSessionKey || 'main'
          const messageId = (payload.messageId as string) || (payload.id as string) || 'streaming'
          const token = (payload.token as string) || (payload.text as string) || ''
          const done = !!(payload.done || payload.end)
          this.streamCallbacks.forEach((cb) => cb({ sessionId: sessionKey, messageId, token, done }))
          break
        }

        case 'exec.approval.requested': {
          // Tool call approval needed
          const sessionKey = (payload.sessionKey as string) || this.mainSessionKey || 'main'
          const toolMsg = this.normalizeToolApprovalRequest(payload, sessionKey)
          this.toolCallCallbacks.forEach((cb) => cb(toolMsg))
          break
        }

        default:
          // Unhandled event — could log in dev
          break
      }
      return
    }

    // Request/response
    if (type === 'res') {
      const id = data.id as string
      const pending = this.pendingRequests.get(id)
      if (pending) {
        clearTimeout(pending.timer)
        this.pendingRequests.delete(id)
        if (data.ok) {
          pending.resolve(data.payload || {})
        } else {
          const err = (data.error as Record<string, unknown>) || {}
          pending.reject(new Error((err.message as string) || `Request failed: ${id}`))
        }
      }

      // Special: handle connect response
      if (id === 'coconut-connect') {
        if (data.ok) {
          const payload = (data.payload || {}) as Record<string, unknown>
          const server = (payload.server || {}) as Record<string, unknown>
          const features = (payload.features || {}) as Record<string, unknown>
          const snapshot = (payload.snapshot || {}) as Record<string, unknown>

          this.gatewayVersion = (server.version as string) || 'unknown'
          this.uptimeMs = (snapshot.uptimeMs as number) || 0
          this.availableMethods = (features.methods as string[]) || []

          this.reconnectAttempts = 0
          this.setStatus('connected')

          if (this.connectResolve) {
            this.connectResolve()
            this.connectResolve = null
            this.connectReject = null
          }
        } else {
          const err = (data.error as Record<string, unknown>) || {}
          const msg = (err.message as string) || 'Connection rejected by gateway'
          this.setStatus('error')
          if (this.connectReject) {
            this.connectReject(new Error(msg))
            this.connectResolve = null
            this.connectReject = null
          }
        }
      }
    }
  }

  private handleChallenge() {
    if (!this.config || !this.ws) return
    const req = {
      type: 'req',
      id: 'coconut-connect',
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        auth: { token: this.config.token },
        role: 'operator',
        scopes: ['operator.admin'],
        caps: ['tool-events'],
        client: {
          id: 'eragon-control-ui',
          version: 'coconut-1.0.0',
          platform: 'web',
          mode: 'webchat',
          instanceId: `coconut-${Date.now()}`,
        },
      },
    }
    this.ws.send(JSON.stringify(req))
  }

  // ---- Private: Request/response ----

  private sendReq<T = Record<string, unknown>>(method: string, params: unknown): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Not connected'))
    }

    const id = `req-${++this.reqIdCounter}`
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, 15000)

      this.pendingRequests.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timer,
      })

      this.ws!.send(JSON.stringify({ type: 'req', id, method, params }))
    })
  }

  // ---- Private: Status / reconnect ----

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.connectionCallbacks.forEach((cb) => cb(status))
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error')
      return
    }
    const delay = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      if (this.config) this.connect(this.config).catch(() => {})
    }, delay)
  }

  // ---- Private: Channel helper ----

  private extractChannelNames(data: Record<string, unknown>): string[] {
    const summary = data.channelSummary as string[] | undefined
    if (Array.isArray(summary)) {
      return summary
        .filter((s) => !s.startsWith(' '))
        .map((s) => s.split(':')[0].trim())
        .filter(Boolean)
    }
    return []
  }

  // ---- Private: Normalization ----

  private normalizeSession(data: Record<string, unknown>): NormalizedSession {
    const key = (data.key as string) || (data.sessionId as string) || ''
    const updatedAt = data.updatedAt as number | undefined
    return {
      id: key,
      agentId: data.agentId as string | undefined,
      label: (data.displayName as string) || (data.label as string) || key,
      model: (data.model as string) || 'unknown',
      status: 'idle',
      createdAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
      lastMessageAt: updatedAt ? new Date(updatedAt).toISOString() : undefined,
      lastMessagePreview: data.lastMessagePreview as string | undefined,
      messageCount: (data.messageCount as number) || 0,
      tokenUsage: (data.tokenUsage as NormalizedSession['tokenUsage']) || { input: 0, output: 0 },
      channel: data.kind as string | undefined,
      metadata: { sessionId: data.sessionId, kind: data.kind, chatType: data.chatType },
    }
  }

  private normalizeMessage(
    data: Record<string, unknown>,
    sessionId: string,
    index: number | string
  ): NormalizedMessage {
    const role = (data.role as NormalizedMessage['role']) || 'assistant'
    const timestamp = data.timestamp as number | string | undefined

    // Eragon content is an array of typed blocks
    const rawContent = data.content
    let contentText = ''
    let blocks: ContentBlock[] | undefined

    if (Array.isArray(rawContent)) {
      blocks = rawContent.map((block) => this.normalizeContentBlock(block as Record<string, unknown>))
      // Extract text for the content string
      contentText = rawContent
        .filter((b: unknown) => (b as Record<string, unknown>).type === 'text')
        .map((b: unknown) => (b as Record<string, unknown>).text as string)
        .join('\n')
    } else if (typeof rawContent === 'string') {
      contentText = rawContent
    }

    const id =
      (data.id as string) ||
      (data.messageId as string) ||
      `${sessionId}-${typeof index === 'number' ? index : Date.now()}`

    return {
      id,
      sessionId,
      role,
      content: contentText,
      blocks: blocks?.length ? blocks : undefined,
      timestamp:
        typeof timestamp === 'number'
          ? new Date(timestamp).toISOString()
          : (timestamp as string) || new Date().toISOString(),
      model: data.model as string | undefined,
      tokenUsage: data.tokenUsage as NormalizedMessage['tokenUsage'],
      metadata: {
        api: data.api,
        provider: data.provider,
        stopReason: data.stopReason,
      },
    }
  }

  private normalizeContentBlock(block: Record<string, unknown>): ContentBlock {
    const type = block.type as string
    switch (type) {
      case 'text':
        return { type: 'text', text: (block.text as string) || '' }

      case 'thinking':
        return { type: 'thinking', text: (block.thinking as string) || (block.text as string) || '' }

      case 'toolCall':
      case 'tool_call':
      case 'tool_use':
        return {
          type: 'tool_call',
          id: (block.id as string) || '',
          name: (block.name as string) || '',
          args: (block.arguments as Record<string, unknown>) || (block.input as Record<string, unknown>) || {},
          result: block.result as string | undefined,
          error: block.error as string | undefined,
          duration_ms: block.duration_ms as number | undefined,
          status: (block.status as Extract<ContentBlock, { type: 'tool_call' }>['status']) || 'success',
        }

      case 'toolResult':
      case 'tool_result':
        return {
          type: 'tool_call',
          id: (block.toolUseId as string) || (block.id as string) || '',
          name: '',
          args: {},
          result: Array.isArray(block.content)
            ? (block.content as Array<{ text?: string }>).map((c) => c.text || '').join('\n')
            : (block.content as string) || '',
          status: 'success',
        }

      default:
        return { type: 'text', text: JSON.stringify(block) }
    }
  }

  private normalizeAgent(data: Record<string, unknown>): NormalizedAgent {
    return {
      id: (data.id as string) || '',
      status: 'idle',
      task: data.name as string | undefined,
      model: 'unknown',
      startedAt: new Date().toISOString(),
      elapsed_ms: 0,
      tokenUsage: { input: 0, output: 0 },
    }
  }

  private normalizeToolApprovalRequest(
    payload: Record<string, unknown>,
    sessionId: string
  ): NormalizedMessage {
    const callId = (payload.callId as string) || (payload.id as string) || crypto.randomUUID()
    const command = (payload.command as string) || (payload.text as string) || ''
    return {
      id: callId,
      sessionId,
      role: 'tool',
      content: command,
      blocks: [
        {
          type: 'tool_call',
          id: callId,
          name: (payload.tool as string) || 'exec',
          args: (payload.args as Record<string, unknown>) || { command },
          status: 'approval_required',
        },
      ],
      timestamp: new Date().toISOString(),
      metadata: { approvalRequired: true, callId },
    }
  }
}
