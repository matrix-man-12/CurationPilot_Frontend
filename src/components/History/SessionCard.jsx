import './SessionCard.css';

export default function SessionCard({ session, onSelect, onDelete, isSelected, onToggleSelect, style }) {
  const statusConfig = {
    completed: { label: 'Completed', className: 'status--success' },
    failed: { label: 'Failed', className: 'status--error' },
    cancelled: { label: 'Cancelled', className: 'status--muted' },
    executing: { label: 'Running', className: 'status--warning' },
    entering_params: { label: 'Draft', className: 'status--muted' },
    selecting_skill: { label: 'New', className: 'status--muted' },
  };

  const status = statusConfig[session.status] || statusConfig.selecting_skill;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  return (
    <div
      className={`session-card ${isSelected ? 'session-card--selected' : ''}`}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      id={`session-${session.id}`}
    >
      <div 
        className="session-card-checkbox-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="session-checkbox"
          aria-label={`Select ${session.skillName || 'Untitled Session'}`}
        />
      </div>

      <div className="session-card-main">
        <div className="session-card-top">
          <span className="session-card-name">
            {session.skillName || 'Untitled Session'}
          </span>
          <span className={`session-card-status ${status.className}`}>
            {status.label}
          </span>
        </div>
        {session.skillDescription && (
          <p className="session-card-desc">{session.skillDescription}</p>
        )}
        <div className="session-card-meta">
          <span className="session-card-date">{formatDate(session.createdAt)}</span>
          {session.result?.data?.duration && (
            <span className="session-card-duration">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
                <polyline points="6,4 6,6 7.5,7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              {session.result.data.duration}
            </span>
          )}
        </div>
      </div>

      <button
        className="session-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete session"
        title="Delete session"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="4" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
