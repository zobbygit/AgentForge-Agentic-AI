import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

commentSchema.index({ taskId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);