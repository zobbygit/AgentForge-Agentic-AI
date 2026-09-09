import { Response } from 'express';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOne({ _id: req.params.taskId, userId: req.user!.userId });
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }
  const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 }).populate('userId', 'name email');
  res.json({ success: true, data: { comments } });
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ success: false, message: 'Comment content is required' });
    return;
  }
  const task = await Task.findOne({ _id: req.params.taskId, userId: req.user!.userId });
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }
  const comment = await Comment.create({ userId: req.user!.userId, taskId: req.params.taskId, content: content.trim() });
  const populated = await comment.populate('userId', 'name email');
  res.status(201).json({ success: true, data: { comment: populated } });
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await Comment.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!comment) {
    res.status(404).json({ success: false, message: 'Comment not found' });
    return;
  }
  res.json({ success: true, message: 'Comment deleted' });
};