import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { unreadOnly, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (unreadOnly === 'true') filter.isRead = false;
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user!.userId, isRead: false }),
  ]);
  res.json({ success: true, data: { notifications, total, unreadCount } });
};

export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body;
  if (ids && Array.isArray(ids)) {
    await Notification.updateMany({ _id: { $in: ids }, userId: req.user!.userId }, { isRead: true });
  } else {
    await Notification.updateMany({ userId: req.user!.userId }, { isRead: true });
  }
  res.json({ success: true, message: 'Notifications marked as read' });
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  res.json({ success: true, message: 'Notification deleted' });
};
