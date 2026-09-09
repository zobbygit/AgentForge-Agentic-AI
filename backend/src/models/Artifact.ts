import mongoose, { Document, Schema } from 'mongoose';

export enum ArtifactType {
  MARKDOWN = 'MARKDOWN',
  TEXT = 'TEXT',
  JSON = 'JSON',
  CSV = 'CSV',
  CODE = 'CODE',
  REPORT = 'REPORT',
  DATA = 'DATA',
}

export interface IArtifact extends Document {
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  name: string;
  type: ArtifactType;
  content: string;
  mimeType: string;
  size: number;
  version: number;
  downloadCount: number;
  metadata: Record<string, unknown>;
  isPublic: boolean;
  shareToken?: string;
  shareExpiresAt?: Date;
  shareViewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const artifactSchema = new Schema<IArtifact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(ArtifactType), required: true },
    content: { type: String, required: true },
    mimeType: { type: String, default: 'text/plain' },
    size: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    downloadCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },
    shareExpiresAt: { type: Date },
    shareViewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

artifactSchema.index({ userId: 1, taskId: 1 });
artifactSchema.index({ userId: 1, type: 1 });
artifactSchema.index({ projectId: 1 });

export const Artifact = mongoose.model<IArtifact>('Artifact', artifactSchema);
