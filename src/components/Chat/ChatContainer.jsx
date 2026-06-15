import { useRef, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import MessageBubble from './MessageBubble';
import './ChatContainer.css';

export default function ChatContainer() {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages.length]);

  const isReadOnly = activeSession.status === 'completed' || activeSession.status === 'failed' || activeSession.status === 'cancelled';

  return (
    <div className="chat-container" id="chat-container">
      {isReadOnly && (
        <div className="chat-readonly-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="8,5 8,8 10.5,9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Viewing past session — {activeSession.skillName}
        </div>
      )}
      <div className="chat-messages">
        <div className="chat-messages-inner">
          {activeSession.messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLast={index === activeSession.messages.length - 1}
              sessionStatus={activeSession.status}
            />
          ))}

          {isReadOnly && (
            <div className="chat-session-ended">
              <div className="chat-ended-divider">
                <span className="chat-ended-line" />
                <span className="chat-ended-text">Session Ended</span>
                <span className="chat-ended-line" />
              </div>
              <button
                className="chat-ended-new-btn"
                onClick={() => dispatch({ type: 'START_NEW_SESSION' })}
                id="btn-ended-new-chat"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Start New Automation
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
