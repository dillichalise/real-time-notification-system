import { EventType, Subscription } from '../types';

export class MemoryStore {
  private subscriptions: Map<EventType, Set<Subscription<EventType>>> =
    new Map();

  addSubscription<T extends EventType>(subscription: Subscription<T>): void {
    const existing =
      this.subscriptions.get(subscription.eventType) || new Set();
    existing.add(subscription as Subscription<EventType>);
    this.subscriptions.set(subscription.eventType, existing);
  }

  removeSubscription<T extends EventType>(
    userId: string,
    eventType: T
  ): boolean {
    const subs = this.subscriptions.get(eventType);
    if (!subs) return false;

    const filtered = new Set([...subs].filter((sub) => sub.userId !== userId));
    this.subscriptions.set(eventType, filtered);
    return true;
  }

  getSubscriptions<T extends EventType>(eventType: T): Array<Subscription<T>> {
    return [...(this.subscriptions.get(eventType) || [])] as Array<
      Subscription<T>
    >;
  }
}
