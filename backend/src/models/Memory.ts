import mongoose, { Document, Schema } from 'mongoose';

export enum MemoryType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
  SEMANTIC = 'SEMANTIC',
  PROJECT = 'PROJECT',
}

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  type: MemoryType;
  content: string;
  source: string;
  tags: string[];
  importance: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<IMemory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    type: { type: String, enum: Object.values(MemoryType), required: true },
    content: { type: String, required: true },
    source: { type: String, required: true },
    tags: [{ type: String }],
    importance: { type: Number, default: 5, min: 1, max: 10 },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, projectId: 1 });
memorySchema.index({ tags: 1 });
memorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Memory = mongoose.model<IMemory>('Memory', memorySchema);
