import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`[${new Date().toISOString()}] Error occurred: ${err}`);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
