import { Response, Request } from 'express';
import { Artifact } from '../models/Artifact';
import { AuthRequest } from '../middleware/auth';
import { verifyAccessToken } from '../utils/jwt';
import crypto from 'crypto';

export const getArtifacts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId, projectId, type, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (taskId) filter.taskId = taskId;
  if (projectId) filter.projectId = projectId;
  if (type) filter.type = type;
  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
  const [artifacts, total] = await Promise.all([
    Artifact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(String(limit))),
    Artifact.countDocuments(filter),
  ]);
  res.json({ success: true, data: { artifacts, total } });
};

export const getArtifact = async (req: AuthRequest, res: Response): Promise<void> => {
  const artifact = await Artifact.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!artifact) {
    res.status(404).json({ success: false, message: 'Artifact not found' });
    return;
  }
  res.json({ success: true, data: { artifact } });
};

export const downloadArtifact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept token from Authorization header OR ?token= query param (for direct browser links)
    let userId: string | null = null;

    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const queryToken = req.query.token as string | undefined;
    const token = headerToken || queryToken;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    const artifact = await Artifact.findOne({ _id: req.params.id, userId });
    if (!artifact) {
      res.status(404).json({ success: false, message: 'Artifact not found' });
      return;
    }

    artifact.downloadCount += 1;
    await artifact.save();

    const extMap: Record<string, string> = {
      MARKDOWN: '.md',
      TEXT: '.txt',
      JSON: '.json',
      CSV: '.csv',
      CODE: '.ts',
      REPORT: '.md',
      DATA: '.json',
    };

    const safeName = artifact.name.replace(/[^a-z0-9_\-. ]/gi, '_');
    const ext = extMap[artifact.type] || '.txt';
    const filename = `${safeName}${ext}`;

    res.setHeader('Content-Type', artifact.mimeType || 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(artifact.content);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Download failed' });
  }
};

export const deleteArtifact = async (req: AuthRequest, res: Response): Promise<void> => {
  const artifact = await Artifact.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!artifact) {
    res.status(404).json({ success: false, message: 'Artifact not found' });
    return;
  }
  res.json({ success: true, message: 'Artifact deleted' });
};
export const createShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const { expiresInDays } = req.body;
  const artifact = await Artifact.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!artifact) {
    res.status(404).json({ success: false, message: 'Artifact not found' });
    return;
  }

  artifact.isPublic = true;
  artifact.shareToken = artifact.shareToken || crypto.randomBytes(16).toString('hex');
  artifact.shareExpiresAt = expiresInDays
    ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
    : undefined;
  await artifact.save();

  res.json({
    success: true,
    data: { shareUrl: `/share/${artifact.shareToken}`, shareToken: artifact.shareToken, expiresAt: artifact.shareExpiresAt },
  });
};

export const revokeShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const artifact = await Artifact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: { isPublic: false }, $unset: { shareToken: 1, shareExpiresAt: 1 } },
    { new: true }
  );
  if (!artifact) {
    res.status(404).json({ success: false, message: 'Artifact not found' });
    return;
  }
  res.json({ success: true, message: 'Share link revoked' });
};

// Public endpoint — no auth required
export const getSharedArtifact = async (req: Request, res: Response): Promise<void> => {
  const artifact = await Artifact.findOne({ shareToken: req.params.token, isPublic: true });
  if (!artifact) {
    res.status(404).json({ success: false, message: 'Shared artifact not found or link revoked' });
    return;
  }
  if (artifact.shareExpiresAt && artifact.shareExpiresAt < new Date()) {
    res.status(410).json({ success: false, message: 'This share link has expired' });
    return;
  }

  artifact.shareViewCount += 1;
  await artifact.save();

  res.json({
    success: true,
    data: {
      artifact: {
        name: artifact.name,
        type: artifact.type,
        content: artifact.content,
        createdAt: artifact.createdAt,
        shareViewCount: artifact.shareViewCount,
      },
    },
  });
};