import { ErrorRequestHandler } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: number;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const knownError = err as ErrorWithStatus;

  if (knownError.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid task ID', code: 400 });
  }

  if (knownError.name === 'ValidationError') {
    return res.status(400).json({ error: knownError.message, code: 400 });
  }

  const status = knownError.status || 500;
  const message = knownError.message || 'Something went wrong';

  return res.status(status).json({ error: message, code: status });
};
