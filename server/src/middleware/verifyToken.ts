import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

interface AppError extends Error {
  status?: number;
}

const toAppError = (status: number, message: string): AppError => {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
};

export const verifyToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(toAppError(401, 'Missing authorization token'));
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(toAppError(500, 'JWT_SECRET is not defined'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded?.sub) {
      return next(toAppError(401, 'Invalid authorization token'));
    }

    (req as Request & { userId: string }).userId = decoded.sub;
    next();
  } catch {
    return next(toAppError(401, 'Invalid or expired authorization token'));
  }
};
