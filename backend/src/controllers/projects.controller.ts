import { Response } from 'express';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, techStack, rules, architectureNotes, color, icon, teamId } = req.body;
  if (!name?.trim()) { res.status(400).json({ success: false, message: 'Project name is required' }); return; }

  // If creating under a team, verify membership
  if (teamId) {
    const team = await Team.findOne({ _id: teamId, 'members.userId': req.user!.userId });
    if (!team) {
      res.status(403).json({ success: false, message: 'You are not a member of this team' });
      return;
    }
  }

  const project = await Project.create({ userId: req.user!.userId, teamId, name, description, techStack, rules, architectureNotes, color, icon });
  res.status(201).json({ success: true, data: { project } });
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;

  // Find all teams this user belongs to
  const teams = await Team.find({ 'members.userId': req.user!.userId });
  const teamIds = teams.map(t => t._id);

  // Show projects the user owns OR that belong to a team they're a member of
  const filter: Record<string, unknown> = {
    $or: [
      { userId: req.user!.userId },
      { teamId: { $in: teamIds } },
    ],
  };
  if (status) filter.status = status;

  const projects = await Project.find(filter).sort({ updatedAt: -1 }).populate('teamId', 'name');
  res.json({ success: true, data: { projects } });
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const teams = await Team.find({ 'members.userId': req.user!.userId });
  const teamIds = teams.map(t => t._id);

  const project = await Project.findOne({
    _id: req.params.id,
    $or: [{ userId: req.user!.userId }, { teamId: { $in: teamIds } }],
  }).populate('workspaceUpdatedBy', 'name email').populate('teamId', 'name');

  if (!project) { res.status(404).json({ success: false, message: 'Project not found' }); return; }
  res.json({ success: true, data: { project } });
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404).json({ success: false, message: 'Project not found' }); return; }

  // Owner can always edit
  const isOwner = String(project.userId) === req.user!.userId;

  // If it's a team project, check the user's role (OWNER/EDITOR can edit, VIEWER cannot)
  let canEdit = isOwner;
  if (!isOwner && project.teamId) {
    const team = await Team.findOne({ _id: project.teamId, 'members.userId': req.user!.userId });
    const membership = team?.members.find(m => String(m.userId) === req.user!.userId);
    canEdit = membership?.role === 'OWNER' || membership?.role === 'EDITOR';
  }

  if (!canEdit) {
    res.status(403).json({ success: false, message: 'You do not have edit access to this project' });
    return;
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  res.json({ success: true, data: { project: updated } });
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  // Only the original owner can delete — team editors cannot
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!project) { res.status(404).json({ success: false, message: 'Project not found or you are not the owner' }); return; }
  res.json({ success: true, message: 'Project deleted' });
};
export const updateProjectWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  if (typeof content !== 'string') {
    res.status(400).json({ success: false, message: 'Content must be a string' });
    return;
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  const isOwner = String(project.userId) === req.user!.userId;

  let canEdit = isOwner;
  if (!isOwner && project.teamId) {
    const team = await Team.findOne({ _id: project.teamId, 'members.userId': req.user!.userId });
    const membership = team?.members.find(m => String(m.userId) === req.user!.userId);
    canEdit = membership?.role === 'OWNER' || membership?.role === 'EDITOR';
  }

  if (!canEdit) {
    res.status(403).json({ success: false, message: 'You do not have edit access to this project workspace' });
    return;
  }

  project.workspaceContent = content;
  project.workspaceUpdatedAt = new Date();
  project.workspaceUpdatedBy = req.user!.userId as any;
  await project.save();

  const populated = await project.populate('workspaceUpdatedBy', 'name email');

  res.json({ success: true, message: 'Workspace saved', data: { project: populated } });
};