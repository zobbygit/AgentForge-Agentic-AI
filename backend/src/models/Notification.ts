import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FAILED = 'TASK_FAILED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  ARTIFACT_GENERATED = 'ARTIFACT_GENERATED',
  SCHEDULE_COMPLETED = 'SCHEDULE_COMPLETED',
  AGENT_INPUT_REQUIRED = 'AGENT_INPUT_REQUIRED',
  MODEL_FALLBACK = 'MODEL_FALLBACK',
  SYSTEM = 'SYSTEM',
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    resourceType: { type: String },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
