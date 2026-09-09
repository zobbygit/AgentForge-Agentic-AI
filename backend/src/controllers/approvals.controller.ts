import { Response } from 'express';
import { Approval, ApprovalStatus } from '../models/Approval';
import { Task, TaskStatus } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { getSocketServer } from '../utils/socket';
import { runAgentTask } from '../services/agent/orchestrator';

export const getApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (status) filter.status = status;
  const approvals = await Approval.find(filter).sort({ requestedAt: -1 }).populate('taskId', 'title goal');
  res.json({ success: true, data: { approvals } });
};

export const respondToApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  const { decision, modifiedAction } = req.body;
  if (!['approve', 'reject', 'modify'].includes(decision)) {
    res.status(400).json({ success: false, message: 'Invalid decision' });
    return;
  }

  const approval = await Approval.findOne({ _id: req.params.id, userId: req.user!.userId, status: ApprovalStatus.PENDING });
  if (!approval) {
    res.status(404).json({ success: false, message: 'Approval not found or already resolved' });
    return;
  }

  const statusMap: Record<string, ApprovalStatus> = {
    approve: ApprovalStatus.APPROVED,
    reject: ApprovalStatus.REJECTED,
    modify: ApprovalStatus.MODIFIED,
  };

  approval.status = statusMap[decision];
  approval.respondedAt = new Date();
  approval.decision = decision;
  if (modifiedAction) approval.modifiedAction = modifiedAction;
  await approval.save();

  const io = getSocketServer();
  io.to(`user:${req.user!.userId}`).emit('approval.resolved', {
    approvalId: approval._id,
    taskId: approval.taskId,
    decision,
  });

  // Resume task if approved
  if (decision === 'approve' || decision === 'modify') {
    const task = await Task.findById(approval.taskId);
    if (task && task.status === TaskStatus.APPROVAL_REQUIRED) {
      task.status = TaskStatus.RUNNING;
      await task.save();
      setImmediate(() => runAgentTask(String(task._id), req.user!.userId, io).catch(console.error));
    }
  } else {
    await Task.findByIdAndUpdate(approval.taskId, { status: TaskStatus.CANCELLED });
  }

  res.json({ success: true, message: 'Decision recorded', data: { approval } });
};
