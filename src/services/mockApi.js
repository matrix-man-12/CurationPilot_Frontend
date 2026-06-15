/**
 * Mock API Service
 * Simulates backend responses with realistic delays.
 * When the real backend is ready, swap imports in api.js — no component changes needed.
 */

import skillsData from '../mocks/skills.json';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate execution progress
const EXECUTION_STEPS = [
  'Initializing browser',
  'Navigating to portal',
  'Logging in',
  'Waiting for dashboard',
  'Navigating to target page',
  'Extracting data',
  'Processing results',
  'Saving output',
];

/**
 * Get all skills grouped by category
 */
export async function getSkills(search = '') {
  await delay(400);

  let categories = skillsData.categories;

  if (search.trim()) {
    const term = search.toLowerCase();
    categories = categories
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.skills.length > 0);
  }

  return {
    success: true,
    data: {
      categories,
      totalSkills: categories.reduce((sum, cat) => sum + cat.skills.length, 0),
    },
  };
}

/**
 * Get a single skill by ID
 */
export async function getSkillById(skillId) {
  await delay(250);

  for (const category of skillsData.categories) {
    const skill = category.skills.find((s) => s.id === skillId);
    if (skill) {
      return { success: true, data: skill };
    }
  }

  return {
    success: false,
    data: null,
    error: { code: 'SKILL_NOT_FOUND', message: `Skill '${skillId}' not found` },
  };
}

/**
 * Submit a skill execution request
 */
export async function submitExecution(skillId, parameters) {
  await delay(500);

  const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    success: true,
    data: {
      executionId,
      status: 'queued',
      skillId,
      submittedAt: new Date().toISOString(),
      parameters,
    },
  };
}

/**
 * Simulate execution progress — called repeatedly to get updates
 * In reality this would be a single GET endpoint or WebSocket.
 * Here we track state in a closure-based store.
 */
const STORAGE_KEY_EXEC_STORE = 'curationpilot_execution_store';

function loadExecutionStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXEC_STORE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Failed to load execution store', e);
  }
  return new Map();
}

const executionStore = loadExecutionStore();

function saveExecutionStore() {
  try {
    const obj = Object.fromEntries(executionStore.entries());
    localStorage.setItem(STORAGE_KEY_EXEC_STORE, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save execution store', e);
  }
}

export function initExecution(executionId, skillName, parameters) {
  const isBulk = parameters?.isBulk;
  const csvRows = parameters?.csvRows || [];
  const totalSteps = isBulk ? csvRows.length * 3 : EXECUTION_STEPS.length;

  executionStore.set(executionId, {
    executionId,
    status: 'queued',
    skillName,
    currentStep: 0,
    totalSteps: totalSteps,
    logs: [],
    startedAt: null,
    completedAt: null,
    userConfirmed: false,
    parameters,
  });
  saveExecutionStore();
}

export async function getExecutionStatus(executionId) {
  await delay(300);

  const exec = executionStore.get(executionId);
  if (!exec) {
    return {
      success: false,
      data: null,
      error: { code: 'EXECUTION_NOT_FOUND', message: 'Execution not found' },
    };
  }

  // Simulate progress
  if (exec.status === 'queued') {
    exec.status = 'running';
    exec.startedAt = new Date().toISOString();
    exec.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Execution started',
    });
    saveExecutionStore();
  } else if (exec.status === 'running') {
    const isBulk = exec.parameters?.isBulk;
    const csvRows = exec.parameters?.csvRows || [];
    const totalRows = csvRows.length;

    // Trigger Human-in-the-loop state at step 4 only for non-bulk runs
    if (exec.currentStep === 4 && !exec.userConfirmed && !isBulk) {
      exec.status = 'waiting_for_user';
      exec.logs.push({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Awaiting human-in-the-loop approval to proceed with transaction submission.',
      });
      saveExecutionStore();
    } else {
      if (exec.currentStep < exec.totalSteps) {
        if (isBulk) {
          const rowIndex = Math.floor(exec.currentStep / 3);
          const stepInRow = exec.currentStep % 3;
          const rowData = csvRows[rowIndex];
          
          const rowIdentifier = rowData ? (rowData.contactId || rowData.searchQuery || Object.values(rowData)[0] || `Row ${rowIndex + 1}`) : `Row ${rowIndex + 1}`;
          
          let message = '';
          if (stepInRow === 0) {
            message = `[Row ${rowIndex + 1}/${totalRows}] Initializing execution for "${rowIdentifier}"`;
          } else if (stepInRow === 1) {
            message = `[Row ${rowIndex + 1}/${totalRows}] Automating browser search & form submission...`;
          } else {
            message = `[Row ${rowIndex + 1}/${totalRows}] Row automated successfully. Saving output.`;
          }
          
          exec.currentStep += 1;
          exec.logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: message,
          });
        } else {
          const stepName = EXECUTION_STEPS[exec.currentStep];
          exec.currentStep += 1;
          exec.logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Step ${exec.currentStep}/${exec.totalSteps}: ${stepName}`,
          });
        }
      }

      if (exec.currentStep >= exec.totalSteps) {
        exec.status = 'completed';
        exec.completedAt = new Date().toISOString();
        if (isBulk) {
          exec.logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Bulk execution completed: automated ${totalRows} rows successfully.`,
          });
          exec.result = {
            summary: `Successfully completed bulk run of "${exec.skillName}" (${totalRows} items)`,
            data: {
              recordsProcessed: totalRows,
              duration: `${Math.floor(totalRows * 0.1) + 1}m ${Math.floor(Math.random() * 60)}s`,
            },
          };
        } else {
          exec.logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Execution completed successfully',
          });
          exec.result = {
            summary: `Successfully completed "${exec.skillName}"`,
            data: {
              recordsProcessed: Math.floor(Math.random() * 50) + 10,
              duration: `${Math.floor(Math.random() * 4) + 1}m ${Math.floor(Math.random() * 60)}s`,
            },
          };
        }
      }
      saveExecutionStore();
    }
  } else if (exec.status === 'waiting_for_user') {
    // Keep it here until approve or reject is called
  }

  // Determine current step name for progress feedback
  let currentStepName = '';
  if (exec.status === 'waiting_for_user') {
    currentStepName = 'Awaiting Human-in-the-loop approval';
  } else if (exec.parameters?.isBulk) {
    const csvRows = exec.parameters.csvRows || [];
    const rowIndex = Math.min(Math.floor(exec.currentStep / 3), csvRows.length - 1);
    currentStepName = `Processing Row ${rowIndex + 1} of ${csvRows.length}`;
  } else {
    currentStepName = EXECUTION_STEPS[Math.min(exec.currentStep, EXECUTION_STEPS.length - 1)];
  }

  return {
    success: true,
    data: {
      ...exec,
      progress: {
        currentStep: exec.currentStep,
        totalSteps: exec.totalSteps,
        currentStepName: currentStepName,
        percentage: Math.round((exec.currentStep / exec.totalSteps) * 100),
      },
    },
  };
}

