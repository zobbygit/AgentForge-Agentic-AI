import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { TOOL_REGISTRY } from '../services/tools/toolRegistry';
const router = Router();
router.use(authenticate);
router.get('/', (_req, res) => { res.json({ success: true, data: { tools: TOOL_REGISTRY } }); });
export default router;
