import { useRef, useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import MessageBubble from './MessageBubble';
import './ChatContainer.css';

export default function ChatContainer() {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const [isScrollable, setIsScrollable] = useState(false);

  // Check if the chat area has scrollable content
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsScrollable(container.scrollHeight > container.clientHeight);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Check scroll state after layout and smooth scrolling completes
    const timer = setTimeout(() => {
      handleScroll();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeSession.messages.length]);

  useEffect(() => {
    handleScroll();
    // Update scroll controls when window is resized or content changes
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  function scrollToTop() {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToBottom() {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }

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
        <div 
          className="chat-messages-inner" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
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

      {/* Floating scroll markers */}
      {isScrollable && (
        <div className="chat-scroll-controls">
          <button
            className="scroll-btn scroll-btn--top"
            onClick={scrollToTop}
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="scroll-btn scroll-btn--bottom"
            onClick={scrollToBottom}
            title="Scroll to bottom"
            aria-label="Scroll to bottom"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
