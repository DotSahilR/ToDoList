import { api } from './api';
import { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload } from '../types/task';

type TaskListResponse = { tasks: Task[] };
type SingleTaskResponse = { task: Task };
type DeleteTaskResponse = { success: true };

export const taskService = {
  getAll: () => api.get<TaskListResponse>('/tasks'),
  create: (payload: CreateTaskPayload) => api.post<SingleTaskResponse>('/tasks', payload),
  update: (id: string, payload: UpdateTaskPayload) => api.put<SingleTaskResponse>(`/tasks/${id}`, payload),
  toggle: (id: string, status: TaskStatus) => api.patch<SingleTaskResponse>(`/tasks/${id}`, { status }),
  remove: (id: string) => api.delete<DeleteTaskResponse>(`/tasks/${id}`),
};
