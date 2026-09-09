import { Response, Request } from 'express';
import { Task } from '../models/Task';
import { verifyAccessToken } from '../utils/jwt';

const escapeCsvField = (field: unknown): string => {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const resolveUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const queryToken = req.query.token as string | undefined;
  const token = headerToken || queryToken;
  if (!token) return null;
  try {
    return verifyAccessToken(token).userId;
  } catch {
    return null;
  }
};

export const exportTasksCsv = async (req: Request, res: Response): Promise<void> => {
  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { status, startDate, endDate } = req.query;
  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as Record<string, unknown>)['$gte'] = new Date(String(startDate));
    if (endDate) (filter.createdAt as Record<string, unknown>)['$lte'] = new Date(String(endDate));
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  const headers = ['Title', 'Goal', 'Status', 'Priority', 'Steps Total', 'Steps Completed', 'Model', 'Tokens Used', 'Duration (s)', 'Created At', 'Completed At'];
  const rows = tasks.map(t => [
    escapeCsvField(t.title),
    escapeCsvField(t.goal),
    t.status,
    t.priority,
    t.steps.length,
    t.steps.filter(s => s.status === 'COMPLETED').length,
    escapeCsvField(t.selectedModel || ''),
    t.totalTokensUsed || 0,
    t.actualDuration ? Math.round(t.actualDuration / 1000) : '',
    t.createdAt.toISOString(),
    t.completedAt ? t.completedAt.toISOString() : '',
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="agentforge-tasks-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
};

export const exportTasksJson = async (req: Request, res: Response): Promise<void> => {
  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { status, startDate, endDate } = req.query;
  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) (filter.createdAt as Record<string, unknown>)['$gte'] = new Date(String(startDate));
    if (endDate) (filter.createdAt as Record<string, unknown>)['$lte'] = new Date(String(endDate));
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="agentforge-tasks-${new Date().toISOString().split('T')[0]}.json"`);
  res.json({ exportedAt: new Date().toISOString(), taskCount: tasks.length, tasks });
};