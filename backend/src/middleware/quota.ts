import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from './auth';

export const checkTaskQuota = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(401).json({ success: false, message: 'User not found' });
    return;
  }

  // Reset counter if 24h have passed since last reset
  const now = new Date();
  const hoursSinceReset = (now.getTime() - new Date(user.dailyTaskResetAt).getTime()) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    user.dailyTaskCount = 0;
    user.dailyTaskResetAt = now;
    await user.save();
  }

  // Admins bypass quota
  if (user.role === 'ADMIN') {
    next();
    return;
  }

  if (user.dailyTaskCount >= user.dailyTaskLimit) {
    const resetIn = 24 - hoursSinceReset;
    res.status(429).json({
      success: false,
      message: `Daily task limit reached (${user.dailyTaskLimit}/day). Resets in ${resetIn.toFixed(1)} hours.`,
      data: {
        dailyTaskCount: user.dailyTaskCount,
        dailyTaskLimit: user.dailyTaskLimit,
        resetsInHours: Math.round(resetIn * 10) / 10,
      },
    });
    return;
  }

  // Increment now — counts even if task later fails, since it consumed a model-call slot
  user.dailyTaskCount += 1;
  await user.save();

  next();
};