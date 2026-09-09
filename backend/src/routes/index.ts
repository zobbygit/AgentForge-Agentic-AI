import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './tasks.routes';
import projectRoutes from './projects.routes';
import memoryRoutes from './memory.routes';
import artifactRoutes from './artifacts.routes';
import notificationRoutes from './notifications.routes';
import approvalRoutes from './approvals.routes';
import scheduleRoutes from './schedules.routes';
import modelRoutes from './models.routes';
import adminRoutes from './admin.routes';
import toolRoutes from './tools.routes';
import workspaceRoutes from './workspaces.routes';
import documentRoutes from './documents.routes';
import commentRoutes from './comments.routes';
import teamRoutes from './teams.routes';
import exportRoutes from './export.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);
router.use('/memory', memoryRoutes);
router.use('/artifacts', artifactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/models', modelRoutes);
router.use('/tools', toolRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/documents', documentRoutes);
router.use('/comments', commentRoutes);
router.use('/teams', teamRoutes);
router.use('/export', exportRoutes);
router.use('/admin', adminRoutes);

export default router;
