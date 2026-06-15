import SkillSelector from './SkillSelector';
import ParameterForm from './ParameterForm';
import ExecutionStatus from './ExecutionStatus';
import './MessageBubble.css';

export default function MessageBubble({ message, isLast, sessionStatus }) {
  const { type, content, timestamp, meta } = message;

  const renderContent = () => {
    switch (content) {
      case 'welcome':
        return (
          <div className="msg-welcome">
            <div className="msg-welcome-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="var(--color-primary-soft)" />
                <path
                  d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="19" r="1.5" fill="var(--color-primary)" />
              </svg>
            </div>
            <div className="msg-welcome-text">
              <h2>What would you like to automate?</h2>
              <p>Select a skill below to get started. Each skill runs a specific automation task — you'll provide the parameters, and we'll handle the rest.</p>
            </div>
            {sessionStatus === 'selecting_skill' && isLast && <SkillSelector />}
          </div>
        );

      case 'enter_params':
        return (
          <div className="msg-params-prompt">
            <div className="msg-skill-badge">
              <span className="skill-badge-dot" />
              <span className="skill-badge-name">{meta?.skillName}</span>
            </div>
            <p className="msg-params-desc">{meta?.skillDescription}</p>
            <p className="msg-params-instruction">Fill in the parameters below to configure this skill.</p>
            {sessionStatus === 'entering_params' && isLast && <ParameterForm />}
          </div>
        );

      case 'params_submitted':
        return (
          <div className="msg-params-summary">
            <div className="msg-params-summary-title">Parameters submitted</div>
            <div className="msg-params-grid">
              {meta?.parameterLabels &&
                Object.entries(meta.parameterLabels).map(([key, label]) => (
                  <div key={key} className="msg-param-item">
                    <span className="msg-param-label">{label}</span>
                    <span className="msg-param-value">
                      {Array.isArray(meta.parameters[key])
                        ? meta.parameters[key].join(', ')
                        : String(meta.parameters[key] ?? '—')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'executing':
        return <ExecutionStatus />;

      case 'completed':
        return (
          <div className="msg-result msg-result--success">
            <div className="msg-result-header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8" fill="var(--color-success-soft)" stroke="var(--color-success)" strokeWidth="1.5" />
                <polyline points="7,10 9.5,12.5 13.5,7.5" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Completed successfully</span>
            </div>
            {meta?.result && (
              <div className="msg-result-body">
                <p className="msg-result-summary">{meta.result.summary}</p>
                {meta.result.data && (
                  <div className="msg-result-data">
                    {Object.entries(meta.result.data).map(([key, value]) => (
                      <div key={key} className="msg-result-datum">
                        <span className="msg-result-datum-key">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        <span className="msg-result-datum-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'failed':
        return (
          <div className="msg-result msg-result--error">
            <div className="msg-result-header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8" fill="var(--color-error-soft)" stroke="var(--color-error)" strokeWidth="1.5" />
                <line x1="7.5" y1="7.5" x2="12.5" y2="12.5" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12.5" y1="7.5" x2="7.5" y2="12.5" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Execution failed</span>
            </div>
            {meta?.error && (
              <p className="msg-result-error-detail">{meta.error}</p>
            )}
          </div>
        );

      default:
        return <p>{content}</p>;
    }
  };

  return (
    <div className={`message-bubble message-bubble--${type}`}>
      {type === 'system' && (
        <div className="msg-avatar msg-avatar--system" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="11.5" r="1" fill="var(--color-primary)" />
          </svg>
        </div>
      )}
      <div className="msg-content">{renderContent()}</div>
    </div>
  );
}
