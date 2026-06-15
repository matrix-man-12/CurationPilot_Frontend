# CurationPilot Frontend — Architecture

## Component Tree

```
App
├── AppHeader
│   ├── Logo + Title
│   └── Navigation (Chat / History toggle)
│
├── ChatView (when nav = "chat")
│   └── ChatContainer
│       ├── MessageList (scrollable)
│       │   ├── MessageBubble (system)
│       │   │   └── SkillSelector (nested expandable + searchable dropdown)
│       │   ├── MessageBubble (system)
│       │   │   └── ParameterForm (dynamic fields from skill schema)
│       │   │       ├── FormField (rendered per parameter type)
│       │   │       └── SubmitButton
│       │   ├── MessageBubble (user — submitted params summary)
│       │   └── MessageBubble (system)
│       │       └── ExecutionStatus (progress bar, logs, result)
│       └── (no input bar — all interaction happens via components in messages)
│
└── HistoryView (when nav = "history")
    ├── SearchBar
    └── SessionList
        └── SessionCard (skill name, date, status)
            └── onClick → loads session into ChatView
```

## State Architecture

```
AppContext (React Context)
│
├── currentView: "chat" | "history"
├── activeSession: {
│     id, skillId, skillName, messages[], status, parameters, result
│   }
├── sessions: [] (all past sessions, persisted to localStorage)
│
├── dispatch actions:
│   ├── SET_VIEW
│   ├── START_NEW_SESSION
│   ├── SELECT_SKILL
│   ├── SUBMIT_PARAMETERS
│   ├── UPDATE_EXECUTION
│   ├── COMPLETE_EXECUTION
│   ├── FAIL_EXECUTION
│   ├── LOAD_SESSION (from history)
│   └── CLEAR_SESSION
```

## Data Flow

```
User Action          →  Dispatch         →  State Change       →  UI Update
─────────────────────────────────────────────────────────────────────────────
Select skill         →  SELECT_SKILL     →  activeSession      →  Show ParameterForm
Submit params        →  SUBMIT_PARAMS    →  messages + API     →  Show ExecutionStatus
Execution updates    →  UPDATE_EXEC      →  activeSession      →  Update progress
Click history item   →  LOAD_SESSION     →  activeSession      →  Restore full chat
```

## Directory Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppHeader.jsx
│   │   └── AppHeader.css
│   ├── Chat/
│   │   ├── ChatContainer.jsx
│   │   ├── ChatContainer.css
│   │   ├── MessageBubble.jsx
│   │   ├── MessageBubble.css
│   │   ├── SkillSelector.jsx
│   │   ├── SkillSelector.css
│   │   ├── ParameterForm.jsx
│   │   ├── ParameterForm.css
│   │   ├── ExecutionStatus.jsx
│   │   └── ExecutionStatus.css
│   ├── History/
│   │   ├── HistoryView.jsx
│   │   ├── HistoryView.css
│   │   ├── SessionCard.jsx
│   │   └── SessionCard.css
│   └── common/
│       ├── Button.jsx
│       ├── Button.css
│       ├── Input.jsx
│       ├── Input.css
│       ├── Select.jsx
│       ├── Select.css
│       └── Spinner.jsx
├── context/
│   └── AppContext.jsx
├── hooks/
│   ├── useSkills.js
│   ├── useExecution.js
│   └── useWebSocket.js  (prepared, not active)
├── services/
│   ├── api.js
│   └── mockApi.js
├── mocks/
│   └── skills.json
├── styles/
│   ├── variables.css
│   ├── reset.css
│   └── global.css
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Key Design Decisions

1. **No router** — two views (Chat/History) managed by state, not URL routes
2. **Single active session** — one chat at a time, simplified state
3. **Mock API layer** — `mockApi.js` mirrors real API interface, swap when backend ready
4. **localStorage persistence** — sessions survive page refresh
5. **CSS Custom Properties** — design tokens in `variables.css`, no CSS framework
