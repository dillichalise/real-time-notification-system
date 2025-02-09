import { EventType } from '../types';

export const isValidEventType = (type: string): type is EventType => {
  return ['price_update', 'new_article'].includes(type);
};
