import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'danger' }) {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    // Trap focus in modal
    confirmBtnRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function handleBackdropClick(e) {
    if (e.target === modalRef.current) onCancel();
  }

  return (
    <div className="confirm-modal-backdrop" ref={modalRef} onClick={handleBackdropClick} id="confirm-modal">
      <div className="confirm-modal" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="confirm-modal-icon">
          {variant === 'danger' ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="12" fill="var(--color-error)" />
              <line x1="14" y1="9" x2="14" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="19" r="1.5" fill="white" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="12" fill="var(--color-warning)" />
              <line x1="14" y1="9" x2="14" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="19" r="1.5" fill="white" />
            </svg>
          )}
        </div>

        <h3 className="confirm-modal-title" id="confirm-title">{title}</h3>
        <p className="confirm-modal-message" id="confirm-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onCancel}
            id="confirm-cancel"
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-modal-btn confirm-modal-btn--confirm confirm-modal-btn--${variant}`}
            onClick={onConfirm}
            ref={confirmBtnRef}
            id="confirm-ok"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
