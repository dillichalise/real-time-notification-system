import { Router, Request, Response } from 'express';
import { validateSubscriptionRequest } from '../middleware';

const router = Router();
const subscriptions = new Map<string, Set<string>>();

// Add subscriptions
router.post(
  '/add',
  validateSubscriptionRequest,
  (req: Request, res: Response): any => {
    const { userId, eventType } = req.body;
    console.log(userId, eventType);

    if (!subscriptions.has(userId)) {
      subscriptions.set(userId, new Set());
    }
    subscriptions.get(userId)!.add(eventType);

    console.log('all subscriptions', subscriptions);
    return res.status(200).json({ message: 'Subscription added.' });
  }
);

// List subscriptions by user
router.get('/list/:userId', (req: Request, res: Response): any => {
  const { userId } = req.params;
  if (!subscriptions.has(userId)) {
    return res
      .status(404)
      .json({ error: 'User not found on subscription list' });
  }

  return res
    .status(200)
    .json({ subscriptions: Array.from(subscriptions.get(userId)!) });
});

// Remove subscriptions
router.post(
  '/remove',
  validateSubscriptionRequest,
  (req: Request, res: Response): any => {
    const { userId, eventType } = req.body;
    if (!subscriptions.has(userId)) {
      return res.status(404).json({ error: 'User not found on subscription.' });
    }
    const userSubscriptions = subscriptions.get(userId)!;
    if (!userSubscriptions.has(eventType)) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }
    userSubscriptions.delete(eventType);
    return res.status(200).json({ message: 'Subscription removed' });
  }
);

export default router;
