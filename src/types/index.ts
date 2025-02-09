export type EventType = 'price_update' | 'new_article';

export type SubscriptionRequest = Pick<
  Subscription<EventType>,
  'userId' | 'eventType'
>;

export type UnsubscribeRequest = SubscriptionRequest;

export interface EventDataMap {
  price_update: {
    product: string;
    price: number;
  };
  new_article: {
    title: string;
    content: string;
    author?: string;
  };
}

export type EventPayload<T extends EventType> = {
  eventType: T;
  data: EventDataMap[T];
  timestamp: Date;
};

export interface Subscription<T extends EventType> {
  userId: string;
  eventType: T;
  createdAt: Date;
}

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: string;
    };
