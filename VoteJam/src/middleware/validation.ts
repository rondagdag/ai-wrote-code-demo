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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!UUID_REGEX.test(value)) {
      throw new AppError(`Invalid ${paramName} format`, 400, 'VALIDATION_ERROR');
    }
    next();
  };
};
