import { Router } from 'express';
import { getSchedules, createSchedule, updateSchedule, toggleSchedule, deleteSchedule } from '../controllers/schedules.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getSchedules); router.post('/', createSchedule);
router.put('/:id', updateSchedule); router.post('/:id/toggle', toggleSchedule); router.delete('/:id', deleteSchedule);
export default router;
