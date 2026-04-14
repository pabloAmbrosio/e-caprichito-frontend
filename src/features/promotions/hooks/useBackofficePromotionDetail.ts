import { useState, useCallback } from 'react';
import { createPromotionApi } from '../infrastructure/promotionApi';
import type { Promotion, PromotionWithCount, CreatePromotionInput, UpdatePromotionInput } from '../domain/types';
import type { RuleType, ComparisonOperator, ActionType, ActionTarget } from '@/shared/types/enums';

const api = createPromotionApi();

interface State {
  promotion: PromotionWithCount | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficePromotionDetail() {
  const [state, setState] = useState<State>({
    promotion: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchPromotion = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.getById(id);
      setState({ promotion: data, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la promoción';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const createPromotion = useCallback(async (input: CreatePromotionInput): Promise<Promotion> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const result = await api.create(input);
      setState((s) => ({ ...s, isSaving: false }));
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear la promoción';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const updatePromotion = useCallback(async (id: string, input: UpdatePromotionInput): Promise<void> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      await api.update(id, input);
      const updated = await api.getById(id);
      setState({ promotion: updated, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la promoción';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const addRule = useCallback(async (
    promotionId: string,
    rule: { type: RuleType; operator: ComparisonOperator; value: string },
  ) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const newRule = await api.addRule(promotionId, rule);
      setState((s) => ({
        ...s,
        isSaving: false,
        promotion: s.promotion
          ? { ...s.promotion, rules: [...s.promotion.rules, newRule] }
          : s.promotion,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al agregar la condición';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const deleteRule = useCallback(async (promotionId: string, ruleId: string) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      await api.deleteRule(promotionId, ruleId);
      setState((s) => ({
        ...s,
        isSaving: false,
        promotion: s.promotion
          ? { ...s.promotion, rules: s.promotion.rules.filter((r) => r.id !== ruleId) }
          : s.promotion,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la condición';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const addAction = useCallback(async (
    promotionId: string,
    action: { type: ActionType; value: string; target: ActionTarget; maxDiscountInCents?: number },
  ) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const newAction = await api.addAction(promotionId, action);
      setState((s) => ({
        ...s,
        isSaving: false,
        promotion: s.promotion
          ? { ...s.promotion, actions: [...s.promotion.actions, newAction] }
          : s.promotion,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al agregar la acción';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const deleteAction = useCallback(async (promotionId: string, actionId: string) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      await api.deleteAction(promotionId, actionId);
      setState((s) => ({
        ...s,
        isSaving: false,
        promotion: s.promotion
          ? { ...s.promotion, actions: s.promotion.actions.filter((a) => a.id !== actionId) }
          : s.promotion,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la acción';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  return { ...state, fetchPromotion, createPromotion, updatePromotion, addRule, deleteRule, addAction, deleteAction };
}
