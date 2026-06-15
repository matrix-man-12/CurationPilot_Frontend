import { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { submitExecution, initExecution, getExecutionStatus } from '../../services/api';
import './ExecutionStatus.css';

export default function ExecutionStatus() {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  const [executionData, setExecutionData] = useState(null);
  const [logs, setLogs] = useState([]);
  const pollRef = useRef(null);
  const startedRef = useRef(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (!startedRef.current && activeSession.status === 'executing') {
      startedRef.current = true;
      startExecution();
    }
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

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
        setLogs(data.logs || []);

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

        // Continue polling
        pollRef.current = setTimeout(() => pollStatus(executionId), 1500);
      }
    } catch (err) {
      dispatch({ type: 'FAIL_EXECUTION', payload: err.message || 'Lost connection to execution' });
    }
  }

  const progress = executionData?.progress;

  return (
    <div className="execution-status" id="execution-status">
      <div className="exec-header">
        <div className="exec-header-left">
          <div className="exec-pulse" />
          <span className="exec-title">
            {executionData ? 'Running' : 'Starting'} {activeSession.skillName}
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
              className="exec-progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="exec-progress-text">{progress.percentage}%</span>
        </div>
      )}

      {progress?.currentStepName && (
        <div className="exec-current-step">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="2" fill="var(--color-warning)" />
          </svg>
          {progress.currentStepName}
        </div>
      )}

      {logs.length > 0 && (
        <div className="exec-logs">
          <div className="exec-logs-header">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="3.5" y1="5" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="3.5" y1="7.5" x2="8.5" y2="7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="3.5" y1="10" x2="6.5" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span>Execution Log</span>
          </div>
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
        </div>
      )}
    </div>
  );
}
