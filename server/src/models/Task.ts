import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus } from '../types/task';

export interface TaskDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [1200, 'Description cannot exceed 1200 characters'],
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'incomplete',
    },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema);
