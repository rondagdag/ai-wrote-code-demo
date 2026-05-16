import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AppError('Missing authorization token', 401, 'UNAUTHORIZED');
  }

  // Stub user from token (in real app, would verify JWT)
  req.user = {
    id: 'user-' + token.substring(0, 8),
    email: token + '@votejam.local',
  };

  next();
};
