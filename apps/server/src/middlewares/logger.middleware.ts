import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logger } from '../utils/logger';

export const loggerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || '';

  // Listen for the finish event on response object to log completion telemetry
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const userId = req.user?.id || 'anonymous';
    const userRole = req.user?.role || 'anonymous';
    const userEmail = req.user?.email || 'anonymous';

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms [User: ${userEmail}]`;

    const meta = {
      method,
      url: originalUrl,
      status: statusCode,
      durationMs: duration,
      ip,
      userAgent,
      userId,
      userRole,
      userEmail
    };

    if (statusCode >= 500) {
      logger.error(message, meta);
    } else if (statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      // Normal logs
      logger.info(message, meta);
    }
  });

  next();
};
