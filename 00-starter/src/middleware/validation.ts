import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const issues = error.issues || [];
      const message = issues.length > 0 ? issues[0].message : 'Validation failed';
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }
  };
};
