import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/comments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/task/:taskId', getComments);
router.post('/task/:taskId', addComment);
router.delete('/:id', deleteComment);

export default router;