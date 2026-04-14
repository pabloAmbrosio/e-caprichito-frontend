export type {
  PromotionRule,
  PromotionAction,
  Promotion,
  PromotionWithCount,
  ProductBanner,
  CartBanner,
  CouponBanner,
  BannersResponse,
  CouponPreview,
  CreatePromotionInput,
  UpdatePromotionInput,
} from './domain/types';

export type { PromotionRepository } from './domain/PromotionRepository';

export { createPromotionApi } from './infrastructure/promotionApi';
export { mapBannersToPromoCards } from './application/mapBannersToPromoCards';
