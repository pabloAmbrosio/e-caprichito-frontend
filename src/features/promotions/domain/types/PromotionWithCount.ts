import type { Promotion } from './Promotion';

export interface PromotionWithCount extends Promotion {
  _count: { usages: number };
}
