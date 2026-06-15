# CurationPilot — API Contracts (Quick Reference)

> **Purpose**: Quick reference for current API contract state. For full details, see `docs/api-specification.md`.

## Base URL

```
Development: http://localhost:8080/api
```

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/skills` | List all skills (grouped by category) |
| GET | `/api/skills/:id` | Get skill details + parameter schema |
| POST | `/api/executions` | Submit skill execution |
| GET | `/api/executions/:id` | Get execution status |
| POST | `/api/executions/:id/cancel` | Cancel running execution |

## Parameter Types

`text`, `textarea`, `number`, `url`, `email`, `date`, `select`, `comma_separated`, `boolean`, `password`

## Execution Statuses

`queued` → `running` → `completed` | `failed` | `cancelled`

## Response Envelope

```json
{ "success": true/false, "data": {...}, "error": {...} }
```

## WebSocket (Future)

```
ws://host/ws/executions/:executionId
```

Events: `execution.started`, `execution.step`, `execution.log`, `execution.completed`, `execution.failed`, `execution.cancelled`

## Current Status

**Backend**: Not started. Frontend uses mock API layer.  
**Last updated**: 2026-06-15