/**
 * Cancel a running execution
 */
export async function cancelExecution(executionId) {
  await delay(200);

  const exec = executionStore.get(executionId);
  if (!exec) {
    return {
      success: false,
      data: null,
      error: { code: 'EXECUTION_NOT_FOUND', message: 'Execution not found' },
    };
  }

  exec.status = 'cancelled';
  exec.logs.push({
    timestamp: new Date().toISOString(),
    level: 'warn',
    message: 'Execution cancelled by user',
  });
  saveExecutionStore();

  return {
    success: true,
    data: { executionId, status: 'cancelled', cancelledAt: new Date().toISOString() },
  };
}

/**
 * Approve a waiting execution (Human-in-the-loop)
 */
export async function approveExecution(executionId) {
  await delay(200);
  const exec = executionStore.get(executionId);
  if (exec) {
    exec.status = 'running';
    exec.userConfirmed = true;
    exec.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Human-in-the-loop approval received. Resuming automation.',
    });
    saveExecutionStore();
    return { success: true, data: exec };
  }
  return { success: false, error: { message: 'Execution not found' } };
}

/**
 * Reject a waiting execution (Human-in-the-loop)
 */
export async function rejectExecution(executionId) {
  await delay(200);
  const exec = executionStore.get(executionId);
  if (exec) {
    exec.status = 'failed';
    exec.logs.push({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Human-in-the-loop rejection received. Aborting execution.',
    });
    exec.error = { message: 'Execution rejected by user' };
    saveExecutionStore();
    return { success: true, data: exec };
  }
  return { success: false, error: { message: 'Execution not found' } };
}

/**
 * Pause a running execution
 */
export async function pauseExecution(executionId) {
  await delay(200);
  const exec = executionStore.get(executionId);
  if (exec && exec.status === 'running') {
    exec.status = 'paused';
    exec.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Execution paused by user',
    });
    saveExecutionStore();
    return { success: true, data: exec };
  }
  return { success: false, error: { message: 'Execution not found or not running' } };
}

/**
 * Resume a paused execution
 */
export async function resumeExecution(executionId) {
  await delay(200);
  const exec = executionStore.get(executionId);
  if (exec && exec.status === 'paused') {
    exec.status = 'running';
    exec.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Execution resumed by user',
    });
    saveExecutionStore();
    return { success: true, data: exec };
  }
  return { success: false, error: { message: 'Execution not found or not paused' } };
}
