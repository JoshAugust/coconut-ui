# Coconut Build Orchestration

## Architecture
- Main session = orchestrator (spawns all agents, monitors, pushes to GitHub)
- Sub-agents = workers (build components, write files, exit)
- All work happens in: /Users/corgi12/.eragon-joshua_augustine/joshua_augustine_workspace/coconut/

## Wave 1: Core Components (5 agents)
1. **Layout Agent** — Layout.tsx, Sidebar, Header, ConnectScreen
2. **Chat Agent** — ChatView, MessageBubble, ChatInput, MarkdownRenderer, ToolCallCard, ThinkingBlock
3. **Sessions Agent** — SessionList, SessionItem, SessionSearch
4. **Agents Panel Agent** — AgentTree, AgentCard, AgentPanel
5. **Dashboard Agent** — DashboardView, StatusCards, CostChart

## Wave 2: Extended Features (after Wave 1 completes)
6. **Command Palette + Keyboard** — cmdk integration, all shortcuts
7. **Tools Timeline** — ToolTimeline, ToolTimelineItem
8. **Settings + Theme** — SettingsPanel, ThemeToggle, ConnectionSettings

## File Ownership
Each agent writes ONLY to its assigned directories. No cross-writes.

## Completion Signal
Each agent writes a `.done` file when finished:
- `src/components/layout/.done`
- `src/components/chat/.done`
- `src/components/sessions/.done`
- `src/components/agents/.done`
- `src/components/dashboard/.done`
