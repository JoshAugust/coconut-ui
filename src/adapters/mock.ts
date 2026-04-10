// Coconut — Mock Backend Adapter
// For demo/testing without a real gateway

import type {
  ConnectionConfig,
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
} from '../types'
import type {
  AgentBackendAdapter,
  MessageCallback,
  StreamCallback,
  ConnectionCallback,
  ToolCallCallback,
} from './interface'

const DEMO_MESSAGES: NormalizedMessage[] = [
  {
    id: '1',
    sessionId: 'demo',
    role: 'system',
    content: 'Session started',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    sessionId: 'demo',
    role: 'user',
    content: 'Hey Brock, what can Coconut do?',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    sessionId: 'demo',
    role: 'assistant',
    content: `Coconut is a **universal agent dashboard** — a single UI that connects to any agent backend via an adapter pattern. Here's what you're looking at, my Tribal Chief:\n\n### Core Features\n- **Real-time chat** with streaming, markdown, and tool call rendering\n- **Session management** — multiple concurrent sessions with search and grouping\n- **Sub-agent orchestration** — spawn, steer, and kill agents from the org chart\n- **Tool execution timeline** — see every tool call chronologically\n- **Memory browser** — search and filter agent memories by source\n- **Cost dashboard** — per-session, per-model token attribution\n- **Command palette** — hit \`Cmd+K\` to search anything\n\n### Keyboard Shortcuts\n| Shortcut | Action |\n|----------|--------|\n| ⌘K | Command palette |\n| ⌘1 | Go to Chat |\n| ⌘2 | Go to Dashboard |\n| ⌘3 | Go to Agents |\n\nThe UI is backend-agnostic. Right now you're seeing the **demo mode** — connect a real Eragon gateway to see live data.`,
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    model: 'anthropic/claude-opus-4-6',
    tokenUsage: { input: 245, output: 312, cost: 0.0156 },
    blocks: [
      {
        type: 'tool_call',
        id: 'tc1',
        name: 'read',
        args: { path: 'UNIVERSAL_AGENT_UI_SPEC.md' },
        result: '# Universal Agent Dashboard UI...',
        duration_ms: 42,
        status: 'success' as const,
      },
    ],
  },
  {
    id: '4',
    sessionId: 'demo',
    role: 'user',
    content: 'Nice. Can you show me the thinking blocks too?',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: '5',
    sessionId: 'demo',
    role: 'assistant',
    content: 'Here\'s a message with a thinking block and a tool call — this is what they look like in Coconut:',
    timestamp: new Date(Date.now() - 3200000).toISOString(),
    model: 'anthropic/claude-opus-4-6',
    blocks: [
      {
        type: 'thinking',
        text: 'The user wants to see thinking blocks. Let me demonstrate one with some realistic reasoning content. I should also show a tool call with an approval state to demonstrate the full range of message rendering.\n\nThinking blocks are collapsible by default — the user can expand them to see the model\'s chain of thought. This is useful for debugging and understanding how the agent arrived at a decision.',
      },
      {
        type: 'text',
        text: 'Thinking blocks collapse by default — click to expand. Tool cards show status, duration, and args. Approval cards get **Approve** and **Deny** buttons.',
      },
      {
        type: 'tool_call',
        id: 'tc2',
        name: 'exec',
        args: { command: 'npm run build' },
        result: '✓ built in 231ms\n\n0 errors, 0 warnings',
        duration_ms: 1240,
        status: 'success' as const,
      },
      {
        type: 'tool_call',
        id: 'tc3',
        name: 'web_search',
        args: { query: 'best agent dashboard UI 2026' },
        status: 'approval_required' as const,
      },
    ],
  },
]

const DEMO_SESSIONS: NormalizedSession[] = [
  {
    id: 'demo',
    label: 'Demo Session',
    model: 'claude-opus-4-6',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 3200000).toISOString(),
    lastMessagePreview: 'Thinking blocks collapse by default...',
    messageCount: 5,
    tokenUsage: { input: 1200, output: 800, cost: 0.052 },
    channel: 'web',
  },
  {
    id: 'session-2',
    label: 'Build Pipeline',
    model: 'claude-sonnet-4-6',
    status: 'idle',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessageAt: new Date(Date.now() - 5400000).toISOString(),
    lastMessagePreview: 'Deploy complete, all tests passing',
    messageCount: 23,
    tokenUsage: { input: 8400, output: 4200, cost: 0.18 },
    channel: 'telegram',
  },
  {
    id: 'session-3',
    label: 'Research Task',
    model: 'claude-opus-4-6',
    status: 'archived',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessageAt: new Date(Date.now() - 43200000).toISOString(),
    lastMessagePreview: 'Saved findings to research.md',
    messageCount: 45,
    tokenUsage: { input: 22000, output: 12000, cost: 0.94 },
  },
]

