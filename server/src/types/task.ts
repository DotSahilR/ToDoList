export type TaskStatus = 'complete' | 'incomplete';

export interface Task {
  _id: string;
  name: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  status: TaskStatus;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  status?: TaskStatus;
}
