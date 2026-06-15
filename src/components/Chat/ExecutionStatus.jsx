import { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { submitExecution, initExecution, getExecutionStatus, approveExecution, rejectExecution } from '../../services/api';
import './ExecutionStatus.css';

export default function ExecutionStatus({ message }) {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  const [executionData, setExecutionData] = useState(activeSession.executionData || null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const pollRef = useRef(null);
  const startedRef = useRef(false);
  const logsEndRef = useRef(null);

  const logs = message?.meta?.logs || [];

  useEffect(() => {
    if (!startedRef.current && activeSession.status === 'executing') {
      startedRef.current = true;
      if (activeSession.executionId) {
        // Resume polling existing execution
        pollStatus(activeSession.executionId);
      } else {
        // Start a new execution
        startExecution();
      }
    }
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, isExpanded]);

  async function startExecution() {
    try {
      const result = await submitExecution(activeSession.skillId, activeSession.parameters);
      if (result.success) {
        const executionId = result.data.executionId;
        dispatch({ type: 'SET_EXECUTION_ID', payload: executionId });
        initExecution(executionId, activeSession.skillName);
        pollStatus(executionId);
      }
    } catch (err) {
      dispatch({ type: 'FAIL_EXECUTION', payload: err.message || 'Failed to start execution' });
    }
  }

  async function pollStatus(executionId) {
    try {
      const response = await getExecutionStatus(executionId);
      if (response.success) {
        const data = response.data;
        setExecutionData(data);
        dispatch({ type: 'UPDATE_LOGS', payload: data.logs || [] });
        dispatch({ type: 'UPDATE_EXECUTION', payload: data });

        if (data.status === 'completed') {
          dispatch({ type: 'COMPLETE_EXECUTION', payload: data.result });
          return;
        }
        if (data.status === 'failed') {
          dispatch({ type: 'FAIL_EXECUTION', payload: data.error?.message || 'Execution failed' });
          return;
        }
        if (data.status === 'cancelled') {
          return;
        }
        if (data.status === 'waiting_for_user') {
          // Pause polling, wait for HITL approval
          return;
        }

        // Continue polling
        pollRef.current = setTimeout(() => pollStatus(executionId), 1500);
      }
    } catch (err) {
      dispatch({ type: 'FAIL_EXECUTION', payload: err.message || 'Lost connection to execution' });
    }
  }

  async function handleApprove() {
    if (!activeSession.executionId) return;
    try {
      const response = await approveExecution(activeSession.executionId);
      if (response.success) {
        setExecutionData(response.data);
        dispatch({ type: 'UPDATE_LOGS', payload: response.data.logs || [] });
        dispatch({ type: 'UPDATE_EXECUTION', payload: response.data });
        // Resume polling
        pollStatus(activeSession.executionId);
      }
    } catch (err) {
      console.error('Approve failed:', err);
    }
  }

  async function handleReject() {
    if (!activeSession.executionId) return;
    try {
      const response = await rejectExecution(activeSession.executionId);
      if (response.success) {
        setExecutionData(response.data);
        dispatch({ type: 'UPDATE_LOGS', payload: response.data.logs || [] });
        dispatch({ type: 'UPDATE_EXECUTION', payload: response.data });
        dispatch({ type: 'FAIL_EXECUTION', payload: 'Execution rejected by user' });
      }
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }

  const progress = executionData?.progress;

  return (
    <div className="execution-status" id="execution-status">
      <div className="exec-header">
        <div className="exec-header-left">
          <div className={`exec-pulse ${executionData?.status === 'waiting_for_user' ? 'exec-pulse--paused' : ''}`} />
          <span className="exec-title">
            {executionData?.status === 'waiting_for_user'
              ? `Approval Required`
              : executionData
              ? `Running ${activeSession.skillName || 'automation'}`
              : `Starting ${activeSession.skillName || 'automation'}`}
          </span>
        </div>
        {executionData?.status === 'running' && (
          <span className="exec-step-label">
            Step {progress?.currentStep || 0} of {progress?.totalSteps || '...'}
          </span>
        )}
      </div>

      {progress && (
        <div className="exec-progress-wrapper">
          <div className="exec-progress-bar">
            <div
              className={`exec-progress-fill ${executionData?.status === 'waiting_for_user' ? 'exec-progress-fill--paused' : ''}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="exec-progress-text">{progress.percentage}%</span>
        </div>
      )}

      {progress?.currentStepName && (
        <div className="exec-current-step">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="2.5" fill={executionData?.status === 'waiting_for_user' ? 'var(--color-error)' : 'var(--color-warning)'} />
          </svg>
          {progress.currentStepName}
        </div>
      )}

      {/* Human-in-the-loop Confirmation Card */}
      {executionData?.status === 'waiting_for_user' && activeSession.status === 'executing' && (
        <div className="exec-hitl-card">
          <div className="exec-hitl-header">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" fill="var(--color-warning-soft)" stroke="var(--color-warning)" strokeWidth="1.5" />
              <path d="M10 6v5M10 14h.01" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Action Required: Confirm Action</span>
          </div>
          <p className="exec-hitl-prompt">
            The automation requires manual confirmation before performing the final transaction submission. Please verify details in logs and authorize below.
          </p>
          <div className="exec-hitl-buttons">
            <button className="exec-hitl-btn exec-hitl-btn--approve" onClick={handleApprove}>
              Approve & Proceed
            </button>
            <button className="exec-hitl-btn exec-hitl-btn--reject" onClick={handleReject}>
              Reject & Cancel
            </button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="exec-logs">
          <div className="exec-logs-header" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
            <div className="exec-logs-header-left">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="3.5" y1="5" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="3.5" y1="7.5" x2="8.5" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="3.5" y1="10" x2="6.5" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>Execution Log</span>
            </div>
            <button className="exec-logs-toggle-btn">
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>
          {isExpanded && (
            <div className="exec-logs-body">
              {logs.map((log, i) => (
                <div key={i} className={`exec-log-line exec-log-line--${log.level}`}>
                  <span className="exec-log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`exec-log-level exec-log-level--${log.level}`}>
                    {log.level}
                  </span>
                  <span className="exec-log-msg">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
