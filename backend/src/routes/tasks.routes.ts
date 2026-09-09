import { Router } from 'express';
import { createTask, getTasks, getTask, cancelTask, retryTask, deleteTask, getDashboardStats } from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth';
import { checkTaskQuota } from '../middleware/quota';
import rateLimit from 'express-rate-limit';

const router = Router();
const taskLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

router.use(authenticate);
router.get('/stats/dashboard', getDashboardStats);
router.get('/', getTasks);
router.post('/', taskLimiter, checkTaskQuota, createTask);
router.get('/:id', getTask);
router.post('/:id/cancel', cancelTask);
router.post('/:id/retry', taskLimiter, checkTaskQuota, retryTask);
router.delete('/:id', deleteTask);

export default router;
