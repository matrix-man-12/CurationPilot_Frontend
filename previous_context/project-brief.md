# CurationPilot — Project Brief

> **Purpose**: This file provides essential context for new chat sessions. Read this first when starting a new conversation about this project.

## What is CurationPilot?

An AI-powered operations automation platform. It converts manual browser-based workflows into executable "skills" — Playwright scripts exposed as APIs. This repo is the **frontend** — a React chat interface where users select skills, fill parameters, and run them.

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS with CSS Custom Properties (warm pastel palette)
- **State**: React Context + useReducer + localStorage persistence
- **Fonts**: Inter (UI) + JetBrains Mono (technical text)
- **API**: Mock API layer (backend not ready yet)

## Key Concepts

- **Skill**: A Playwright script wrapped as an API. Has a name, category, description, and dynamic parameters.
- **Execution**: A single run of a skill with specific parameter values. Has states: queued → running → completed/failed/cancelled.
- **Session**: A chat conversation where a user selects a skill, fills parameters, runs it, and sees results. Sessions are persisted.
- **Category**: Skills are grouped into categories (Data Extraction, Data Entry, Reporting, etc.)

## UI Structure

- **Single active chat** — no multi-tab. One conversation at a time.
- **Chat flow**: skill dropdown → parameter form → submit → execution status → result
- **History view**: Lists past sessions. Clicking restores the full chat.
- **Skill selector**: Nested expandable dropdown, grouped by category, searchable.
- **Parameter form**: Renders dynamically from skill schema. ~40% viewport height, scrollable.

## Design Direction

- **Light theme** with warm pastel colors (peach coral primary `#E8A87C`, warm ivory surface)
- **No blue/purple/indigo** — warm tones only
- Professional but approachable

## Current State

- Project initialized with Vite + React boilerplate
- Documentation created in `docs/`
- API specification ready for backend team
- WebSocket specification drafted for future real-time updates
- Frontend implementation in progress

## Important File Locations

| What | Where |
|---|---|
| API spec (for backend team) | `docs/api-specification.md` |
| WebSocket spec | `docs/websocket-specification.md` |
| Architecture | `docs/architecture.md` |
| Design tokens | `docs/design-system.md` |
| Task history | `previous_context/task-history.md` |
| Key decisions | `previous_context/decisions.md` |
| API contracts quick ref | `previous_context/api-contracts.md` |
| Task backlog | `tasks/backlog.md` |
