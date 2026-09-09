import { Request, Response } from 'express';
import { User } from '../models/User';
import { Task, TaskStatus } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { Artifact } from '../models/Artifact';
import { ModelConfiguration } from '../models/ModelConfiguration';
import { Notification } from '../models/Notification';
import { Schedule } from '../models/Schedule';

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalUsers, activeUsers, totalTasks, runningTasks,
    completedTasks, failedTasks, totalArtifacts, scheduledTasks,
    recentUsers, recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Task.countDocuments(),
    Task.countDocuments({ status: TaskStatus.RUNNING }),
    Task.countDocuments({ status: TaskStatus.COMPLETED }),
    Task.countDocuments({ status: TaskStatus.FAILED }),
    Artifact.countDocuments(),
    Schedule.countDocuments({ isActive: true }),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt lastLogin'),
    AuditLog.find().sort({ timestamp: -1 }).limit(10),
  ]);

  const modelFallbacks = await ModelConfiguration.aggregate([{ $group: { _id: null, total: { $sum: '$fallbackCount' } } }]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers, activeUsers, totalTasks, runningTasks,
        completedTasks, failedTasks, totalArtifacts, scheduledTasks,
        modelFallbacks: modelFallbacks[0]?.total || 0,
        successRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentUsers,
      recentAuditLogs,
    },
  });
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { search, role, isActive, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))).select('-password -refreshToken'),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: { users, total } });
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { user } });
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  const { userId, action, resourceType, status, startDate, endDate, page = '1', limit = '50' } = req.query;
  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (resourceType) filter.resourceType = resourceType;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) (filter.timestamp as Record<string, unknown>)['$gte'] = new Date(String(startDate));
    if (endDate) (filter.timestamp as Record<string, unknown>)['$lte'] = new Date(String(endDate));
  }
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(String(limit))).populate('userId', 'name email'),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, data: { logs, total } });
};

export const getAdminTasks = async (req: Request, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))).populate('userId', 'name email'),
    Task.countDocuments(filter),
  ]);
  res.json({ success: true, data: { tasks, total } });
};

export const getAdminModels = async (_req: Request, res: Response): Promise<void> => {
  const models = await ModelConfiguration.find({}).sort({ priority: -1 });
  res.json({ success: true, data: { models } });
};

export const updateAdminModel = async (req: Request, res: Response): Promise<void> => {
  const model = await ModelConfiguration.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!model) { res.status(404).json({ success: false, message: 'Model not found' }); return; }
  res.json({ success: true, data: { model } });
};

export const getSystemStats = async (_req: Request, res: Response): Promise<void> => {
  const notifCount = await Notification.countDocuments();
  const memoryUsage = process.memoryUsage();
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memory: { heapUsed: memoryUsage.heapUsed, heapTotal: memoryUsage.heapTotal },
      notifCount,
      nodeVersion: process.version,
    },
  });
};
export const updateUserQuota = async (req: Request, res: Response): Promise<void> => {
  const { dailyTaskLimit } = req.body;
  if (typeof dailyTaskLimit !== 'number' || dailyTaskLimit < 1) {
    res.status(400).json({ success: false, message: 'dailyTaskLimit must be a positive number' });
    return;
  }
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { dailyTaskLimit } }, { new: true });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'Quota updated', data: { user } });
};