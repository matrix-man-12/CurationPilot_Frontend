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
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect width="40" height="40" rx="12" fill="var(--color-primary)" />
                <path
                  d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="24" r="2" fill="white" />
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
            <div className="msg-params-summary-title">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 7h8M5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Configuration Submitted
            </div>
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
        return <ExecutionStatus message={message} />;

      case 'completed':
        return (
          <div className="msg-result msg-result--success">
            <div className="msg-result-header">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="9" fill="var(--color-success)" />
                <polyline points="7,11 10,14 15,8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="9" fill="var(--color-error)" />
                <line x1="8" y1="8" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="8" x2="8" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
    <div className={`message-bubble message-bubble--${type} ${content === 'params_submitted' ? 'message-bubble--params-summary' : ''}`}>
      {type === 'system' && (
        <div className="msg-avatar msg-avatar--system" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="9" cy="11.5" r="1.2" fill="white" />
          </svg>
        </div>
      )}
      {type === 'user' && content !== 'params_submitted' && (
        <div className="msg-avatar msg-avatar--user" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="3" stroke="white" strokeWidth="1.5" />
            <path d="M2 14C2 11.2386 4.68629 9 8 9C11.3137 9 14 11.2386 14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className="msg-content">{renderContent()}</div>
    </div>
  );
}
