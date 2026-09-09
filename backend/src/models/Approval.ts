import mongoose, { Document, Schema } from 'mongoose';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MODIFIED = 'MODIFIED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface IApproval extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  stepId: string;
  action: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: ApprovalStatus;
  requestedAt: Date;
  respondedAt?: Date;
  decision?: string;
  modifiedAction?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new Schema<IApproval>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    stepId: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    decision: { type: String },
    modifiedAction: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

approvalSchema.index({ userId: 1, status: 1 });
approvalSchema.index({ taskId: 1 });
approvalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Approval = mongoose.model<IApproval>('Approval', approvalSchema);
