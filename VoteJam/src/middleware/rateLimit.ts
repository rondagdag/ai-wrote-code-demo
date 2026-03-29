import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// Store: limiterName -> (userKey -> Array of timestamps)
const limiters = new Map<string, Map<string, number[]>>();

export const rateLimit = (name: string, limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.user?.id || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!limiters.has(name)) {
      limiters.set(name, new Map());
    }

    const limiter = limiters.get(name)!;
    let timestamps = limiter.get(key) || [];

    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      next(new AppError('Too many vote changes, please try again later.', 429, 'RATE_LIMITED'));
      return;
    }

    timestamps.push(now);
    limiter.set(key, timestamps);

    next();
  };
};

export const resetRateLimiter = (name?: string) => {
  if (name) {
    limiters.delete(name);
  } else {
    limiters.clear();
  }
};
