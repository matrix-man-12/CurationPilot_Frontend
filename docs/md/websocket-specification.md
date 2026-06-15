# CurationPilot — WebSocket & Webhook Specification

> **Status**: Draft — for future implementation  
> **Version**: 1.0.0

---

## Overview

Once the backend supports real-time communication, the frontend will use **WebSockets** to receive live execution updates instead of polling the REST API. **Webhooks** are an outbound mechanism for the backend to notify external systems.

---

## WebSocket Connection

### Endpoint

```
ws://localhost:8080/ws/executions/:executionId
```

Production:
```
wss://api.curationpilot.com/ws/executions/:executionId
```

### Connection Lifecycle

```
1. Frontend submits POST /api/executions → receives executionId
2. Frontend opens WebSocket to /ws/executions/:executionId
3. Server sends events as execution progresses
4. Connection closes when execution reaches a terminal state (completed/failed/cancelled)
```

### Authentication (future)

When auth is added, the WebSocket handshake will include:

```
ws://host/ws/executions/:id?token=<jwt_token>
```

---

## Server → Client Events

All events follow this format:

```json
{
  "event": "execution.step",
  "timestamp": "2026-06-15T10:30:05Z",
  "data": { ... }
}
```

### `execution.started`

Sent when the execution begins running.

```json
{
  "event": "execution.started",
  "timestamp": "2026-06-15T10:30:02Z",
  "data": {
    "executionId": "exec_abc123",
    "totalSteps": 8
  }
}
```

### `execution.step`

Sent when the execution completes a step.

```json
{
  "event": "execution.step",
  "timestamp": "2026-06-15T10:30:05Z",
  "data": {
    "executionId": "exec_abc123",
    "step": 3,
    "totalSteps": 8,
    "stepName": "Navigating to invoice list",
    "percentage": 37,
    "screenshotUrl": "/screenshots/exec_abc123_step3.png"
  }
}
```

### `execution.log`

Real-time log output from the Playwright script.

```json
{
  "event": "execution.log",
  "timestamp": "2026-06-15T10:30:05Z",
  "data": {
    "executionId": "exec_abc123",
    "level": "info",
    "message": "Login successful, navigating to invoice page"
  }
}
```

Log levels: `debug`, `info`, `warn`, `error`

### `execution.completed`

Sent when execution finishes successfully.

```json
{
  "event": "execution.completed",
  "timestamp": "2026-06-15T10:32:15Z",
  "data": {
    "executionId": "exec_abc123",
    "duration": "2m 13s",
    "result": {
      "summary": "Successfully extracted 24 invoice line items",
      "outputUrl": "/downloads/exec_abc123_output.csv",
      "data": {
        "invoicesFound": 24,
        "vendorsProcessed": 3,
        "totalAmount": 45230.50
      }
    }
  }
}
```

### `execution.failed`

Sent when execution encounters an error.

```json
{
  "event": "execution.failed",
  "timestamp": "2026-06-15T10:31:45Z",
  "data": {
    "executionId": "exec_abc123",
    "error": {
      "code": "NAVIGATION_TIMEOUT",
      "message": "Timed out waiting for invoice list page to load",
      "step": 3,
      "screenshotUrl": "/screenshots/exec_abc123_error.png"
    }
  }
}
```

### `execution.cancelled`

Sent when a cancel request is confirmed.

```json
{
  "event": "execution.cancelled",
  "timestamp": "2026-06-15T10:31:00Z",
  "data": {
    "executionId": "exec_abc123",
    "cancelledAt": "2026-06-15T10:31:00Z"
  }
}
```

---

## Client → Server Events

### `execution.cancel`

Client requests cancellation of the running execution.

```json
{
  "event": "execution.cancel",
  "data": {
    "executionId": "exec_abc123"
  }
}
```

---

## Frontend Integration Plan

### Phase 1 (Current): REST Polling

```javascript
// Poll every 2 seconds while execution is running
const pollExecution = async (executionId) => {
  const response = await api.getExecutionStatus(executionId);
  if (response.data.status === 'running') {
    setTimeout(() => pollExecution(executionId), 2000);
  }
  return response;
};
```

### Phase 2 (Future): WebSocket

```javascript
// src/hooks/useWebSocket.js
const useWebSocket = (executionId) => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://host/ws/executions/${executionId}`);
    
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setEvents(prev => [...prev, parsed]);
      
      // Handle terminal states
      if (['execution.completed', 'execution.failed', 'execution.cancelled'].includes(parsed.event)) {
        ws.close();
      }
    };
    
    return () => ws.close();
  }, [executionId]);
  
  return events;
};
```

### Migration Path

1. The `useExecution` hook currently uses polling
2. When WebSocket is ready, swap the internal implementation to `useWebSocket`
3. The component interface stays identical — no UI changes needed

---

## Webhooks (Backend → External Systems)

Webhooks allow the backend to notify external systems when executions complete or fail.

### Configuration (Backend Admin)

```json
{
  "webhookUrl": "https://your-system.com/webhooks/curationpilot",
  "events": ["execution.completed", "execution.failed"],
  "secret": "whsec_..."
}
```

### Webhook Payload

```json
{
  "event": "execution.completed",
  "timestamp": "2026-06-15T10:32:15Z",
  "data": {
    "executionId": "exec_abc123",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "status": "completed",
    "duration": "2m 13s",
    "result": {
      "summary": "Successfully extracted 24 invoice line items"
    }
  },
  "signature": "sha256=..."
}
```

### Signature Verification

The backend signs webhook payloads using HMAC-SHA256 with the configured secret. The receiving system should verify the `signature` header before processing.

---

## Reconnection Strategy

If the WebSocket connection drops:

1. Frontend detects disconnect (`ws.onclose`)
2. Wait 1 second, then attempt reconnect
3. On reconnect, fetch current state via `GET /api/executions/:id` to sync
4. Resume listening for new events
5. Exponential backoff: 1s → 2s → 4s → 8s → max 30s
6. After 10 failed attempts, fall back to REST polling
