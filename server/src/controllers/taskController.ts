import { NextFunction, Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { CreateTaskPayload, TaskStatus, UpdateTaskPayload } from '../types/task';

const VALID_STATUSES: TaskStatus[] = ['complete', 'incomplete'];

interface AppError extends Error {
  status?: number;
}

const toAppError = (status: number, message: string): AppError => {
  const err = new Error(message) as AppError;
  err.status = status;
  return err;
};

const isTaskStatus = (status: unknown): status is TaskStatus => {
  return typeof status === 'string' && VALID_STATUSES.includes(status as TaskStatus);
};

const parseName = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const cleanName = input.trim();
  return cleanName.length > 0 ? cleanName : null;
};

const parseDescription = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const cleanDescription = input.trim();
  return cleanDescription.length > 0 ? cleanDescription : null;
};

const validateCreatePayload = (payload: unknown): CreateTaskPayload => {
  if (!payload || typeof payload !== 'object') {
    throw toAppError(400, 'Request body is required');
  }

  const candidate = payload as { name?: unknown; description?: unknown; status?: unknown };
  const name = parseName(candidate.name);
  const description = parseDescription(candidate.description);

  if (!name) {
    throw toAppError(400, 'Task name is required');
  }

  if (name.length > 120) {
    throw toAppError(400, 'Name cannot exceed 120 characters');
  }

  if (!description) {
    throw toAppError(400, 'Task description is required');
  }

  if (description.length > 1200) {
    throw toAppError(400, 'Description cannot exceed 1200 characters');
  }

  if (!isTaskStatus(candidate.status)) {
    throw toAppError(400, "Status must be 'complete' or 'incomplete'");
  }

  return { name, description, status: candidate.status };
};

const validateUpdatePayload = (payload: unknown): UpdateTaskPayload => {
  if (!payload || typeof payload !== 'object') {
    throw toAppError(400, 'Request body is required');
  }

  const candidate = payload as { name?: unknown; description?: unknown; status?: unknown };
  const updatePayload: UpdateTaskPayload = {};

  if (candidate.name !== undefined) {
    const name = parseName(candidate.name);
    if (!name) {
      throw toAppError(400, 'Task name cannot be empty');
    }

    if (name.length > 120) {
      throw toAppError(400, 'Name cannot exceed 120 characters');
    }

    updatePayload.name = name;
  }

  if (candidate.description !== undefined) {
    const description = parseDescription(candidate.description);

    if (!description) {
      throw toAppError(400, 'Task description cannot be empty');
    }

    if (description.length > 1200) {
      throw toAppError(400, 'Description cannot exceed 1200 characters');
    }

    updatePayload.description = description;
  }

  if (candidate.status !== undefined) {
    if (!isTaskStatus(candidate.status)) {
      throw toAppError(400, "Status must be 'complete' or 'incomplete'");
    }

    updatePayload.status = candidate.status;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw toAppError(400, 'Provide at least one field to update: name, description, or status');
  }

  return updatePayload;
};

const validatePatchPayload = (payload: unknown): Pick<UpdateTaskPayload, 'status'> => {
  if (!payload || typeof payload !== 'object') {
    throw toAppError(400, 'Request body is required');
  }

  const candidate = payload as { status?: unknown };

  if (!isTaskStatus(candidate.status)) {
    throw toAppError(400, "Status must be 'complete' or 'incomplete'");
  }

  return { status: candidate.status };
};

const getUserId = (req: Request): string => {
  return (req as Request & { userId: string }).userId;
};

export const getTasks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await taskService.getAll(getUserId(_req));
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.getById(req.params.id, getUserId(req));

    if (!task) {
      return next(toAppError(404, 'Task not found'));
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = validateCreatePayload(req.body);
    const task = await taskService.create(getUserId(req), payload);

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = validateUpdatePayload(req.body);
    const task = await taskService.update(req.params.id, getUserId(req), payload);

    if (!task) {
      return next(toAppError(404, 'Task not found'));
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

export const toggleTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = validatePatchPayload(req.body);
    const task = await taskService.update(req.params.id, getUserId(req), payload);

    if (!task) {
      return next(toAppError(404, 'Task not found'));
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedTask = await taskService.delete(req.params.id, getUserId(req));

    if (!deletedTask) {
      return next(toAppError(404, 'Task not found'));
    }

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
