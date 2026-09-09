import { Response } from 'express';
import { Task, TaskStatus } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { runAgentTask } from '../services/agent/orchestrator';
import { AuditLog } from '../models/AuditLog';
import { getSocketServer } from '../utils/socket';
import { User } from '../models/User';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
   const { goal, title, projectId, priority = 'medium', tags = [], maxDurationMs } = req.body;
  const userId = req.user!.userId;

  if (!goal || !goal.trim()) {
    res.status(400).json({ success: false, message: 'Goal is required' });
    return;
  }

  const clampedDuration = maxDurationMs
    ? Math.min(Math.max(parseInt(maxDurationMs), 30000), 1800000) // clamp 30s–30min
    : 300000;

  const task = await Task.create({
    userId,
    projectId: projectId || undefined,
    title: title || goal.substring(0, 80),
    goal: goal.trim(),
    priority,
    tags,
    status: TaskStatus.PENDING,
    maxDurationMs: clampedDuration,
  });

  await AuditLog.create({
    userId, actorType: 'user', action: 'TASK_CREATED',
    resourceType: 'task', resourceId: String(task._id),
    metadata: { goal: goal.substring(0, 200) }, status: 'success',
  });

  // Start agent execution in background
  const io = getSocketServer();
  setImmediate(() => {
    runAgentTask(String(task._id), userId, io).catch(err => {
      console.error('Task execution error:', err);
    });
  });

  res.status(201).json({ success: true, message: 'Task created and agent started', data: { task } });
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { status, page = '1', limit = '20', projectId } = req.query;

  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;
  if (projectId) filter.projectId = projectId;

  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))).populate('artifacts', 'name type'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks, total, page: parseInt(String(page)), totalPages: Math.ceil(total / parseInt(String(limit))) } });
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user!.userId }).populate('artifacts');
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }
  res.json({ success: true, data: { task } });
};

export const cancelTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }
  if ([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status)) {
    res.status(400).json({ success: false, message: 'Task cannot be cancelled in its current state' });
    return;
  }
  task.status = TaskStatus.CANCELLED;
  await task.save();
  res.json({ success: true, message: 'Task cancelled', data: { task } });
};

export const retryTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const original = await Task.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!original) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  const retryTask = await Task.create({
    userId: req.user!.userId,
    projectId: original.projectId,
    title: `Retry: ${original.title}`,
    goal: original.goal,
    priority: original.priority,
    tags: original.tags,
    status: TaskStatus.PENDING,
    retryCount: original.retryCount + 1,
  });

  const io = getSocketServer();
  setImmediate(() => runAgentTask(String(retryTask._id), req.user!.userId, io).catch(console.error));

  res.status(201).json({ success: true, message: 'Task retry started', data: { task: retryTask } });
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }
  res.json({ success: true, message: 'Task deleted' });
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const [active, completed, failed, total, user] = await Promise.all([
    Task.countDocuments({ userId, status: { $in: [TaskStatus.RUNNING, TaskStatus.PLANNING, TaskStatus.WAITING] } }),
    Task.countDocuments({ userId, status: TaskStatus.COMPLETED }),
    Task.countDocuments({ userId, status: TaskStatus.FAILED }),
    Task.countDocuments({ userId }),
    User.findById(userId),
  ]);

  const recentTasks = await Task.find({ userId }).sort({ createdAt: -1 }).limit(5);

  const hoursSinceReset = user ? (Date.now() - new Date(user.dailyTaskResetAt).getTime()) / (1000 * 60 * 60) : 0;
  const quota = user ? {
    used: hoursSinceReset >= 24 ? 0 : user.dailyTaskCount,
    limit: user.dailyTaskLimit,
    resetsInHours: Math.max(0, Math.round((24 - hoursSinceReset) * 10) / 10),
  } : null;

  res.json({
    success: true,
    data: {
      stats: { active, completed, failed, total, successRate: total > 0 ? Math.round((completed / total) * 100) : 0 },
      recentTasks,
      quota,
    },
  });
};