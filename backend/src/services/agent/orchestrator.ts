import { Task, TaskStatus, ITaskStep } from '../../models/Task';
import { planTask } from './planner';
import { executeStep, verifyTask } from './executor';
import { selectModelForTask } from './modelRouter';
import { Notification, NotificationType } from '../../models/Notification';
import { Artifact, ArtifactType } from '../../models/Artifact';
import { AuditLog } from '../../models/AuditLog';
import { Memory, MemoryType } from '../../models/Memory';
import logger from '../../utils/logger';
import { Server as SocketServer } from 'socket.io';

const MAX_STEPS = 20;
const DEFAULT_MAX_DURATION_MS = 5 * 60 * 1000;// 5 minutes

export const runAgentTask = async (taskId: string, userId: string, io: SocketServer): Promise<void> => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  const startTime = Date.now();

  try {
    // Phase 1: Planning
    task.status = TaskStatus.PLANNING;
    await task.save();
    io.to(`user:${userId}`).emit('task.started', { taskId, goal: task.goal });

    const steps = await planTask(task.goal, userId);
    task.steps = steps;

    const { modelId, category, reason } = await selectModelForTask(task.goal);
    task.selectedModel = modelId;
    task.modelCategory = category;
    task.modelReason = reason;
    task.status = TaskStatus.RUNNING;
    task.startedAt = new Date();
    await task.save();

    io.to(`user:${userId}`).emit('plan.created', { taskId, steps, model: modelId, category, reason });

    await AuditLog.create({
      userId, actorType: 'agent', action: 'TASK_STARTED',
      resourceType: 'task', resourceId: taskId,
      metadata: { goal: task.goal.substring(0, 200), stepCount: steps.length },
      status: 'success',
    });

    // Phase 2: Execution loop
    const results: Record<string, string> = {};
    let stepCount = 0;

    for (const step of task.steps) {
      if (stepCount >= MAX_STEPS) {
        logger.warn(`Task ${taskId} hit max steps limit`);
        break;
      }
      const taskMaxDuration = task.maxDurationMs || DEFAULT_MAX_DURATION_MS;
      if (Date.now() - startTime > taskMaxDuration) {
        logger.warn(`Task ${taskId} exceeded max duration`);
        break;
      }

      // Check dependencies
      const depsComplete = step.dependencies.every(depId => {
        const dep = task.steps.find(s => s.id === depId);
        return dep?.status === TaskStatus.COMPLETED;
      });
      if (!depsComplete) continue;

      step.status = TaskStatus.RUNNING;
      step.startedAt = new Date();
      task.currentStep = step.id;
      await task.save();

      let attempt = 0;
      let success = false;

      while (attempt <= step.maxRetries && !success) {
        try {
          const { success: stepSuccess, result, requiresApproval } = await executeStep(step, task.goal, userId, taskId, io);

          if (requiresApproval) {
            step.status = TaskStatus.APPROVAL_REQUIRED;
            task.status = TaskStatus.APPROVAL_REQUIRED;
            await task.save();
            return; // Pause until approval
          }

          if (stepSuccess) {
            step.status = TaskStatus.COMPLETED;
            step.result = result;
            step.completedAt = new Date();
            results[step.id] = result;
            success = true;
          } else {
            throw new Error(result);
          }
        } catch (stepError: unknown) {
          attempt++;
          step.retryCount = attempt;
          if (attempt > step.maxRetries) {
            step.status = TaskStatus.FAILED;
            step.error = stepError instanceof Error ? stepError.message : 'Unknown error';
            logger.error(`Step ${step.id} failed after ${attempt} attempts`);
          } else {
            logger.info(`Retrying step ${step.id} (attempt ${attempt}/${step.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      await task.save();
      stepCount++;
    }

    // Phase 3: Verification
    const verification = await verifyTask(task.goal, task.steps, results, userId, taskId, io);

    // Phase 4: Generate final result artifact
    const allResults = Object.values(results).join('\n\n---\n\n');
    if (allResults.length > 100) {
      const finalArtifact = await Artifact.create({
        userId, taskId,
        name: `${task.title} - Final Report`,
        type: ArtifactType.MARKDOWN,
        content: `# Task Result: ${task.title}\n\n**Goal:** ${task.goal}\n\n## Results\n\n${allResults}\n\n## Verification\n\nConfidence: ${verification.confidence}%`,
        mimeType: 'text/markdown',
        size: allResults.length,
        metadata: { verification },
      });
      task.artifacts.push(finalArtifact._id as unknown as typeof task.artifacts[0]);
    }

    // Phase 5: Store memory
    if (verification.passed) {
      await Memory.create({
        userId, taskId: task._id,
        type: MemoryType.LONG_TERM,
        content: `Completed: "${task.goal}" with ${task.steps.filter((s: ITaskStep) => s.status === TaskStatus.COMPLETED).length} steps`,
        source: 'task_completion',
        importance: 6,
      });
    }

    // Complete
    const completedSteps = task.steps.filter((s: ITaskStep) => s.status === TaskStatus.COMPLETED).length;
    task.status = completedSteps === task.steps.length ? TaskStatus.COMPLETED : TaskStatus.FAILED;
    task.completedAt = new Date();
    task.actualDuration = Date.now() - startTime;
    task.result = Object.values(results).slice(-1)[0] || 'Task completed';
    await task.save();

    io.to(`user:${userId}`).emit(task.status === TaskStatus.COMPLETED ? 'task.completed' : 'task.failed', {
      taskId, status: task.status, verification, duration: task.actualDuration,
    });

    await Notification.create({
      userId,
      type: task.status === TaskStatus.COMPLETED ? NotificationType.TASK_COMPLETED : NotificationType.TASK_FAILED,
      title: task.status === TaskStatus.COMPLETED ? 'Task Completed' : 'Task Failed',
      message: `"${task.title}" has ${task.status === TaskStatus.COMPLETED ? 'completed successfully' : 'failed'}`,
      resourceType: 'task', resourceId: taskId,
    });

    await AuditLog.create({
      userId, actorType: 'agent', action: 'TASK_COMPLETED',
      resourceType: 'task', resourceId: taskId,
      metadata: { status: task.status, duration: task.actualDuration, stepCount: task.steps.length },
      status: task.status === TaskStatus.COMPLETED ? 'success' : 'failure',
    });

  } catch (error: unknown) {
    logger.error(`Task ${taskId} orchestration failed:`, error);
    task.status = TaskStatus.FAILED;
    task.error = error instanceof Error ? error.message : 'Orchestration failed';
    task.completedAt = new Date();
    await task.save();
    io.to(`user:${userId}`).emit('task.failed', { taskId, error: task.error });
  }
};
