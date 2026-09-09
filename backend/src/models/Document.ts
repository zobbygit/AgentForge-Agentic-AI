import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  INDEXED = 'INDEXED',
  FAILED = 'FAILED',
}

export interface IDocumentChunk {
  chunkIndex: number;
  content: string;
  embedding: number[];
  tokenCount: number;
}

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  status: DocumentStatus;
  extractedText?: string;
  chunks: IDocumentChunk[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chunkSchema = new Schema<IDocumentChunk>(
  {
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    tokenCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    status: { type: String, enum: Object.values(DocumentStatus), default: DocumentStatus.UPLOADED },
    extractedText: { type: String },
    chunks: [chunkSchema],
    error: { type: String },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, taskId: 1 });
documentSchema.index({ userId: 1, projectId: 1 });
documentSchema.index({ status: 1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);