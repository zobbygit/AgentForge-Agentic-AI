import { Router } from 'express';
import { exportTasksCsv, exportTasksJson } from '../controllers/export.controller';

const router = Router();
router.get('/tasks/csv', exportTasksCsv);
router.get('/tasks/json', exportTasksJson);

export default router;