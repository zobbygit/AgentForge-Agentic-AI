import { Response } from 'express';
import { Schedule } from '../models/Schedule';
import { AuthRequest } from '../middleware/auth';

export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedules = await Schedule.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { schedules } });
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, goal, cronExpression, humanReadable, projectId } = req.body;
  if (!name?.trim() || !goal?.trim() || !cronExpression?.trim()) {
    res.status(400).json({ success: false, message: 'Name, goal and cronExpression are required' });
    return;
  }
  const schedule = await Schedule.create({ userId: req.user!.userId, name, goal, cronExpression, humanReadable, projectId });
  res.status(201).json({ success: true, data: { schedule } });
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await Schedule.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: req.body }, { new: true }
  );
  if (!schedule) { res.status(404).json({ success: false, message: 'Schedule not found' }); return; }
  res.json({ success: true, data: { schedule } });
};

export const toggleSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!schedule) { res.status(404).json({ success: false, message: 'Schedule not found' }); return; }
  schedule.isActive = !schedule.isActive;
  await schedule.save();
  res.json({ success: true, message: `Schedule ${schedule.isActive ? 'activated' : 'paused'}`, data: { schedule } });
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!schedule) { res.status(404).json({ success: false, message: 'Schedule not found' }); return; }
  res.json({ success: true, message: 'Schedule deleted' });
};
