import { TaskModel } from '../models/Task';
import { CreateTaskPayload, UpdateTaskPayload } from '../types/task';

export const taskService = {
  getAll: async (userId: string) => {
    return TaskModel.find({ userId }).sort({ createdAt: -1 });
  },

  getById: async (id: string, userId: string) => {
    return TaskModel.findOne({ _id: id, userId });
  },

  create: async (userId: string, payload: CreateTaskPayload) => {
    return TaskModel.create({ ...payload, userId });
  },

  update: async (id: string, userId: string, payload: UpdateTaskPayload) => {
    return TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { ...payload },
      { new: true, runValidators: true }
    );
  },

  delete: async (id: string, userId: string) => {
    return TaskModel.findOneAndDelete({ _id: id, userId });
  },
};
