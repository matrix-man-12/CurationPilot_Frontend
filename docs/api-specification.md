# CurationPilot — REST API Specification

> **Status**: Draft — for backend team implementation  
> **Version**: 1.0.0  
> **Base URL**: `http://localhost:8080/api` (development)

---

## Overview

This document defines the REST API contract between the CurationPilot frontend and backend. The frontend will consume these endpoints to list skills, submit execution requests, and retrieve results.

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
| `search` | string | No | Filter skills by name (case-insensitive partial match) |
| `category` | string | No | Filter by category name |

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
      },
      {
        "id": "cat_data_entry",
        "name": "Data Entry",
        "skills": [
          {
            "id": "skill_002",
            "name": "Submit Timesheet",
            "description": "Fills and submits weekly timesheet on the HR portal",
            "category": "Data Entry",
            "parameterCount": 3,
            "lastExecuted": "2026-06-13T16:00:00Z",
            "executionCount": 120
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
        "defaultValue": null,
        "validation": {
          "pattern": "^https?://",
          "message": "Must be a valid URL starting with http:// or https://"
        }
      },
      {
        "name": "date_range_start",
        "label": "Start Date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "helpText": "Beginning of the extraction period",
        "defaultValue": null,
        "validation": null
      },
      {
        "name": "date_range_end",
        "label": "End Date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "helpText": "End of the extraction period",
        "defaultValue": null,
        "validation": null
      },
      {
        "name": "vendor_ids",
        "label": "Vendor IDs",
        "type": "comma_separated",
        "required": false,
        "placeholder": "V001, V002, V003",
        "helpText": "Comma-separated list of vendor IDs to filter. Leave empty for all vendors.",
        "defaultValue": null,
        "validation": null
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

For `select` type, the parameter includes an `options` array:

```json
{
  "name": "output_format",
  "label": "Output Format",
  "type": "select",
  "options": [
    { "value": "csv", "label": "CSV" },
    { "value": "json", "label": "JSON" },
    { "value": "xlsx", "label": "Excel" }
  ]
}
```

---

### 4. Submit Execution

```
POST /api/executions
```

Submits a skill execution request with the provided parameters.

**Request Body:**

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

**Response:**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "queued",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "parameters": {
      "portal_url": "https://invoices.acme.com",
      "date_range_start": "2026-06-01",
      "date_range_end": "2026-06-15",
      "vendor_ids": ["V001", "V003"]
    }
  }
}
```

---

### 5. Get Execution Status

```
GET /api/executions/:id
```

Returns the current state of an execution.

**Path Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | string | Execution ID (e.g., `exec_abc123`) |

**Response (in progress):**

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
      { "timestamp": "2026-06-15T10:30:05Z", "level": "info", "message": "Login successful" }
    ]
  }
}
```

**Response (completed):**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "completed",
    "skillId": "skill_001",
    "skillName": "Extract Invoice Data",
    "submittedAt": "2026-06-15T10:30:00Z",
    "startedAt": "2026-06-15T10:30:02Z",
    "completedAt": "2026-06-15T10:32:15Z",
    "duration": "2m 13s",
    "result": {
      "summary": "Successfully extracted 24 invoice line items from 3 vendors",
      "outputUrl": "/downloads/exec_abc123_output.csv",
      "data": {
        "invoicesFound": 24,
        "vendorsProcessed": 3,
        "totalAmount": 45230.50
      }
    },
    "logs": [
      { "timestamp": "2026-06-15T10:30:02Z", "level": "info", "message": "Opening browser..." },
      { "timestamp": "2026-06-15T10:32:15Z", "level": "info", "message": "Extraction complete. 24 items found." }
    ]
  }
}
```

**Possible `status` values:**

| Status | Description |
|---|---|
| `queued` | Execution is waiting to start |
| `running` | Execution is in progress |
| `completed` | Execution finished successfully |
| `failed` | Execution encountered an error |
| `cancelled` | Execution was cancelled by the user |

---

### 6. Cancel Execution

```
POST /api/executions/:id/cancel
```

Requests cancellation of a running execution.

**Response:**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "cancelled",
    "cancelledAt": "2026-06-15T10:31:00Z"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `SKILL_NOT_FOUND` | 404 | Skill ID does not exist |
| `EXECUTION_NOT_FOUND` | 404 | Execution ID does not exist |
| `INVALID_PARAMETERS` | 400 | Submitted parameters fail validation |
| `MISSING_REQUIRED_PARAM` | 400 | A required parameter was not provided |
| `EXECUTION_ALREADY_COMPLETE` | 409 | Cannot cancel a completed execution |
| `SERVER_ERROR` | 500 | Unexpected server error |
