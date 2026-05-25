import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.status : (err.status || 500);
  const message = err.message || 'Internal Server Error';

  // Log system errors and route warning parameters to Winston
  const logMeta = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    status,
    stack: err.stack
  };

  if (status === 500) {
    logger.error(`Unhandled System Error: ${message}`, logMeta);
  } else {
    logger.warn(`API Warning ${status}: ${message}`, logMeta);
  }

  res.status(status).json({
    success: false,
    data: null,
    error: {
      message,
      status
    }
  });
};
