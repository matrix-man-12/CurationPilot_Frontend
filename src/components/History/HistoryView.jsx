import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import SessionCard from './SessionCard';
import ConfirmModal from '../common/ConfirmModal';
import './HistoryView.css';

export default function HistoryView() {
  const { sessions } = useAppState();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSessions = sessions.filter((session) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      session.skillName?.toLowerCase().includes(term) ||
      session.id.toLowerCase().includes(term)
    );
  });

  function handleSelectSession(sessionId) {
    dispatch({ type: 'LOAD_SESSION', payload: sessionId });
  }

  function handleRequestDelete(session) {
    setDeleteTarget(session);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_SESSION', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  }

  function handleCancelDelete() {
    setDeleteTarget(null);
  }

  return (
    <div className="history-view" id="history-view">
      <div className="history-panel">
        <div className="history-header">
          <h2 className="history-title">Session History</h2>
          <p className="history-subtitle">
            {sessions.length} past session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {sessions.length > 0 && (
          <div className="history-search-wrapper">
            <svg className="history-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="history-search-input"
              type="text"
              placeholder="Search past sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="history-search"
            />
          </div>
        )}

        <div className="history-list">
          {filteredSessions.length === 0 ? (
            <div className="history-empty">
              {sessions.length === 0 ? (
                <>
                  <div className="history-empty-icon">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                      <circle cx="28" cy="28" r="24" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="28" cy="28" r="10" stroke="var(--color-text-muted)" strokeWidth="1.5" />
                      <polyline points="28,22 28,28 32,30" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="history-empty-title">No sessions yet</p>
                  <p className="history-empty-desc">
                    Run your first skill to see it here. Past sessions are saved automatically.
                  </p>
                </>
              ) : (
                <p className="history-empty-title">No results for "{search}"</p>
              )}
            </div>
          ) : (
            filteredSessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                onSelect={() => handleSelectSession(session.id)}
                onDelete={() => handleRequestDelete(session)}
                style={{ animationDelay: `${index * 40}ms` }}
              />
            ))
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete session?"
          message={`This will permanently remove the "${deleteTarget.skillName || 'Untitled'}" session and all its data. This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Keep it"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
