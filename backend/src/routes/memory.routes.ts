import { Router } from 'express';
import { getMemories, createMemory, updateMemory, deleteMemory, clearMemories } from '../controllers/memory.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getMemories); router.post('/', createMemory); router.delete('/clear', clearMemories);
router.put('/:id', updateMemory); router.delete('/:id', deleteMemory);
export default router;
