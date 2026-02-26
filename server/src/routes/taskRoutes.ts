import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  toggleTaskStatus,
  updateTask,
} from '../controllers/taskController';
import { verifyToken } from '../middleware/verifyToken';

export const taskRoutes = Router();
taskRoutes.use(verifyToken);

taskRoutes.get('/', getTasks);
taskRoutes.get('/:id', getTaskById);
taskRoutes.post('/', createTask);
taskRoutes.put('/:id', updateTask);
taskRoutes.patch('/:id', toggleTaskStatus);
taskRoutes.delete('/:id', deleteTask);
