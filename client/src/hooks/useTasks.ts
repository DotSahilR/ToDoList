import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { taskService } from '../services/taskService';
import { Task, TaskStatus } from '../types/task';

const resolveMessage = (unknownError: unknown): string => {
  if (axios.isAxiosError(unknownError)) {
    return unknownError.response?.data?.error ?? unknownError.message;
  }

  return 'Unexpected error while talking to the API';
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await taskService.getAll();
      if (!Array.isArray(data.tasks)) {
        setTasks([]);
        setError('API returned an unexpected payload for tasks');
        return;
      }

      setTasks(data.tasks);
    } catch (unknownError) {
      setError(resolveMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const toggleStatus = useCallback(async (taskId: string, nextStatus: TaskStatus): Promise<void> => {
    setError(null);
    const previousTasks = tasks;

    setTasks((existingTasks) =>
      existingTasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    try {
      const { data } = await taskService.toggle(taskId, nextStatus);
      const updatedTask = data.task;

      setTasks((existingTasks) =>
        existingTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (unknownError) {
      setTasks(previousTasks);
      const errorMessage = resolveMessage(unknownError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [tasks]);

  const renameTask = useCallback(async (taskId: string, nextName: string): Promise<void> => {
    setError(null);
    const previousTasks = tasks;

    setTasks((existingTasks) =>
      existingTasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              name: nextName,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    try {
      const { data } = await taskService.update(taskId, { name: nextName });
      const updatedTask = data.task;

      setTasks((existingTasks) =>
        existingTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (unknownError) {
      setTasks(previousTasks);
      const errorMessage = resolveMessage(unknownError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    setError(null);
    const previousTasks = tasks;

    setTasks((existingTasks) => existingTasks.filter((task) => task._id !== taskId));

    try {
      await taskService.remove(taskId);
    } catch (unknownError) {
      setTasks(previousTasks);
      const errorMessage = resolveMessage(unknownError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    toggleStatus,
    renameTask,
    deleteTask,
  };
};
