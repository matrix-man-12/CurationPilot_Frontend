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

- **Frontend**: In active development (chat interface, skill selection, parameter forms)
- **Backend**: Not yet started — using mock APIs for frontend development
- **API Contract**: Defined (see [api-specification.md](./api-specification.md))
- **WebSocket Contract**: Defined (see [websocket-specification.md](./websocket-specification.md))
