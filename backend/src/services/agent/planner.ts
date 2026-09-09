import { callOpenRouter, selectModelForTask } from './modelRouter';
import { ITaskStep, TaskStatus } from '../../models/Task';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

export const planTask = async (goal: string, userId: string, projectContext?: string): Promise<ITaskStep[]> => {
 const { modelId, category, reason } = await selectModelForTask(goal, 'REASONING');

  const systemPrompt = `You are a highly capable AI planning agent. Your job is to break down a high-level user goal into concrete, actionable steps that can be executed by specialized AI agents.

Return ONLY a valid JSON array of steps. No markdown, no explanation, just the JSON array.

Each step must have:
- id: unique string (use short descriptive IDs like "step_1", "step_analyze", etc.)
- title: short action title (< 60 chars)
- description: what this step does (< 200 chars)  
- assignedAgent: one of [planner, researcher, analyst, coder, document, reviewer, security, orchestrator]
- requiredTool: one of [web_search, file_reader, pdf_reader, csv_analyzer, calculator, code_executor, json_processor, text_analyzer, browser] or null
- priority: number 1-10 (10 = most urgent)
- dependencies: array of step IDs this step depends on (can be empty)
- maxRetries: 2 or 3

Keep it to 3-8 steps. Focus on real, executable steps.${projectContext ? `\n\nProject context: ${projectContext}` : ''}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: `Create an execution plan for this goal: "${goal}"` },
  ];

  try {
    const response = await callOpenRouter(messages, modelId, 1500, userId);
    let content = response.content.trim();
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    const steps: ITaskStep[] = parsed.map((step: Partial<ITaskStep> & { id?: string }) => ({
      id: step.id || uuidv4(),
      title: step.title || 'Unnamed step',
      description: step.description || '',
      status: TaskStatus.PENDING,
      dependencies: step.dependencies || [],
      assignedAgent: step.assignedAgent || 'orchestrator',
      requiredTool: step.requiredTool || undefined,
      priority: step.priority || 5,
      retryCount: 0,
      maxRetries: step.maxRetries || 3,
    }));

    logger.info(`Task planned: ${steps.length} steps using ${category} model (${reason})`);
    return steps;
  } catch (error) {
    logger.error('Planning failed, creating fallback plan:', error);
    // Fallback: create a basic single-step plan
const fallbackStep: ITaskStep = {
  id: 'step_execute',
  title: 'Execute goal',
  description: `Analyze and complete: ${goal.substring(0, 150)}`,
  status: TaskStatus.PENDING,
  dependencies: [],

  assignedAgent: 'default',
  priority: 1,
  retryCount: 0,
  maxRetries: 3,
  maxDurationMs: 300000,

  totalTokensUsed: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  estimatedCostUsd: 0,
};
    return [fallbackStep];
  }
};
