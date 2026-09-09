import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStatus {
  PENDING = 'PENDING',
  PLANNING = 'PLANNING',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SKIPPED = 'SKIPPED',
}

export interface ITaskStep {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dependencies: string[];
  assignedAgent: string;
  requiredTool?: string;
  priority: number;
  retryCount: number;
  maxRetries: number;
  maxDurationMs: number;
  totalTokensUsed: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  estimatedCostUsd: number;
  result?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  title: string;
  goal: string;
  status: TaskStatus;
  steps: ITaskStep[];
  currentStep?: string;
  assignedAgent: string;
  selectedModel?: string;
  modelCategory?: string;
  modelReason?: string;
  result?: string;
  error?: string;
  artifacts: mongoose.Types.ObjectId[];
  approvals: mongoose.Types.ObjectId[];
  executionLog: Array<{ timestamp: Date; event: string; data?: Record<string, unknown> }>;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  retryCount: number;
  maxRetries: number;
  maxDurationMs: number;
  totalTokensUsed: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  estimatedCostUsd: number;
  isScheduled: boolean;
  scheduleId?: mongoose.Types.ObjectId;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const taskStepSchema = new Schema<ITaskStep>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
  dependencies: [{ type: String }],
  assignedAgent: { type: String, required: true },
  requiredTool: { type: String },
  priority: { type: Number, default: 0 },
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
   maxDurationMs: { type: Number, default: 300000 }, // 5 min default, user-adjustable
  totalTokensUsed: { type: Number, default: 0 },
    totalPromptTokens: { type: Number, default: 0 },
    totalCompletionTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
  result: { type: String },
  error: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
});

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    title: { type: String, required: true },
    goal: { type: String, required: true },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
    steps: [taskStepSchema],
    currentStep: { type: String },
    assignedAgent: { type: String, default: 'orchestrator' },
    selectedModel: { type: String },
    modelCategory: { type: String },
    modelReason: { type: String },
    result: { type: String },
    error: { type: String },
    artifacts: [{ type: Schema.Types.ObjectId, ref: 'Artifact' }],
    approvals: [{ type: Schema.Types.ObjectId, ref: 'Approval' }],
    executionLog: [
      {
        timestamp: { type: Date, default: Date.now },
        event: { type: String },
        data: { type: Schema.Types.Mixed },
      },
    ],
    startedAt: { type: Date },
    completedAt: { type: Date },
    estimatedDuration: { type: Number },
    actualDuration: { type: Number },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    isScheduled: { type: Boolean, default: false },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    tags: [{ type: String }],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ scheduleId: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
