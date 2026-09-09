import { Router } from 'express';
import { getNotifications, markRead, deleteNotification } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getNotifications); router.post('/read', markRead); router.delete('/:id', deleteNotification);
export default router;
