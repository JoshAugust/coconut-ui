# Coconut Overnight Polish — 2026-04-10/11

## Design Direction
- **Glassmorphism**: Frosted glass cards with backdrop-blur, translucent layers
- **Aurora gradients**: Animated multi-color gradient backgrounds (subtle, not garish)  
- **Dark-first**: Rich dark theme with luminous accents
- **Micro-interactions**: Hover states, transitions, loading shimmers, entrance animations
- **Linear/Stripe quality**: Clean typography, generous whitespace, purposeful motion
- **Smooth routing transitions**: Page transitions with framer-motion AnimatePresence

## Phase 1: Theme Overhaul (Foundation)
- [ ] New CSS custom properties — glassmorphism variables (blur, opacity, border)
- [ ] Aurora gradient background (animated, subtle)
- [ ] Glass card component (reusable base)
- [ ] Typography scale refinement (Inter or system font, proper hierarchy)
- [ ] Color palette expansion (surface variants, glow effects)
- [ ] Shimmer/skeleton loading component

## Phase 2: Connect Screen Polish
- [ ] Animated aurora background
- [ ] Glass card for the form
- [ ] Input focus animations
- [ ] Connection progress animation
- [ ] Smooth transition to main app

## Phase 3: Layout & Navigation
- [ ] Glass sidebar with backdrop blur
- [ ] Active route indicator animation (sliding pill)
- [ ] Sidebar collapse/expand with spring animation  
- [ ] Header with subtle glass effect
- [ ] Page transition animations (AnimatePresence)

## Phase 4: Chat View Excellence
- [ ] Message entrance animations (staggered)
- [ ] Typing indicator with animated dots
- [ ] Smooth auto-scroll with intersection observer
- [ ] Code block syntax highlighting with copy button
- [ ] Tool call cards with glass effect + status animations
- [ ] Thinking block with animated shimmer border
- [ ] Approval cards with glow effect on hover

## Phase 5: Dashboard Wow Factor ✅ DONE
- [x] Animated number counters (count-up effect)
- [x] Context gauge with animated SVG ring
- [x] Sparkline mini-charts in status cards
- [x] Glass cards with hover lift effect
- [x] Cost tracker with animated progress bars

## Phase 6: Agent & Panel Polish
- [x] Agent tree with animated connection lines
- [x] Status badges with pulse animations
- [x] Memory browser with glass cards
- [x] Tool timeline with animated entry
- [x] Cron scheduler with toggle animations
- [x] AgentCard glassmorphism + status glow

## Phase 7: Mobile & PWA
- [x] Responsive sidebar (sheet on mobile)
- [x] Touch-friendly hit targets
- [x] Bottom nav on mobile
- [ ] Pull-to-refresh gesture
- [ ] Improved PWA icons

## Phase 8: Testing & Ship
- [ ] Test real gateway connection via relay
- [ ] Fix any WebSocket protocol mismatches
- [ ] Final build, push, verify deployment
