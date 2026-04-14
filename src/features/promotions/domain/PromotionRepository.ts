import type {
  Promotion,
  PromotionWithCount,
  ProductBanner,
  PromotionRule,
  PromotionAction,
  CouponPreview,
  CreatePromotionInput,
  UpdatePromotionInput,
} from './types';
import type { RuleType, ComparisonOperator, ActionType, ActionTarget } from '@/shared/types/enums';

export interface PromotionRepository {
  // Backoffice
  create(input: CreatePromotionInput): Promise<Promotion>;
  list(params?: {
    page?: number; limit?: number;
    isActive?: boolean; search?: string;
    sortBy?: string; sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: PromotionWithCount[]; pagination: unknown }>;
  getById(id: string): Promise<PromotionWithCount>;
  update(id: string, input: UpdatePromotionInput): Promise<Promotion>;
  delete(id: string): Promise<Promotion>;
  addRule(
    id: string,
    rule: { type: RuleType; operator: ComparisonOperator; value: string },
  ): Promise<PromotionRule>;
  deleteRule(id: string, ruleId: string): Promise<PromotionRule>;
  addAction(
    id: string,
    action: { type: ActionType; value: string; target: ActionTarget; maxDiscountInCents?: number },
  ): Promise<PromotionAction>;
  deleteAction(id: string, actionId: string): Promise<PromotionAction>;

  // Shop
  getBanners(): Promise<ProductBanner[]>;
  previewCoupon(couponCode: string): Promise<CouponPreview>;
}
