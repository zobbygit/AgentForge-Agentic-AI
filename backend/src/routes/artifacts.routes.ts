import { Router } from 'express';
import {
  getArtifacts, getArtifact, downloadArtifact, deleteArtifact,
  createShareLink, revokeShareLink, getSharedArtifact,
} from '../controllers/artifacts.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes — no auth
router.get('/:id/download', downloadArtifact);
router.get('/shared/:token', getSharedArtifact);

// Authenticated routes
router.use(authenticate);
router.get('/', getArtifacts);
router.get('/:id', getArtifact);
router.delete('/:id', deleteArtifact);
router.post('/:id/share', createShareLink);
router.delete('/:id/share', revokeShareLink);

export default router;