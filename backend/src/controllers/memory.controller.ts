import { Response } from 'express';
import { Memory, MemoryType } from '../models/Memory';
import { AuthRequest } from '../middleware/auth';

export const getMemories = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, projectId, search, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (type) filter.type = type;
  if (projectId) filter.projectId = projectId;
  if (search) filter.$or = [{ content: { $regex: search, $options: 'i' } }, { tags: { $in: [search] } }];
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [memories, total] = await Promise.all([
    Memory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))),
    Memory.countDocuments(filter),
  ]);
  res.json({ success: true, data: { memories, total } });
};

export const createMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, type = MemoryType.LONG_TERM, source = 'user', tags, projectId, importance } = req.body;
  if (!content?.trim()) { res.status(400).json({ success: false, message: 'Content is required' }); return; }
  const memory = await Memory.create({ userId: req.user!.userId, content, type, source, tags, projectId, importance });
  res.status(201).json({ success: true, data: { memory } });
};

export const updateMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  const memory = await Memory.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: req.body }, { new: true }
  );
  if (!memory) { res.status(404).json({ success: false, message: 'Memory not found' }); return; }
  res.json({ success: true, data: { memory } });
};

export const deleteMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  const memory = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!memory) { res.status(404).json({ success: false, message: 'Memory not found' }); return; }
  res.json({ success: true, message: 'Memory deleted' });
};

export const clearMemories = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (type) filter.type = type;
  await Memory.deleteMany(filter);
  res.json({ success: true, message: 'Memories cleared' });
};
