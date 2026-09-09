import { Router } from 'express';
import { getModels, updateModel, getModelHealth } from '../controllers/models.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getModels);
router.get('/health', getModelHealth);
router.put('/:id', updateModel);
export default router;