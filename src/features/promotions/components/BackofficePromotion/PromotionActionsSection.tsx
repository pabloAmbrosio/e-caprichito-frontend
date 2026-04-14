import { useState } from 'react';
import type { PromotionAction } from '../../domain/types';
import type { ActionType, ActionTarget } from '@/shared/types/enums';

/* ─── Constants ─── */

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  PERCENTAGE_DISCOUNT: '% Descuento',
  FIXED_DISCOUNT: '$ Descuento fijo',
  BUY_X_GET_Y: 'Compra X lleva Y',
};

const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  PERCENTAGE_DISCOUNT: '#00C5D4',
  FIXED_DISCOUNT: '#F0177A',
  BUY_X_GET_Y: '#FFD600',
};

const ACTION_TARGET_LABELS: Record<ActionTarget, string> = {
  PRODUCT: 'Producto',
  CART: 'Carrito',
  CHEAPEST_ITEM: 'Ítem más barato',
};

/* ─── Props ─── */

interface Props {
  promotionId: string;
  actions: PromotionAction[];
  isSaving: boolean;
  onAddAction: (
    promotionId: string,
    action: { type: ActionType; value: string; target: ActionTarget; maxDiscountInCents?: number },
  ) => Promise<void>;
  onDeleteAction: (promotionId: string, actionId: string) => Promise<void>;
}

