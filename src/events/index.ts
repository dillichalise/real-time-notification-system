import { Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { io } from 'socket.io-client';

const socketIO = io('http://localhost:8080'); // Use your backend URL

// Create an instance of EventEmitter
const eventEmitter = new EventEmitter();

const userSubscriptions = new Map<string, Set<string>>(); // Track user subscriptions

export const listenForNotifications = (socket: Socket) => {
  const notifyClientListener = (data: any) => {
    // Check if the user is subscribed to the event type
    if (userSubscriptions.has(data.userId)) {
      const userSubs = userSubscriptions.get(data.userId)!;
      if (userSubs.has(data.eventType)) {
        socket.emit('notification', data);
      }
    }
  };

  eventEmitter.on('notification', notifyClientListener);

  socket.on('disconnect', () => {
    console.log('client disconnected...');
    eventEmitter.off('notification', notifyClientListener);
  });

  socket.on('subscribe', (data) => {
    // Subscribe the user to event types
    const { userId, eventType } = data;
    if (!userSubscriptions.has(userId)) {
      userSubscriptions.set(userId, new Set());
    }
    userSubscriptions.get(userId)!.add(eventType);
  });

  socket.on('unsubscribe', (data) => {
    // Unsubscribe the user from event types
    const { userId, eventType } = data;
    const userSubs = userSubscriptions.get(userId);
    if (userSubs) {
      userSubs.delete(eventType);
    }
  });
};
