import { useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppContext';
import MessageBubble from './MessageBubble';
import './ChatContainer.css';

export default function ChatContainer() {
  const { activeSession } = useAppState();
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
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
