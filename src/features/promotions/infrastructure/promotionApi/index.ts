import type { PromotionRepository } from '../../domain/PromotionRepository';
import { createPromotion } from './createPromotion';
import { listPromotions } from './listPromotions';
import { getPromotionById } from './getPromotionById';
import { updatePromotion } from './updatePromotion';
import { deletePromotion } from './deletePromotion';
import { addPromotionRule } from './addPromotionRule';
import { deletePromotionRule } from './deletePromotionRule';
import { addPromotionAction } from './addPromotionAction';
import { deletePromotionAction } from './deletePromotionAction';
import { getBanners } from './getBanners';
import { previewCoupon } from './previewCoupon';

export function createPromotionApi(): PromotionRepository {
  return {
    create: createPromotion,
    list: listPromotions,
    getById: getPromotionById,
    update: updatePromotion,
    delete: deletePromotion,
    addRule: addPromotionRule,
    deleteRule: deletePromotionRule,
    addAction: addPromotionAction,
    deleteAction: deletePromotionAction,
    getBanners,
    previewCoupon,
  };
}
