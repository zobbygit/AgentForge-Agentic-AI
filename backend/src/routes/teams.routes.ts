import { Router } from 'express';
import {
  createTeam, getMyTeams, getTeam, joinTeamByInvite,
  updateMemberRole, removeMember, deleteTeam,
} from '../controllers/teams.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getMyTeams);
router.post('/', createTeam);
router.post('/join', joinTeamByInvite);
router.get('/:id', getTeam);
router.put('/:id/members', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);
router.delete('/:id', deleteTeam);

export default router;