import { useAppState, useAppDispatch } from '../../context/AppContext';
import './AppHeader.css';

export default function AppHeader() {
  const { currentView } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <header className="app-header" id="app-header">
      <div className="header-left">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="var(--color-primary)" />
            <path
              d="M8 14C8 10.6863 10.6863 8 14 8C17.3137 8 20 10.6863 20 14"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="14" cy="17" r="2" fill="white" />
          </svg>
          <h1 className="header-title">CurationPilot</h1>
        </div>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        <button
          className={`nav-btn ${currentView === 'chat' ? 'nav-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chat' })}
          id="nav-chat"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M3 4.5C3 3.67157 3.67157 3 4.5 3H13.5C14.3284 3 15 3.67157 15 4.5V11.5C15 12.3284 14.3284 13 13.5 13H7L4 15.5V13H4.5C3.67157 13 3 12.3284 3 11.5V4.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="6" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="6" y1="9.5" x2="10" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Chat
        </button>
        <button
          className={`nav-btn ${currentView === 'history' ? 'nav-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'history' })}
          id="nav-history"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="9,6 9,9 11.5,10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          History
        </button>
        <button
          className={`nav-btn ${currentView === 'logs' ? 'nav-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'logs' })}
          id="nav-logs"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Logs
        </button>
        <a
          href="/docs/html/project-overview.html"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn"
          id="nav-docs"
          style={{ textDecoration: 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Docs
        </a>
      </nav>

      <div className="header-right">
        <button
          className="new-chat-btn"
          onClick={() => dispatch({ type: 'START_NEW_SESSION' })}
          id="btn-new-chat"
          title="Start a new chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Chat
        </button>
      </div>
    </header>
  );
}
