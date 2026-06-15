# CurationPilot — REST API Specification

> **Status**: Updated — for backend team implementation  
> **Version**: 1.1.0  
> **Base URL**: `http://localhost:8080/api` (development)

---

## Overview

This document defines the REST API contract between the CurationPilot frontend and backend. The frontend consumes these endpoints to list skills, submit single and bulk execution requests, toggle execution status (pause/resume/cancel), and handle human-in-the-loop verification (approve/reject).

---

## Authentication

No authentication is required in the current version. Auth headers will be added in a future iteration.

---

## Common Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SKILL_NOT_FOUND",
    "message": "Skill with ID 'skill_999' does not exist"
  }
}
```

---

## Endpoints

### 1. List Skills

```
GET /api/skills
```

Returns all available skills grouped by category.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `search` | string | No | Filter skills by name or description (case-insensitive partial match) |

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_data_extraction",
        "name": "Data Extraction",
        "skills": [
          {
            "id": "skill_001",
            "name": "Extract Invoice Data",
            "description": "Navigates to the invoicing portal and extracts line items for a given date range",
            "category": "Data Extraction",
            "parameterCount": 4,
            "lastExecuted": "2026-06-14T10:30:00Z",
            "executionCount": 47
          }
        ]
      }
    ],
    "totalSkills": 5
  }
}
```

---

### 2. Get Skill Details

```
GET /api/skills/:id
```

Returns full skill metadata including its parameter schema.

**Path Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | string | Skill ID (e.g., `skill_001`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "skill_001",
    "name": "Extract Invoice Data",
    "description": "Navigates to the invoicing portal and extracts line items for a given date range",
    "category": "Data Extraction",
    "estimatedDuration": "2-5 minutes",
    "parameters": [
      {
        "name": "portal_url",
        "label": "Portal URL",
        "type": "url",
        "required": true,
        "placeholder": "https://invoices.example.com",
        "helpText": "The full URL of the invoicing portal login page",
        "defaultValue": null
      },
      {
        "name": "date_range_start",
        "label": "Start Date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "helpText": "Beginning of the extraction period",
        "defaultValue": null
      },
      {
        "name": "date_range_end",
        "label": "End Date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "helpText": "End of the extraction period",
        "defaultValue": null
      },
      {
        "name": "vendor_ids",
        "label": "Vendor IDs",
        "type": "comma_separated",
        "required": false,
        "placeholder": "V001, V002, V003",
        "helpText": "Comma-separated list of vendor IDs to filter. Leave empty for all vendors.",
        "defaultValue": null
      }
    ]
  }
}
```

---

### 3. Supported Parameter Types

The `type` field in each parameter object determines how the frontend renders the input:

| Type | Input Rendered | Value Format |
|---|---|---|
| `text` | Single-line text input | `"string value"` |
| `textarea` | Multi-line text area | `"multi\nline\nstring"` |
| `number` | Numeric input with step controls | `42` or `3.14` |
| `url` | Text input with URL validation | `"https://example.com"` |
| `email` | Text input with email validation | `"user@example.com"` |
| `date` | Date picker | `"2026-06-15"` (ISO 8601 date) |
| `select` | Dropdown with predefined options | `"option_value"` |
| `comma_separated` | Text input, parsed as array | `["V001", "V002", "V003"]` |
| `boolean` | Toggle switch | `true` or `false` |
| `password` | Masked text input | `"secret_value"` |

> [!IMPORTANT]
> **Data Parsing Behaviors:**
> - **Manual Input Mode**:
>   - `comma_separated` fields are input as a comma-separated string (e.g. `V001, V002`) and split on commas (`,`) to form an array.
> - **CSV Upload Mode**:
>   - Columns in the CSV file must correspond to the parameter `name` or `label` values.
>   - `boolean` columns are parsed as `true` if they contain `true`, `1`, `yes`, `enabled`, or `active` (case-insensitive). Otherwise, they default to `false`.
>   - `number` columns are converted to numeric values.
>   - `comma_separated` columns in CSV are split using **semicolons (`;`)** (e.g., `V001;V002;V003`) instead of commas, to avoid conflict with standard CSV cell boundaries.

---

### 4. Submit Execution

```
POST /api/executions
```

Submits a skill execution request. Supports both **Single Executions** and **CSV Bulk Executions**.

#### A. Single Run Request Body:

```json
{
  "skillId": "skill_001",
  "parameters": {
    "portal_url": "https://invoices.acme.com",
    "date_range_start": "2026-06-01",
    "date_range_end": "2026-06-15",
    "vendor_ids": ["V001", "V003"]
  }
}
```

#### B. CSV Bulk Run Request Body (Sent when user uploads a CSV):

```json
{
  "skillId": "skill_001",
  "parameters": {
    "isBulk": true,
    "rowCount": 12,
    "csvRows": [
      {
        "portal_url": "https://invoices.company-a.com",
        "date_range_start": "2026-06-01",
        "date_range_end": "2026-06-15",
        "vendor_ids": ["V001", "V002"]
      },
      {
        "portal_url": "https://portal.invoice-hub.net",
        "date_range_start": "2026-05-01",
        "date_range_end": "2026-05-31",
        "vendor_ids": ["V009"]
      }
      // ... up to rowCount records
    ],
    // Fallback: The properties from the first CSV row are ALSO merged into the root of `parameters`
    "portal_url": "https://invoices.company-a.com",
    "date_range_start": "2026-06-01",
    "date_range_end": "2026-06-15",
    "vendor_ids": ["V001", "V002"]
  }
}
```

> [!NOTE]
> For CSV bulk runs, the parameter payload is sent with `"isBulk": true` and `"rowCount": N`. The array of parsed parameters for each run is contained inside `"csvRows"`. For backward compatibility with single-run backends, the parameters of the first row (`csvRows[0]`) are copied directly to the root of the `"parameters"` object.

**Response:**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "queued",
    "skillId": "skill_001",
    "submittedAt": "2026-06-15T10:30:00Z"
  }
}
```

