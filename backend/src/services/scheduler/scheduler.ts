import cron from 'node-cron';
import { Schedule } from '../../models/Schedule';
import { Task, TaskStatus } from '../../models/Task';
import { runAgentTask } from '../agent/orchestrator';
import { getSocketServer } from '../../utils/socket';
import { AuditLog } from '../../models/AuditLog';
import { Notification, NotificationType } from '../../models/Notification';
import logger from '../../utils/logger';
import { ModelConfiguration } from '../../models/ModelConfiguration';

const activeJobs: Map<string, cron.ScheduledTask> = new Map();

export const initScheduler = (): void => {
  // Master runner: every minute, check active schedules
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const schedules = await Schedule.find({ isActive: true });

      for (const schedule of schedules) {
        if (!schedule.nextRun || schedule.nextRun <= now) {
          await executeSchedule(String(schedule._id));
        }
      }
    } catch (error) {
      logger.error('Scheduler master run error:', error);
    }
  });

  // Reset rolling 24h model health counters once per day
  cron.schedule('0 0 * * *', async () => {
    try {
      await ModelConfiguration.updateMany({}, { $set: { last24hCalls: 0, last24hErrors: 0 } });
      logger.info('Model health 24h counters reset');
    } catch (error) {
      logger.error('Failed to reset model health counters:', error);
    }
  });

  
  logger.info('Scheduler initialized');
};

export const executeSchedule = async (scheduleId: string): Promise<void> => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule || !schedule.isActive) return;

  try {
    const task = await Task.create({
      userId: schedule.userId,
      projectId: schedule.projectId,
      title: `[Scheduled] ${schedule.name}`,
      goal: schedule.goal,
      status: TaskStatus.PENDING,
      isScheduled: true,
      scheduleId: schedule._id,
      tags: ['scheduled'],
    });

    const io = getSocketServer();
    setImmediate(() => runAgentTask(String(task._id), String(schedule.userId), io).catch(logger.error));

    schedule.lastRun = new Date();
    schedule.runCount += 1;

    // Calculate next run (simple: add 1 day for daily, 7 days for weekly)
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1);
    schedule.nextRun = nextRun;
    await schedule.save();

    await AuditLog.create({
      userId: schedule.userId,
      actorType: 'system',
      action: 'SCHEDULE_EXECUTED',
      resourceType: 'schedule',
      resourceId: scheduleId,
      metadata: { taskId: task._id, goal: schedule.goal },
      status: 'success',
    });

    logger.info(`Schedule ${scheduleId} executed, task ${task._id} started`);
  } catch (error) {
    schedule.failureCount += 1;
    await schedule.save();

    await Notification.create({
      userId: schedule.userId,
      type: NotificationType.SCHEDULE_COMPLETED,
      title: 'Scheduled Task Failed',
      message: `"${schedule.name}" failed to execute`,
      resourceType: 'schedule',
      resourceId: scheduleId,
    });

    logger.error(`Schedule ${scheduleId} execution failed:`, error);
  }
};

export const registerScheduleJob = (scheduleId: string, cronExpr: string): void => {
  if (activeJobs.has(scheduleId)) {
    activeJobs.get(scheduleId)!.stop();
  }

  if (!cron.validate(cronExpr)) {
    logger.warn(`Invalid cron expression for schedule ${scheduleId}: ${cronExpr}`);
    return;
  }

  const job = cron.schedule(cronExpr, () => executeSchedule(scheduleId), { scheduled: true });
  activeJobs.set(scheduleId, job);
  logger.info(`Cron job registered for schedule ${scheduleId}`);
};

export const unregisterScheduleJob = (scheduleId: string): void => {
  if (activeJobs.has(scheduleId)) {
    activeJobs.get(scheduleId)!.stop();
    activeJobs.delete(scheduleId);
  }
};
