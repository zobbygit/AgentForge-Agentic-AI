import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  updatedAt: Date;
}

export interface IWorkspace extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  files: IWorkspaceFile[];
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceFileSchema = new Schema<IWorkspaceFile>({
  name: { type: String, required: true },
  path: { type: String, required: true },
  content: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
  size: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const workspaceSchema = new Schema<IWorkspace>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    files: [workspaceFileSchema],
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

workspaceSchema.index({ userId: 1 });
workspaceSchema.index({ projectId: 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