---

### 5. Get Execution Status

```
GET /api/executions/:id
```

Returns the current status, progress metrics, and logs of an execution.

**Path Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | string | Execution ID (e.g., `exec_abc123`) |

**Response (running):**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "running",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": null,
    "progress": {
      "currentStep": 3,
      "totalSteps": 8,
      "currentStepName": "Navigating to invoice list",
      "percentage": 37
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:03Z", "level": "info", "message": "Navigating to portal..." },
      { "timestamp": "2026-06-15T10:30:05Z", "level": "info", "message": "Step 3/8: Logging in" }
    ]
  }
}
```

---

### 6. Control Actions (Pause, Resume, Cancel)

All control endpoints perform state operations on the active execution runner. For optimal responsiveness, **each endpoint returns the fully-updated execution status object** (the same schema format returned by `GET /api/executions/:id`). This allows the frontend to update the active progress indicators and log screens instantly without waiting for the next short-polling tick.

#### A. Pause Execution
```
POST /api/executions/:id/pause
```
Halts the automation progress. Freezes step progress and appends a warning log. Returns the updated execution record.

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "paused",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": null,
    "progress": {
      "currentStep": 3,
      "totalSteps": 8,
      "currentStepName": "Navigating to invoice list",
      "percentage": 37
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:05Z", "level": "info", "message": "Step 3/8: Logging in" },
      { "timestamp": "2026-06-15T10:30:06Z", "level": "warn", "message": "Execution paused by user" }
    ]
  }
}
```

#### B. Resume Execution
```
POST /api/executions/:id/resume
```
Resumes a paused execution runner. Continues step updates and logs progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "running",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": null,
    "progress": {
      "currentStep": 3,
      "totalSteps": 8,
      "currentStepName": "Navigating to invoice list",
      "percentage": 37
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:06Z", "level": "warn", "message": "Execution paused by user" },
      { "timestamp": "2026-06-15T10:30:10Z", "level": "info", "message": "Execution resumed by user" }
    ]
  }
}
```

#### C. Cancel Execution
```
POST /api/executions/:id/cancel
```
Terminates a running/paused execution immediately. Appends a warning log and sets status to `'cancelled'`.

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "cancelled",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": null,
    "cancelledAt": "2026-06-15T10:30:15Z",
    "progress": {
      "currentStep": 3,
      "totalSteps": 8,
      "currentStepName": "Navigating to invoice list",
      "percentage": 37
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:15Z", "level": "warn", "message": "Execution cancelled by user" }
    ]
  }
}
```

---

### 7. Human-In-The-Loop (HITL) Actions

When the browser automation reaches a critical step (e.g., confirming a bank transfer, finalizing an invoice submission), it transitions to the `waiting_for_user` status. The frontend renders a confirmation dialog inside the chat window. The user must approve or reject to continue.

Like the control actions, **these endpoints return the fully-updated execution status object** so the frontend can react immediately.

#### A. Approve HITL Step
```
POST /api/executions/:id/approve
```
Resumes automation by authorizing the pending transaction. Shakes off the wait lock and sets state back to `'running'`.

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "running",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": null,
    "progress": {
      "currentStep": 4,
      "totalSteps": 8,
      "currentStepName": "Submitting transaction",
      "percentage": 50
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:05Z", "level": "warn", "message": "Awaiting human-in-the-loop approval to proceed with transaction submission." },
      { "timestamp": "2026-06-15T10:30:08Z", "level": "info", "message": "Human-in-the-loop approval received. Resuming automation." }
    ]
  }
}
```

#### B. Reject HITL Step
```
POST /api/executions/:id/reject
```
Aborts automation due to user rejection. Sets status to `'failed'`, appends a failure log, and sets the error reason.

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "failed",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": "2026-06-15T10:30:08Z",
    "error": {
      "message": "Execution rejected by user"
    },
    "progress": {
      "currentStep": 4,
      "totalSteps": 8,
      "currentStepName": "Submitting transaction",
      "percentage": 50
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:30:05Z", "level": "warn", "message": "Awaiting human-in-the-loop approval to proceed with transaction submission." },
      { "timestamp": "2026-06-15T10:30:08Z", "level": "error", "message": "Human-in-the-loop rejection received. Aborting execution." }
    ]
  }
}
```

---

## Execution Status States

The `status` parameter returned inside the execution response represents the current state of the engine:

| Status | Description |
|---|---|
| `queued` | Execution is waiting in queue to start |
| `running` | Automation is actively running steps in the browser |
| `paused` | User clicked Pause. execution is frozen, awaiting `resume` |
| `waiting_for_user` | Automation is paused, waiting for human confirmation (`approve`/`reject`) |
| `completed` | Finished successfully, results are populated |
| `failed` | Terminated due to error or user rejection |
| `cancelled` | Terminated by user clicking Cancel |

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `SKILL_NOT_FOUND` | 404 | Skill ID does not exist |
| `EXECUTION_NOT_FOUND` | 404 | Execution ID does not exist |
| `INVALID_PARAMETERS` | 400 | Submitted parameters fail validation |
| `MISSING_REQUIRED_PARAM` | 400 | A required parameter was not provided |
| `EXECUTION_ALREADY_COMPLETE` | 409 | Cannot modify a completed/failed execution |
| `SERVER_ERROR` | 500 | Unexpected server error |
