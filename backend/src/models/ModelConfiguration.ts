import mongoose, { Document, Schema } from 'mongoose';

export enum ModelCategory {
  FAST = 'FAST',
  REASONING = 'REASONING',
  CODING = 'CODING',
  LONG_CONTEXT = 'LONG_CONTEXT',
  GENERAL = 'GENERAL',
  MULTIMODAL = 'MULTIMODAL',
}

export interface IModelConfiguration extends Document {
  name: string;
  modelId: string;
  provider: string;
  category: ModelCategory;
  isFree: boolean;
  isEnabled: boolean;
  isAvailable: boolean; 
  isPrimary: boolean;
  isFallback: boolean;
  contextWindow: number;
  priority: number;
  usageCount: number;
  errorCount: number;
  fallbackCount: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  last24hCalls: number;
  last24hErrors: number;
  recentLatencies: number[]; // rolling window, last 50 calls
  description: string;
  lastCheckedAt?: Date; // ← ADD
  lastSuccessAt?: Date;  // ← ADD
  createdAt: Date;
  updatedAt: Date;
}

const modelConfigSchema = new Schema<IModelConfiguration>(
  {
    name: { type: String, required: true },
    modelId: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    category: { type: String, enum: Object.values(ModelCategory), required: true },
    isFree: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },          // ← new
    isPrimary: { type: Boolean, default: false },
    isFallback: { type: Boolean, default: false },
    contextWindow: { type: Number, default: 8000 },
    priority: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    fallbackCount: { type: Number, default: 0 },
    totalLatencyMs: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    last24hCalls: { type: Number, default: 0 },
    last24hErrors: { type: Number, default: 0 },
    recentLatencies: { type: [Number], default: [] },
    description: { type: String, default: '' },
    lastCheckedAt: { type: Date },                          // ← new
    lastSuccessAt: { type: Date },                          // ← new
  },
  { timestamps: true }
);

modelConfigSchema.index({ category: 1, isEnabled: 1 });
modelConfigSchema.index({ priority: -1 });

export const ModelConfiguration = mongoose.model<IModelConfiguration>('ModelConfiguration', modelConfigSchema);
