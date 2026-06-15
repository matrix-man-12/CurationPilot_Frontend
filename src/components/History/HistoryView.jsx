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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null); // 'all' | 'selected'

  const filteredSessions = sessions.filter((session) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      session.skillName?.toLowerCase().includes(term) ||
      session.id.toLowerCase().includes(term)
    );
  });

  const allSelected = filteredSessions.length > 0 && filteredSessions.every(s => selectedIds.has(s.id));
  const someSelected = filteredSessions.some(s => selectedIds.has(s.id));

  function handleSelectSession(sessionId) {
    dispatch({ type: 'LOAD_SESSION', payload: sessionId });
  }

  function handleRequestDelete(session) {
    setDeleteTarget(session);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_SESSION', payload: deleteTarget.id });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    }
  }

  function handleCancelDelete() {
    setDeleteTarget(null);
  }

  function handleToggleSelect(sessionId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  }

  function handleToggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map((s) => s.id)));
    }
  }

  function handleCancelSelection() {
    setSelectedIds(new Set());
  }

  function handleRequestBulkDelete(type) {
    setBulkDeleteTarget(type);
  }

  function handleConfirmBulkDelete() {
    if (bulkDeleteTarget === 'selected') {
      dispatch({ type: 'DELETE_SESSIONS', payload: Array.from(selectedIds) });
      setSelectedIds(new Set());
    } else if (bulkDeleteTarget === 'all') {
      dispatch({ type: 'CLEAR_HISTORY' });
      setSelectedIds(new Set());
    }
    setBulkDeleteTarget(null);
  }

  function handleCancelBulkDelete() {
    setBulkDeleteTarget(null);
  }

  return (
    <div className="history-view" id="history-view">
      <div className="history-panel">
        <div className="history-header">
          <div className="history-header-left">
            <h2 className="history-title">Session History</h2>
            <p className="history-subtitle">
              {sessions.length} past session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {sessions.length > 0 && !someSelected && (
            <button
              className="history-clear-all-btn"
              onClick={() => handleRequestBulkDelete('all')}
              id="btn-clear-all-history"
              title="Delete all past session history"
            >
              Clear All History
            </button>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="history-toolbar">
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
            {someSelected && (
              <div className="history-bulk-actions">
                <div className="history-select-all-wrapper">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleSelectAll}
                    id="checkbox-select-all-history"
                    className="history-select-all-checkbox"
                  />
                  <label htmlFor="checkbox-select-all-history" className="history-select-all-label">
                    {allSelected ? 'Unselect All' : 'Select All'}
                  </label>
                </div>
                <span className="history-selected-count">{selectedIds.size} selected</span>
                <div className="history-bulk-action-buttons">
                  <button
                    className="history-bulk-delete-btn"
                    onClick={() => handleRequestBulkDelete('selected')}
                    id="btn-delete-selected-history"
                  >
                    Delete Selected
                  </button>
                  <button
                    className="history-bulk-cancel-btn"
                    onClick={handleCancelSelection}
                    id="btn-cancel-select-history"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
                isSelected={selectedIds.has(session.id)}
                onToggleSelect={() => handleToggleSelect(session.id)}
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

      {bulkDeleteTarget && (
        <ConfirmModal
          title={bulkDeleteTarget === 'selected' ? `Delete ${selectedIds.size} sessions?` : 'Clear entire history?'}
          message={
            bulkDeleteTarget === 'selected'
              ? `This will permanently remove the ${selectedIds.size} selected sessions and all their data. This action cannot be undone.`
              : 'This will permanently remove ALL past sessions from your history. This action cannot be undone.'
          }
          confirmLabel={bulkDeleteTarget === 'selected' ? 'Delete Selected' : 'Clear All'}
          cancelLabel="Keep them"
          variant="danger"
          onConfirm={handleConfirmBulkDelete}
          onCancel={handleCancelBulkDelete}
        />
      )}
    </div>
  );
}
