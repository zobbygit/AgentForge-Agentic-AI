import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  goal: string;
  cronExpression: string;
  humanReadable: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  projectId?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    goal: { type: String, required: true },
    cronExpression: { type: String, required: true },
    humanReadable: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastRun: { type: Date },
    nextRun: { type: Date },
    runCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

scheduleSchema.index({ userId: 1, isActive: 1 });

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);
