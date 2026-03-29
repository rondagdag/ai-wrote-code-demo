import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// Store: IP string -> Array of timestamps
const rateLimitMap = new Map<string, number[]>();

// Max 5 requests per 1 minute
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000;

export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps older than the window
  timestamps = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
  
  if (timestamps.length >= MAX_REQUESTS) {
    next(new AppError('Too many requests, please try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
    return;
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  
  next();
};

export const resetRateLimiter = () => {
    rateLimitMap.clear();
};
