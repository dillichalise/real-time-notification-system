import { NextFunction, Request, Response } from 'express';

export const validateSubscriptionRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const { userId, eventType } = req.body;
  if (!userId || !eventType) {
    return res.status(400).json({
      success: false,
      error: 'userId and eventType are required',
    });
  }
  next();
};
