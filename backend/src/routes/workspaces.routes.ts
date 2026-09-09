import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
const router = Router();
router.use(authenticate);
router.get('/', async (req: any, res) => {
  const workspaces = await Workspace.find({ userId: req.user.userId });
  res.json({ success: true, data: { workspaces } });
});
router.post('/', async (req: any, res) => {
  const ws = await Workspace.create({ userId: req.user.userId, ...req.body });
  res.status(201).json({ success: true, data: { workspace: ws } });
});
router.get('/:id', async (req: any, res) => {
  const ws = await Workspace.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!ws) { res.status(404).json({ success: false, message: 'Not found' }); return; }
  res.json({ success: true, data: { workspace: ws } });
});
router.put('/:id', async (req: any, res) => {
  const ws = await Workspace.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { new: true });
  if (!ws) { res.status(404).json({ success: false, message: 'Not found' }); return; }
  res.json({ success: true, data: { workspace: ws } });
});
router.delete('/:id', async (req: any, res) => {
  await Workspace.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: 'Workspace deleted' });
});
export default router;