export function PromotionActionsSection({
  promotionId, actions, isSaving, onAddAction, onDeleteAction,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<ActionType>('PERCENTAGE_DISCOUNT');
  const [target, setTarget] = useState<ActionTarget>('CART');
  const [value, setValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  // BUY_X_GET_Y fields
  const [buyQty, setBuyQty] = useState('');
  const [getQty, setGetQty] = useState('');

  const resetForm = () => {
    setValue('');
    setMaxDiscount('');
    setBuyQty('');
    setGetQty('');
  };

  const handleAdd = async () => {
    let finalValue = value;

    if (type === 'FIXED_DISCOUNT') {
      finalValue = String(Math.round(parseFloat(value) * 100));
    } else if (type === 'BUY_X_GET_Y') {
      const bq = parseInt(buyQty, 10);
      const gq = parseInt(getQty, 10);
      if (isNaN(bq) || isNaN(gq) || bq < 1 || gq < 1) return;
      finalValue = JSON.stringify({ buyQuantity: bq, getQuantity: gq });
    }

    if (!finalValue.trim()) return;

    const maxInCents = maxDiscount ? Math.round(parseFloat(maxDiscount) * 100) : undefined;

    try {
      await onAddAction(promotionId, {
        type,
        value: finalValue,
        target,
        maxDiscountInCents: maxInCents,
      });
      resetForm();
      setIsFormOpen(false);
    } catch { /* error shown by parent */ }
  };

  const handleDelete = async (actionId: string) => {
    if (deletingId === actionId) {
      try {
        await onDeleteAction(promotionId, actionId);
      } catch { /* error shown by parent */ }
      setDeletingId(null);
    } else {
      setDeletingId(actionId);
    }
  };

  const formatActionValue = (action: PromotionAction): string => {
    if (action.type === 'PERCENTAGE_DISCOUNT') return `${action.value}%`;
    if (action.type === 'FIXED_DISCOUNT') {
      const cents = parseInt(action.value, 10);
      return isNaN(cents) ? action.value : `$${(cents / 100).toFixed(0)}`;
    }
    if (action.type === 'BUY_X_GET_Y') {
      try {
        const parsed = JSON.parse(action.value) as { buyQuantity: number; getQuantity: number };
        return `Compra ${parsed.buyQuantity}, lleva ${parsed.getQuantity} gratis`;
      } catch { return action.value; }
    }
    return action.value;
  };

  const formatMaxDiscount = (cents: number | null): string => {
    if (cents == null) return '—';
    return `$${(cents / 100).toFixed(0)}`;
  };

  const isAddDisabled = (): boolean => {
    if (isSaving) return true;
    if (type === 'BUY_X_GET_Y') {
      return !buyQty || !getQty || parseInt(buyQty, 10) < 1 || parseInt(getQty, 10) < 1;
    }
    return !value.trim();
  };

  const inputStyle = {
    background: 'var(--surface-overlay)',
    borderColor: 'var(--stroke)',
    color: 'var(--on-surface)',
  };

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4"
      style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
        >
          5
        </span>
        <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
          Acciones
        </h2>
      </div>

      {/* Existing actions list */}
      {actions.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-overlay)' }}>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Tipo</th>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Objetivo</th>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Valor</th>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Máx.</th>
                <th className="w-20 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr
                  key={action.id}
                  className="border-t transition-colors"
                  style={{ borderColor: 'var(--stroke)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,197,212,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: `${ACTION_TYPE_COLORS[action.type]}18`,
                        color: ACTION_TYPE_COLORS[action.type],
                      }}
                    >
                      {ACTION_TYPE_LABELS[action.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                    {ACTION_TARGET_LABELS[action.target]}
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: 'var(--on-surface)' }}>
                    {formatActionValue(action)}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                    {formatMaxDiscount(action.maxDiscountInCents)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {deletingId === action.id ? (
                      <span className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { void handleDelete(action.id); }}
                          className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-pink/10 transition-colors"
                          style={{ color: '#F0177A' }}
                          disabled={isSaving}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingId(null); }}
                          className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-surface-overlay transition-colors"
                          style={{ color: 'var(--on-surface-muted)' }}
                        >
                          ✕
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { void handleDelete(action.id); }}
                        className="text-xs font-bold px-2 py-0.5 rounded hover:bg-pink/10 transition-colors"
                        style={{ color: '#F0177A' }}
                        disabled={isSaving}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actions.length === 0 && !isFormOpen && (
        <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>
          Sin acciones — agrega al menos una para que la promoción tenga efecto.
        </p>
      )}

      {/* Add form */}
      {isFormOpen ? (
        <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}>
          <div className="grid grid-cols-2 gap-3">
            {/* Type select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value as ActionType); resetForm(); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={inputStyle}
              >
                {(Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((t) => (
                  <option key={t} value={t}>{ACTION_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Target select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Objetivo
              </label>
              <select
                value={target}
                onChange={(e) => { setTarget(e.target.value as ActionTarget); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={inputStyle}
              >
                {(Object.keys(ACTION_TARGET_LABELS) as ActionTarget[]).map((t) => (
                  <option key={t} value={t}>{ACTION_TARGET_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Value inputs — dynamic by type */}
          {type === 'PERCENTAGE_DISCOUNT' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Porcentaje de descuento
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={value}
                  onChange={(e) => { setValue(e.target.value); }}
                  placeholder="Ej. 20"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                />
                <span className="text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>%</span>
              </div>
            </div>
          )}

          {type === 'FIXED_DISCOUNT' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Descuento fijo (pesos)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={value}
                  onChange={(e) => { setValue(e.target.value); }}
                  placeholder="Ej. 50"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {type === 'BUY_X_GET_Y' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                  Compra X unidades
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={buyQty}
                  onChange={(e) => { setBuyQty(e.target.value); }}
                  placeholder="Ej. 3"
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                  Lleva Y gratis
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={getQty}
                  onChange={(e) => { setGetQty(e.target.value); }}
                  placeholder="Ej. 1"
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Max discount (optional, for all types) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
              Descuento máximo (opcional, en pesos)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={maxDiscount}
                onChange={(e) => { setMaxDiscount(e.target.value); }}
                placeholder="Sin límite"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { void handleAdd(); }}
              disabled={isAddDisabled()}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
              {isSaving ? 'Agregando…' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={() => { setIsFormOpen(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setIsFormOpen(true); }}
          className="self-start px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40 hover:text-turquoise"
          style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
        >
          + Agregar acción
        </button>
      )}
    </div>
  );
}
