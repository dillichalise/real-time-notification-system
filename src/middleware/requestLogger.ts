import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
  });

  const originalResponse = res.send;
  res.send = function (body: unknown): Response {
    try {
      const responseBody =
        typeof body === 'object' ? JSON.stringify(body) : String(body);
      console.log(`Response [${res.statusCode}]: ${responseBody}`);
    } catch (error) {
      console.error('Error logging response:', error);
    }
    return originalResponse.call(this, body);
  };
  next();
};
