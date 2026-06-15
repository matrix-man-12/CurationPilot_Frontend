# CurationPilot — Project Overview

## What is CurationPilot?

CurationPilot is an AI-powered operations automation platform. It converts manual browser-based workflows into executable, parameterized **skills** — Playwright scripts that can be triggered on demand through an API.

### The Pipeline

```
Manual Workflow → Playwright Script → API Endpoint → Frontend Interface
```

1. **Skill Creation**: Human operators perform tasks manually while the system records the workflow.
2. **Script Generation**: The recorded workflow is converted into a fixed Playwright script with parameterized inputs.
3. **API Exposure**: Each script is wrapped as a REST API endpoint that accepts dynamic parameters and returns execution results.
4. **Frontend Execution**: Users interact with skills through this chat-based frontend — selecting a skill, providing parameters, and monitoring execution.

## Architecture

```
┌─────────────────┐     REST / WebSocket     ┌──────────────────┐
│   Frontend      │ ◄──────────────────────► │   Backend API    │
│   (React/Vite)  │                          │                  │
│                 │                          │  ┌────────────┐  │
│  - Chat UI      │                          │  │ Playwright  │  │
│  - Skill Select │                          │  │ Runner      │  │
│  - Param Forms  │                          │  └────────────┘  │
│  - Exec Status  │                          │                  │
└─────────────────┘                          └──────────────────┘
```

## Frontend Role

The frontend is the user-facing interface. It:

- **Lists available skills** via a searchable, categorized dropdown
- **Collects dynamic parameters** through auto-generated forms based on skill schemas
- **Submits execution requests** to the backend
- **Displays real-time execution progress** (via polling now, WebSocket later)
- **Maintains a session history** so users can review past executions

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Vanilla CSS with CSS Custom Properties |
| State | React Context + localStorage persistence |
| API | Fetch API with mock service layer |
| Real-time (future) | WebSocket |

## Current Status

- **Frontend**: Current stage is highly functional. Core modules include:
  - **Chat Interface**: Interactive chat timeline incorporating System prompt bubbles, searchable and categorized skill selectors, parameter input forms, and live execution updates.
  - **Bulk Execution (CSV)**: Built-in drag-and-drop CSV loader, client-side JS CSV parser with schema validation, expected headers indicators, and scrollable data tables for loaded sets.
  - **Controls Panel**: Live toolbar providing Pause, Resume, and Cancel execution requests.
  - **Human-in-the-loop (HITL)**: Contextual decision prompts blocking Playwright execution until explicit user Approve/Reject confirmation is submitted.
  - **Multi-Sensory Alerts (HITL)**: Desktop push notifications (HTML5 Notification API), visual browser tab flashing (toggling document title), and synthetically generated audio beeps (Web Audio API) alert the user when an execution enters the HITL (`waiting_for_user`) validation state, ensuring they are notified instantly even when working in other tabs or minimized windows.
  - **Logs Stream**: Live console log viewport streaming real-time operational messages (persistent in-chat logs and historical logs surviving page reloads).
  - **History View**: Searchable list of past sessions, loading full chat recovery from local storage.
- **Backend**: Not yet started — the API specifications are finalized for REST endpoints (see [api-specification.md](./api-specification.md)), with WebSockets drafted for a subsequent phase (see [websocket-specification.md](./websocket-specification.md)).
- **Integration Layer**: Swappable API interface module (`src/services/api.js`) targeting local mock endpoints in `src/services/mockApi.js` with simulated delays. Ready to target the real backend URL parameters.
