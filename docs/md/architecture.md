# CurationPilot Frontend — Architecture

## Component Tree

```
App
├── AppHeader
│   ├── Logo + Title
│   └── Navigation (Chat / History / Logs tabs)
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
├── HistoryView (when nav = "history")
│   ├── SearchBar
│   └── SessionList
│       └── SessionCard (skill name, date, status)
│           └── onClick → loads session into ChatView
│
└── LogsView (when nav = "logs")
    ├── Toolbar (filters, pause/resume, clear)
    └── Monospace logs viewport
```

## State Architecture

```
AppContext (React Context)
│
├── currentView: "chat" | "history" | "logs"
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
├── Layout/
│   ├── AppHeader.jsx
│   └── AppHeader.css
├── Chat/
│   ├── ChatContainer.jsx
│   ├── ChatContainer.css
│   ├── MessageBubble.jsx
│   ├── MessageBubble.css
│   ├── SkillSelector.jsx
│   ├── SkillSelector.css
│   ├── ParameterForm.jsx
│   ├── ParameterForm.css
│   ├── ExecutionStatus.jsx
│   └── ExecutionStatus.css
├── History/
│   ├── HistoryView.jsx
│   ├── HistoryView.css
│   ├── SessionCard.jsx
│   └── SessionCard.css
├── Logs/
│   ├── LogsView.jsx
│   └── LogsView.css
├── common/
│   ├── Button.jsx
│   ├── Button.css
│   ├── Input.jsx
│   ├── Input.css
│   ├── Select.jsx
│   ├── Select.css
│   └── Spinner.jsx
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

1. **No Router** — Three views (`chat`, `history`, `logs`) are managed using React state variables rather than URL routing to keep transition handling lightweight.
2. **Single Active Session** — One active chat is handled at a time. The active session holds parameter configurations, log streams, execution status, progress metrics, and transaction validation flags.
3. **Mock API Layer** — `mockApi.js` mirrors the real backend API interfaces. Real-world parameters and response wrappers match perfectly, allowing a clean swap when the real backend REST endpoints are ready.
4. **localStorage Persistence** —
   - **Session Store**: All past and active chat sessions (including in-chat execution logs inside message `meta` properties) are saved to `localStorage`, surviving page refreshes and view switches.
   - **Live Logs Store**: Console operations logged in the `Logs` tab are buffered in `localStorage` to avoid clearing them when transitioning views.
   - **Execution Tracker**: The active execution store maps IDs to current operational states in `localStorage`, allowing the client component to automatically resume short-polling when mounting.
5. **CSS Custom Properties** — Custom design tokens are organized in `variables.css`, facilitating a highly custom, responsive warm-pastel visual system without depending on external CSS frameworks.
