import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  techStack: string[];
  importantFiles: string[];
  rules: string[];
  architectureNotes: string;
    workspaceContent: string;
  workspaceUpdatedAt?: Date;
  workspaceUpdatedBy?: mongoose.Types.ObjectId;
  status: 'active' | 'archived' | 'completed';
  color: string;
  icon: string;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    techStack: [{ type: String }],
    importantFiles: [{ type: String }],
    rules: [{ type: String }],
    architectureNotes: { type: String, default: '' },
        workspaceContent: { type: String, default: '' },
    workspaceUpdatedAt: { type: Date },
    workspaceUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
    color: { type: String, default: '#6366F1' },
    icon: { type: String, default: '🚀' },
    taskCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
