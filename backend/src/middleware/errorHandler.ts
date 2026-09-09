import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  logger.error('Error:', { message: err.message, stack: err.stack });

  // Never expose stack traces or internal details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal error occurred'
      : err.message || 'An error occurred';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
