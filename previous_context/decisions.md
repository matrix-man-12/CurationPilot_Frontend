# CurationPilot — Key Decisions

> **Purpose**: Record of architectural and design decisions with rationale. Prevents re-debating in future sessions.

---

## Decision 1: Single Active Chat (No Multi-Tab)

**Date**: 2026-06-15  
**Decision**: Only one active chat session at a time. Users switch between Chat view and History view.  
**Rationale**: Simplifies state management. Each skill execution is a focused task — users don't need parallel conversations. History view provides access to all past sessions.  
**Alternatives considered**: Multi-tab interface with unlimited tabs.

---

## Decision 2: Warm Pastel Color Palette

**Date**: 2026-06-15  
**Decision**: Warm pastel palette with peach coral primary (`#E8A87C`), warm ivory surface (`#F9F5F0`). No blue, purple, or indigo shades.  
**Rationale**: User preference. Creates a unique, approachable look for an internal operations tool — distinct from typical enterprise blue/gray.  
**Primary colors**: Peach coral, sage green (success), soft rose (error), soft gold (warning).

---

## Decision 3: Nested Expandable Searchable Skill Dropdown

**Date**: 2026-06-15  
**Decision**: Skills are displayed in a nested dropdown, grouped by category, with a search/filter bar at the top. Categories expand/collapse.  
**Rationale**: As the number of skills grows, flat lists become unwieldy. Categories provide structure; search provides speed.  
**Implementation**: Custom React component (no library dependency).

---

## Decision 4: Mock API Layer

**Date**: 2026-06-15  
**Decision**: Build a mock API service (`src/services/mockApi.js`) that mirrors the real API interface. Swap to real backend by changing the base URL.  
**Rationale**: Backend is not ready. Frontend development shouldn't be blocked. Mock data enables realistic UI testing.  
**Migration plan**: `api.js` exports functions that call `mockApi.js` internally. When backend is ready, change imports.

---

## Decision 5: localStorage Persistence

**Date**: 2026-06-15  
**Decision**: All session data (active session, past sessions) is persisted to localStorage.  
**Rationale**: Tabs should survive page refresh (user requirement). No backend session storage needed yet.  
**Key**: `curationpilot_sessions` and `curationpilot_active_session`.

---

## Decision 6: No Authentication (v1)

**Date**: 2026-06-15  
**Decision**: Skip authentication for the initial version.  
**Rationale**: Internal tool, not public-facing yet. Auth will be added when the backend is ready.

---

## Decision 7: CSS Custom Properties (No Framework)

**Date**: 2026-06-15  
**Decision**: Use vanilla CSS with CSS Custom Properties for theming. No Tailwind, no CSS-in-JS.  
**Rationale**: Maximum control over the design system. Lighter bundle. Design tokens centralized in `variables.css`.

---

## Decision 8: Polling → WebSocket Migration Path

**Date**: 2026-06-15  
**Decision**: Start with REST polling for execution status (2-second interval). Migrate to WebSocket when backend supports it.  
**Rationale**: Simpler to implement initially. `useExecution` hook abstracts the transport — components don't care how updates arrive.  
**Spec**: See `docs/websocket-specification.md`.
