import { callOpenRouter, selectModelForTask } from './modelRouter';
import { ITaskStep, Task, TaskStatus } from '../../models/Task';
import { executeTool } from '../tools/toolRegistry';
import { Approval } from '../../models/Approval';
import { Artifact, ArtifactType } from '../../models/Artifact';
import { Notification, NotificationType } from '../../models/Notification';
import { AuditLog } from '../../models/AuditLog';
import { retrieveRelevantChunks } from '../rag/documentProcessor';
import logger from '../../utils/logger';
import { Server as SocketServer } from 'socket.io';

// Approval gate disabled for personal use — all tools run automatically
const HIGH_RISK_TOOLS: string[] = [];

export const executeStep = async (
  step: ITaskStep,
  goal: string,
  userId: string,
  taskId: string,
  io: SocketServer
): Promise<{ success: boolean; result: string; requiresApproval?: boolean }> => {
 const { modelId } = await selectModelForTask(step.assignedAgent + ' ' + step.title);
  // Emit real-time event
  io.to(`user:${userId}`).emit('agent.started', {
    taskId,
    stepId: step.id,
    agent: step.assignedAgent,
    step: step.title,
  });

  // Check if this step requires human approval
  if (step.requiredTool && HIGH_RISK_TOOLS.includes(step.requiredTool)) {
    const approval = await Approval.create({
      userId,
      taskId,
      stepId: step.id,
      action: step.title,
      description: `Agent wants to execute: ${step.description}`,
      riskLevel: 'high',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    io.to(`user:${userId}`).emit('approval.required', {
      taskId,
      stepId: step.id,
      approvalId: approval._id,
      action: step.title,
      description: step.description,
    });

    await Notification.create({
      userId,
      type: NotificationType.APPROVAL_REQUIRED,
      title: 'Approval Required',
      message: `Agent wants to: ${step.title}`,
      resourceType: 'task',
      resourceId: taskId,
    });

    return { success: false, result: 'Waiting for approval', requiresApproval: true };
  }

  // Execute tool if required
  let toolResult = '';
  if (step.requiredTool) {
    io.to(`user:${userId}`).emit('tool.started', { taskId, stepId: step.id, tool: step.requiredTool });

    try {
      toolResult = await executeTool(step.requiredTool, { query: step.description, goal });
      io.to(`user:${userId}`).emit('tool.completed', { taskId, stepId: step.id, tool: step.requiredTool, success: true });
    } catch (toolError) {
      io.to(`user:${userId}`).emit('tool.failed', { taskId, stepId: step.id, tool: step.requiredTool });
      logger.error(`Tool ${step.requiredTool} failed:`, toolError);
      toolResult = `Tool execution failed. Proceeding with AI knowledge.`;
    }
  }

  // Retrieve relevant context from uploaded documents (RAG)
  let ragContext = '';
  try {
    const relevantChunks = await retrieveRelevantChunks(step.description, userId, { taskId });
    if (relevantChunks.length > 0) {
      ragContext = `\n\nRelevant context from uploaded documents:\n${relevantChunks
        .map(c => `[${c.source}]: ${c.content}`)
        .join('\n\n')}`;
    }
  } catch {
    // RAG retrieval failure should never block task execution
  }

  // Agent reasoning pass
  const systemPrompt = `You are a ${step.assignedAgent} AI agent completing a specific task step.
Be concise and action-oriented. Complete the assigned step. Return your result as plain text.
${toolResult ? `\nTool result: ${toolResult}` : ''}${ragContext}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: `Overall goal: ${goal}\n\nYour task: ${step.title}\n\nDetails: ${step.description}\n\nComplete this step.` },
  ];

    const response = await callOpenRouter(messages, modelId, 1500, userId);

  // Track token usage on the task
  if (response.usage) {
    await Task.findByIdAndUpdate(taskId, {
      $inc: {
        totalTokensUsed: response.usage.total_tokens || 0,
        totalPromptTokens: response.usage.prompt_tokens || 0,
        totalCompletionTokens: response.usage.completion_tokens || 0,
      },
    });
  }

    // Auto-generate artifact for any meaningful result (lowered threshold)
  if (response.content.length > 50) {
    const artifact = await Artifact.create({
      userId,
      taskId,
      name: `${step.title} - Result`,
      type: ArtifactType.TEXT,
      content: response.content,
      mimeType: 'text/plain',
      size: response.content.length,
      metadata: { stepId: step.id, agent: step.assignedAgent, model: response.model },
    });

    io.to(`user:${userId}`).emit('artifact.created', {
      taskId,
      artifactId: artifact._id,
      name: artifact.name,
      type: artifact.type,
    });
  }

  await AuditLog.create({
    userId,
    actorType: 'agent',
    action: 'STEP_EXECUTED',
    resourceType: 'task',
    resourceId: taskId,
    metadata: { stepId: step.id, agent: step.assignedAgent, stepTitle: step.title },
    status: 'success',
  });

  return { success: true, result: response.content };
};

export const verifyTask = async (
  goal: string,
  steps: ITaskStep[],
  results: Record<string, string>,
  userId: string,
  taskId: string,
  io: SocketServer
): Promise<{ passed: boolean; confidence: number; checks: Array<{ label: string; passed: boolean }> }> => {
  io.to(`user:${userId}`).emit('verification.started', { taskId });

 const { modelId } = await selectModelForTask('reasoning complex verification', 'REASONING');
  const completedSteps = steps.filter(s => s.status === TaskStatus.COMPLETED).length;
  const totalSteps = steps.length;

  const systemPrompt = `You are a verification agent. Evaluate if the task was completed successfully.
Return ONLY a JSON object with: { passed: boolean, confidence: number (0-100), checks: [{label: string, passed: boolean}] }
No markdown, just JSON.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: `Goal: "${goal}"\n\nSteps completed: ${completedSteps}/${totalSteps}\n\nResults summary: ${Object.values(results).slice(0, 3).join('\n\n').substring(0, 1000)}\n\nVerify completion.`,
    },
  ];

  try {
    const response = await callOpenRouter(messages, modelId, 800, userId);
    let content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const verification = JSON.parse(content);
    io.to(`user:${userId}`).emit('verification.completed', { taskId, ...verification });
    return verification;
  } catch {
    const passed = completedSteps === totalSteps;
    const result = { passed, confidence: passed ? 80 : 40, checks: [{ label: `${completedSteps}/${totalSteps} steps completed`, passed }] };
    io.to(`user:${userId}`).emit('verification.completed', { taskId, ...result });
    return result;
  }
};
