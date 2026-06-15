import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const STORAGE_KEY_SESSIONS = 'curationpilot_sessions';
const STORAGE_KEY_ACTIVE = 'curationpilot_active_session';

function createSession() {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    skillId: null,
    skillName: null,
    skillDescription: null,
    messages: [
      {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: 'welcome',
        timestamp: new Date().toISOString(),
      },
    ],
    status: 'selecting_skill', // selecting_skill | entering_params | executing | completed | failed | cancelled
    parameters: null,
    executionId: null,
    result: null,
  };
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const initialState = {
  currentView: 'chat', // 'chat' | 'history'
  activeSession: loadFromStorage(STORAGE_KEY_ACTIVE, null) || createSession(),
  sessions: loadFromStorage(STORAGE_KEY_SESSIONS, []),
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'START_NEW_SESSION': {
      // Save current session to history if it has a skill selected
      const updatedSessions = state.activeSession.skillId
        ? [state.activeSession, ...state.sessions]
        : state.sessions;
      return {
        ...state,
        currentView: 'chat',
        activeSession: createSession(),
        sessions: updatedSessions,
      };
    }

    case 'SELECT_SKILL': {
      const { skillId, skillName, skillDescription } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          skillId,
          skillName,
          skillDescription,
          status: 'entering_params',
          messages: [
            ...state.activeSession.messages,
            {
              id: `msg_${Date.now()}_1`,
              type: 'user',
              content: `Selected: ${skillName}`,
              timestamp: now,
            },
            {
              id: `msg_${Date.now()}_2`,
              type: 'system',
              content: 'enter_params',
              timestamp: now,
              meta: { skillName, skillDescription },
            },
          ],
        },
      };
    }

    case 'SUBMIT_PARAMETERS': {
      const { parameters, parameterLabels } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          parameters,
          status: 'executing',
          messages: [
            ...state.activeSession.messages,
            {
              id: `msg_${Date.now()}_1`,
              type: 'user',
              content: 'params_submitted',
              timestamp: now,
              meta: { parameters, parameterLabels },
            },
            {
              id: `msg_${Date.now()}_2`,
              type: 'system',
              content: 'executing',
              timestamp: now,
            },
          ],
        },
      };
    }

    case 'SET_EXECUTION_ID':
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          executionId: action.payload,
        },
      };

    case 'UPDATE_EXECUTION':
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          executionData: action.payload,
        },
      };

    case 'COMPLETE_EXECUTION': {
      const now = new Date().toISOString();
      const completedSession = {
        ...state.activeSession,
        status: 'completed',
        result: action.payload,
        completedAt: now,
        messages: [
          ...state.activeSession.messages,
          {
            id: `msg_${Date.now()}`,
            type: 'system',
            content: 'completed',
            timestamp: now,
            meta: { result: action.payload },
          },
        ],
      };
      return {
        ...state,
        activeSession: completedSession,
      };
    }

    case 'FAIL_EXECUTION': {
      const now = new Date().toISOString();
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          status: 'failed',
          messages: [
            ...state.activeSession.messages,
            {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: 'failed',
              timestamp: now,
              meta: { error: action.payload },
            },
          ],
        },
      };
    }

    case 'LOAD_SESSION': {
      // Save current session first if it has content
      const currentSessions = state.activeSession.skillId
        ? state.sessions.map((s) =>
            s.id === state.activeSession.id ? state.activeSession : s
          )
        : state.sessions;

      const loadedSession = state.sessions.find((s) => s.id === action.payload);
      if (!loadedSession) return state;

      return {
        ...state,
        currentView: 'chat',
        activeSession: loadedSession,
        sessions: currentSessions,
      };
    }

    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(state.activeSession));
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(state.sessions));
    } catch {
      // localStorage might be full — fail silently
    }
  }, [state.activeSession, state.sessions]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
}