const DEMO_AGENTS: NormalizedAgent[] = [
  {
    id: 'agent-1',
    status: 'running',
    task: 'Building React components for the Coconut dashboard — currently on the chat panel with streaming support',
    model: 'claude-opus-4-6',
    startedAt: new Date(Date.now() - 300000).toISOString(),
    elapsed_ms: 300000,
    tokenUsage: { input: 4500, output: 2100, cost: 0.18 },
    sessionId: 'demo',
  },
  {
    id: 'agent-2',
    parentId: 'agent-1',
    status: 'completed',
    task: 'Write MarkdownRenderer.tsx with syntax highlighting and code copy buttons',
    model: 'claude-sonnet-4-6',
    startedAt: new Date(Date.now() - 600000).toISOString(),
    elapsed_ms: 180000,
    tokenUsage: { input: 2200, output: 1800, cost: 0.04 },
  },
  {
    id: 'agent-3',
    parentId: 'agent-1',
    status: 'running',
    task: 'Build the session sidebar with search, grouping, and drag-to-reorder',
    model: 'claude-sonnet-4-6',
    startedAt: new Date(Date.now() - 120000).toISOString(),
    elapsed_ms: 120000,
    tokenUsage: { input: 1800, output: 900, cost: 0.028 },
  },
  {
    id: 'agent-4',
    status: 'failed',
    task: 'Deploy to Vercel with custom domain joshuaaugustine.page',
    model: 'claude-sonnet-4-6',
    startedAt: new Date(Date.now() - 900000).toISOString(),
    elapsed_ms: 60000,
    tokenUsage: { input: 800, output: 400, cost: 0.012 },
  },
]

export class MockAdapter implements AgentBackendAdapter {
  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private messageCallbacks: Set<MessageCallback> = new Set()
  private streamCallbacks: Set<StreamCallback> = new Set()
  private toolCallCallbacks: Set<ToolCallCallback> = new Set()

  async connect(_config: ConnectionConfig): Promise<void> {
    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 800))
    this.connectionCallbacks.forEach((cb) => cb('connected'))
  }

  async disconnect(): Promise<void> {
    this.connectionCallbacks.forEach((cb) => cb('disconnected'))
  }

  onConnectionChange(cb: ConnectionCallback): () => void {
    this.connectionCallbacks.add(cb)
    cb('connected')
    return () => this.connectionCallbacks.delete(cb)
  }

  async sendMessage(_sessionId: string, text: string, _attachments?: Attachment[]): Promise<void> {
    // Simulate response after a delay
    setTimeout(() => {
      const response: NormalizedMessage = {
        id: crypto.randomUUID(),
        sessionId: 'demo',
        role: 'assistant',
        content: `You said: "${text}"\n\nThis is a **demo response** from the mock adapter. Connect a real Eragon gateway to get actual responses from your agent.\n\nTry exploring the sidebar — check out the Dashboard, Agents, Memory, Tools, and Scheduler pages!`,
        timestamp: new Date().toISOString(),
        model: 'mock/demo',
        tokenUsage: { input: 50, output: 80, cost: 0.001 },
      }
      this.messageCallbacks.forEach((cb) => cb(response))
    }, 1500)
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
    return DEMO_SESSIONS
  }

  async createSession(_opts?: SessionOpts): Promise<NormalizedSession> {
    return {
      id: crypto.randomUUID(),
      label: 'New Session',
      model: 'claude-opus-4-6',
      status: 'active',
      createdAt: new Date().toISOString(),
      messageCount: 0,
      tokenUsage: { input: 0, output: 0 },
    }
  }

  async resetSession(_sessionId: string): Promise<void> {}

  async getHistory(_sessionId: string, _opts?: HistoryOpts): Promise<NormalizedMessage[]> {
    return DEMO_MESSAGES
  }

  async listAgents(): Promise<NormalizedAgent[]> {
    return DEMO_AGENTS
  }

  async spawnAgent(_opts: SpawnOpts): Promise<NormalizedAgent> {
    return DEMO_AGENTS[0]
  }

  async killAgent(_agentId: string): Promise<void> {}
  async steerAgent(_agentId: string, _message: string): Promise<void> {}

  onToolCall(cb: ToolCallCallback): () => void {
    this.toolCallCallbacks.add(cb)
    return () => this.toolCallCallbacks.delete(cb)
  }

  async approveToolCall(_callId: string): Promise<void> {}
  async denyToolCall(_callId: string): Promise<void> {}

  async getStatus(): Promise<SystemStatus> {
    return {
      version: '0.1.0',
      uptime_ms: 3600000,
      activeAgents: 2,
      activeSessions: 3,
      connectedChannels: ['telegram', 'web'],
      costToday: 1.24,
      costThisMonth: 18.67,
      contextPressure: 'medium',
      memoryUsageMb: 256,
    }
  }

  async getCostMetrics(_range: TimeRange): Promise<CostMetrics> {
    return {
      totalCost: 18.67,
      inputTokens: 450000,
      outputTokens: 220000,
      byModel: {
        'claude-opus-4-6': { cost: 14.20, input: 280000, output: 140000 },
        'claude-sonnet-4-6': { cost: 4.47, input: 170000, output: 80000 },
      },
      bySession: {},
    }
  }

  async getContextPressure(_sessionId: string): Promise<ContextPressure> {
    return {
      used: 82000,
      total: 200000,
      percentage: 41,
      level: 'medium',
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
}
