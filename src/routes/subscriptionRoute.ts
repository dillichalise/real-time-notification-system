import { Router, Request, Response } from 'express';
import {
  ApiResponse,
  EventType,
  Subscription,
  SubscriptionRequest,
  UnsubscribeRequest,
} from '../types';
import { logger } from '../utils/logger';
import { isValidEventType } from '../validation';
import { MemoryStore } from '../storage/memoryStore';
import { validateSubscriptionRequest } from '../middleware';

const router = Router();
const store = new MemoryStore();

router.post(
  '/add',
  validateSubscriptionRequest,
  (
    req: Request<{}, {}, SubscriptionRequest>,
    res: Response<ApiResponse<Subscription<EventType>>>
  ): void => {
    try {
      const { userId, eventType } = req.body;

      if (!isValidEventType(eventType)) {
        res.status(400).json({
          success: false,
          error: `Invalid event type. Must be one of: ${['price_update', 'new_article'].join(', ')}`,
        });
        return;
      }

      const subscription: Subscription<typeof eventType> = {
        userId,
        eventType,
        createdAt: new Date(),
      };

      store.addSubscription(subscription);

      const response: ApiResponse<Subscription<typeof eventType>> = {
        success: true,
        data: subscription,
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error adding subscription:', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to add subscription',
      });
    }
  }
);

router.post(
  '/delete',
  validateSubscriptionRequest,
  (
    req: Request<{}, {}, UnsubscribeRequest>,
    res: Response<ApiResponse<null>>
  ): void => {
    try {
      const { userId, eventType } = req.body;

      if (!isValidEventType(eventType)) {
        res.status(400).json({
          success: false,
          error: `Invalid event type. Must be one of: ${['price_update', 'new_article'].join(', ')}`,
        });
        return;
      }

      const removed = store.removeSubscription(userId, eventType);

      if (!removed) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
      }
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      logger.error('Error removing subscription:', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove subscription',
      });
    }
  }
);

export default router;
