import { Router } from 'express';
import { getApprovals, respondToApproval } from '../controllers/approvals.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getApprovals); router.post('/:id/respond', respondToApproval);
export default router;
