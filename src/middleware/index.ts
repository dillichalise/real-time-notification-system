import { NextFunction, Request, Response } from 'express';

export const validateSubscriptionRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const { userId, eventType } = req.body;
  if (!userId || !eventType) {
    return res.status(400).json({ error: 'Missing userId or eventType' });
  }
  next();
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  if (err instanceof Error) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

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
