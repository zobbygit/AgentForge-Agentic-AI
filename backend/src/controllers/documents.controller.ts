import { Response } from 'express';
import { DocumentModel } from '../models/Document';
import { AuthRequest } from '../middleware/auth';
import { processDocument } from '../services/rag/documentProcessor';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_MIME_TYPES = [
  'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/pdf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({ success: false, message: 'Unsupported file type. Allowed: txt, md, csv, json, pdf' });
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({ success: false, message: 'File too large (max 10MB)' });
    return;
  }

  const { taskId, projectId } = req.body;

  const doc = await DocumentModel.create({
    userId: req.user!.userId,
    taskId: taskId || undefined,
    projectId: projectId || undefined,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    filePath: file.path,
  });

  // Process asynchronously — don't block the upload response
  setImmediate(() => processDocument(String(doc._id)).catch(console.error));

  res.status(201).json({ success: true, message: 'File uploaded, indexing started', data: { document: doc } });
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId, projectId } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (taskId) filter.taskId = taskId;
  if (projectId) filter.projectId = projectId;

  const documents = await DocumentModel.find(filter)
    .select('-chunks.embedding -extractedText')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { documents } });
};

export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!.userId })
    .select('-chunks.embedding');
  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }
  res.json({ success: true, data: { document: doc } });
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }
  await fs.unlink(doc.filePath).catch(() => {});
  res.json({ success: true, message: 'Document deleted' });
};