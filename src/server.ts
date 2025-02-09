import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { MemoryStore } from './storage/memoryStore';
import { errorHandler, requestLogger } from './middleware';
import { EventPayload, EventType, Subscription } from './types';
import subscriptionRouteRouter from './routes/subscriptionRoute';
import { NotificationEventEmitter } from './services/eventEmitter';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const store = new MemoryStore();
const notificationEventEmitter = new NotificationEventEmitter(io);

app.use(express.json());
app.use(requestLogger);

// REST API endpoints
app.use('/api/subscriptions', subscriptionRouteRouter);

// Handle events
const setupEventHandlers = (): void => {
  const events: EventType[] = ['price_update', 'new_article'];

  events.forEach((eventType: EventType) => {
    // Listen for events emitted by the simulation
    notificationEventEmitter.emitEvent(
      eventType,
      (payload: EventPayload<EventType>) => {
        console.log('Payload', payload);
        //Get a list of subscribers
        const subscribers: Subscription<EventType>[] =
          store.getSubscriptions(eventType);
        console.log('subscribers', subscribers);

        subscribers.forEach((sub: Subscription<EventType>) => {
          //Notify subscribers about the event
          notificationEventEmitter.notifyClient(sub.userId, eventType, payload);
        });
      }
    );
  });
};

setupEventHandlers();

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
