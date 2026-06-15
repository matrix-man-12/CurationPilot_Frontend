/**
 * API Service Layer
 * Thin wrapper over the mock API. When the real backend is ready,
 * swap the imports from './mockApi' to actual fetch calls.
 */

export {
  getSkills,
  getSkillById,
  submitExecution,
  initExecution,
  getExecutionStatus,
  cancelExecution,
  approveExecution,
  rejectExecution,
} from './mockApi.js';

/**
 * Configuration — change these when backend is ready
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  useMock: true,
};
