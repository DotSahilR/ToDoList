import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

interface AppError extends Error {
  status?: number;
}

const toAppError = (status: number, message: string): AppError => {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
};

const parseEmail = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const normalizedEmail = input.trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  return validEmail ? normalizedEmail : null;
};

const parsePassword = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const normalizedPassword = input.trim();
  return normalizedPassword.length >= 6 ? normalizedPassword : null;
};

const signToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ sub: userId, email }, jwtSecret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = parseEmail(req.body?.email);
    const password = parsePassword(req.body?.password);

    if (!email) {
      return next(toAppError(400, 'Valid email is required'));
    }

    if (!password) {
      return next(toAppError(400, 'Password must be at least 6 characters'));
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(toAppError(409, 'Email is already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await UserModel.create({ email, password: passwordHash });
    const token = signToken(createdUser._id.toString(), createdUser.email);

    res.status(201).json({
      token,
      user: {
        id: createdUser._id.toString(),
        email: createdUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = parseEmail(req.body?.email);
    const password = parsePassword(req.body?.password);

    if (!email || !password) {
      return next(toAppError(400, 'Email and password are required'));
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(toAppError(401, 'Invalid credentials'));
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return next(toAppError(401, 'Invalid credentials'));
    }

    const token = signToken(user._id.toString(), user.email);

    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
