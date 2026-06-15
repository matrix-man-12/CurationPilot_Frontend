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
const executionStore = new Map();

export function initExecution(executionId, skillName) {
  executionStore.set(executionId, {
    executionId,
    status: 'queued',
    skillName,
    currentStep: 0,
    totalSteps: EXECUTION_STEPS.length,
    logs: [],
    startedAt: null,
    completedAt: null,
  });
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
  } else if (exec.status === 'running') {
    if (exec.currentStep < exec.totalSteps) {
      const stepName = EXECUTION_STEPS[exec.currentStep];
      exec.currentStep += 1;
      exec.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Step ${exec.currentStep}/${exec.totalSteps}: ${stepName}`,
      });
    }

    if (exec.currentStep >= exec.totalSteps) {
      exec.status = 'completed';
      exec.completedAt = new Date().toISOString();
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

  return {
    success: true,
    data: {
      ...exec,
      progress: {
        currentStep: exec.currentStep,
        totalSteps: exec.totalSteps,
        currentStepName: EXECUTION_STEPS[Math.min(exec.currentStep, EXECUTION_STEPS.length - 1)],
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

  return {
    success: true,
    data: { executionId, status: 'cancelled', cancelledAt: new Date().toISOString() },
  };
}
