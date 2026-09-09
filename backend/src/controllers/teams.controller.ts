import { Response } from 'express';
import { Team, TeamRole } from '../models/Team';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ success: false, message: 'Team name is required' });
    return;
  }
  const team = await Team.create({
    name: name.trim(),
    ownerId: req.user!.userId,
    members: [{ userId: req.user!.userId, role: TeamRole.OWNER, joinedAt: new Date() }],
    inviteCode: crypto.randomBytes(6).toString('hex'),
  });
  res.status(201).json({ success: true, data: { team } });
};

export const getMyTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  const teams = await Team.find({ 'members.userId': req.user!.userId }).populate('members.userId', 'name email');
  res.json({ success: true, data: { teams } });
};

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await Team.findOne({ _id: req.params.id, 'members.userId': req.user!.userId })
    .populate('members.userId', 'name email');
  if (!team) {
    res.status(404).json({ success: false, message: 'Team not found or access denied' });
    return;
  }
  res.json({ success: true, data: { team } });
};

export const joinTeamByInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { inviteCode } = req.body;
  const team = await Team.findOne({ inviteCode });
  if (!team) {
    res.status(404).json({ success: false, message: 'Invalid invite code' });
    return;
  }
  const alreadyMember = team.members.some(m => String(m.userId) === req.user!.userId);
  if (alreadyMember) {
    res.status(400).json({ success: false, message: 'You are already a member of this team' });
    return;
  }
  team.members.push({ userId: req.user!.userId as any, role: TeamRole.VIEWER, joinedAt: new Date() });
  await team.save();
  res.json({ success: true, message: `Joined team "${team.name}" as viewer`, data: { team } });
};

export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { memberId, role } = req.body;
  const team = await Team.findOne({ _id: req.params.id, ownerId: req.user!.userId });
  if (!team) {
    res.status(403).json({ success: false, message: 'Only the team owner can change roles' });
    return;
  }
  const member = team.members.find(m => String(m.userId) === memberId);
  if (!member) {
    res.status(404).json({ success: false, message: 'Member not found' });
    return;
  }
  if (member.role === TeamRole.OWNER) {
    res.status(400).json({ success: false, message: 'Cannot change owner role' });
    return;
  }
  member.role = role;
  await team.save();
  res.json({ success: true, message: 'Role updated', data: { team } });
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { memberId } = req.params;
  const team = await Team.findOne({ _id: req.params.id, ownerId: req.user!.userId });
  if (!team) {
    res.status(403).json({ success: false, message: 'Only the team owner can remove members' });
    return;
  }
  team.members = team.members.filter(m => String(m.userId) !== memberId) as any;
  await team.save();
  res.json({ success: true, message: 'Member removed' });
};

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await Team.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.userId });
  if (!team) {
    res.status(403).json({ success: false, message: 'Only the team owner can delete the team' });
    return;
  }
  res.json({ success: true, message: 'Team deleted' });
};