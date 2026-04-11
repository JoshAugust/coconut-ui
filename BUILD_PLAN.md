# Build Plan: Coconut UI Premium Polish

Target: Arc/Linear/Raycast-quality dark mode UI.

## Tasks

### Group A (parallel — no dependencies)
- [ ] T1: **Design System Overhaul** (index.css) — Sonnet — 15 min
  - Richer dark backgrounds (not pure black — use navy-tinted darks like #0c0d14, #12131f)
  - Better text color hierarchy (primary brighter, secondary warmer, muted less washed out)
  - Refined glass variables (more visible blur, warmer tints)
  - Add `--color-bg-elevated` for cards that need to pop
  - Better shadow definitions for depth
  - Add Inter font import from Google Fonts

- [ ] T2: **Chat Components Premium Rewrite** — Opus — 25 min
  - MessageBubble: Assistant bubbles need subtle left accent border (like iMessage), user bubbles keep gradient but richer colors
  - ThinkingBlock: Distinctive visual — frosted purple card with animated shimmer edge while "thinking"
  - ToolCallCard: More compact header, colored left border by status (green=success, blue=running, red=error)
  - ChatInput: Richer glass effect, subtle inner shadow, focus glow ring
  - Better spacing rhythm: 16px between messages, 8px between blocks within a message

- [ ] T3: **Sidebar & Sessions Polish** — Sonnet — 15 min
  - SessionItem: Subtle hover gradient, active state with left accent + slightly elevated bg, better truncation
  - SessionSearch: Larger touch target, focus ring animation
  - Left panel header: Coconut logo area more premium (subtle gradient behind it)
  - Better visual separator between brand area and session list

- [ ] T4: **Right Panel & Agent Cards Polish** — Sonnet — 15 min
  - AppShell right panel header tabs: pill-style active state with subtle glow
  - Agent cards: keep the tree/glow dots (they're good), but refine card backgrounds for more depth
  - Memory browser: cards need more visual distinction from background
  - Empty states: add subtle illustrations or richer iconography

### Group B (after A — depends on T1 CSS changes)
- [ ] T5: **Integration Test & Final Tweaks** — Sonnet — 10 min
  - Verify build compiles (npx tsc --noEmit && npx vite build)
  - Check all components render in demo mode
  - Fix any visual inconsistencies between components
  - Push final commit

## Parallel Groups
- Group A: T1, T2, T3, T4 (all independent)
- Group B: T5 (after all of A complete)
