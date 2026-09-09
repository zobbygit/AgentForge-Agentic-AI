import { Router } from 'express';
import { createProject, getProjects, getProject, updateProject, deleteProject, updateProjectWorkspace } from '../controllers/projects.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.put('/:id/workspace', updateProjectWorkspace);
router.delete('/:id', deleteProject);

export default router;