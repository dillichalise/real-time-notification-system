import { EventDataMap, EventPayload, EventType } from '../types';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

type EventHandler<T extends EventType> = (payload: EventPayload<T>) => void;

export class NotificationEventEmitter {
  private io: Server;
  private clients: Map<string, Socket> = new Map();
  private eventHandlers: Map<EventType, EventHandler<EventType>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupEventSimulation();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.handshake.query.userId;

      if (!userId || Array.isArray(userId)) {
        socket.disconnect();
        return;
      }

      this.addClient(userId, socket);

      socket.on('disconnect', () => {
        this.removeClient(userId);
      });
    });
  }

  private addClient(userId: string, socket: Socket): void {
    this.clients.set(userId, socket);
    logger.info(`Client connected: ${userId}`);
  }

  private removeClient(userId: string): void {
    this.clients.delete(userId);
    logger.info(`Client disconnected: ${userId}`);
  }

  emitEvent<T extends EventType>(eventType: T, handler: EventHandler<T>): void {
    this.eventHandlers.set(eventType, handler as EventHandler<EventType>);
  }

  private triggerEvent<T extends EventType>(
    eventType: T,
    data: EventDataMap[T]
  ): void {
    const payload: EventPayload<T> = {
      eventType,
      data,
      timestamp: new Date(),
    };

    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      handler(payload as EventPayload<EventType>);
    }

    logger.info(`Event triggered: ${eventType}`, { data: payload });
  }

  notifyClient<T extends EventType>(
    userId: string,
    eventType: T,
    payload: EventPayload<T>
  ): void {
    const client = this.clients.get(userId);
    if (client?.connected) {
      client.emit(eventType, payload);
    }
  }

  private setupEventSimulation(): void {
    setInterval(() => {
      this.triggerEvent('price_update', {
        product: 'Sample Product',
        price: Math.random() * 100,
      });
    }, 120000);

    setInterval(() => {
      this.triggerEvent('new_article', {
        title: 'New Article',
        content: 'Sample content',
        author: 'John Doe',
      });
    }, 120000);
  }
}
