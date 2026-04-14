import { useState, useEffect, useCallback } from 'react';
import type { PromotionRule } from '../../domain/types';
import type { RuleType, ComparisonOperator, RuleOperator } from '@/shared/types/enums';
import { createProductApi, type Category, type CategoryTreeNode } from '@/features/products';

const productApi = createProductApi();

/* ─── Constants ─── */

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  PRODUCT: 'Producto',
  CATEGORY: 'Categoría',
  TAG: 'Etiqueta',
  CART_MIN_TOTAL: 'Mínimo en carrito ($)',
  CART_MIN_QUANTITY: 'Mínimo en carrito (qty)',
  CUSTOMER_ROLE: 'Rol de cliente',
  FIRST_PURCHASE: 'Primera compra',
};

const RULE_TYPE_COLORS: Record<RuleType, string> = {
  PRODUCT: '#00C5D4',
  CATEGORY: '#F0177A',
  TAG: '#FFD600',
  CART_MIN_TOTAL: '#FF7A00',
  CART_MIN_QUANTITY: '#FF7A00',
  CUSTOMER_ROLE: '#9999BB',
  FIRST_PURCHASE: '#4CAF50',
};

const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  EQUALS: '=',
  NOT_EQUALS: '≠',
  IN: 'en',
  NOT_IN: 'no en',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_OR_EQUAL: '≥',
  LESS_OR_EQUAL: '≤',
};

const OPERATORS_BY_TYPE: Record<RuleType, ComparisonOperator[]> = {
  PRODUCT: ['EQUALS', 'IN', 'NOT_IN'],
  CATEGORY: ['EQUALS', 'IN', 'NOT_IN'],
  TAG: ['EQUALS', 'IN', 'NOT_IN'],
  CART_MIN_TOTAL: ['GREATER_THAN', 'GREATER_OR_EQUAL', 'LESS_THAN', 'LESS_OR_EQUAL', 'EQUALS'],
  CART_MIN_QUANTITY: ['GREATER_THAN', 'GREATER_OR_EQUAL', 'LESS_THAN', 'LESS_OR_EQUAL', 'EQUALS'],
  CUSTOMER_ROLE: ['EQUALS', 'IN'],
  FIRST_PURCHASE: ['EQUALS'],
};

const KNOWN_TAGS = ['pieza-unica', 'edicion-limitada'];
const CUSTOMER_ROLES = ['MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND'];

/* ─── Category option helpers ─── */

interface CategoryOption {
  value: string;
  label: string;
  isParent: boolean;
  depth: number;
}

function buildCategoryOptions(tree: CategoryTreeNode[]): CategoryOption[] {
  const options: CategoryOption[] = [];
  for (const parent of tree) {
    options.push({ value: parent.id, label: parent.name, isParent: true, depth: 0 });
    for (const child of parent.children) {
      options.push({ value: child.id, label: `${parent.name} > ${child.name}`, isParent: false, depth: 1 });
      for (const grandchild of child.children) {
        options.push({ value: grandchild.id, label: `${parent.name} > ${child.name} > ${grandchild.name}`, isParent: false, depth: 2 });
      }
    }
  }
  return options;
}

/* ─── Props ─── */

interface Props {
  promotionId: string;
  rules: PromotionRule[];
  ruleOperator: RuleOperator;
  isSaving: boolean;
  onAddRule: (promotionId: string, rule: { type: RuleType; operator: ComparisonOperator; value: string }) => Promise<void>;
  onDeleteRule: (promotionId: string, ruleId: string) => Promise<void>;
  onUpdateRuleOperator: (ruleOperator: RuleOperator) => Promise<void>;
}

export function PromotionRulesSection({
  promotionId, rules, ruleOperator, isSaving,
  onAddRule, onDeleteRule, onUpdateRuleOperator,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<RuleType>('CATEGORY');
  const [operator, setOperator] = useState<ComparisonOperator>('EQUALS');
  const [value, setValue] = useState('');

  // Dynamic data for selects
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Load categories once
  useEffect(() => {
    void productApi.backofficeGetCategories('all').then((res) => {
      setCategories(res.flat);
      setCategoryTree(res.tree);
    });
  }, []);

  // Search products on demand
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) { setProducts([]); return; }
    try {
      const res = await productApi.list({ title: query, limit: 10 });
      setProducts(res.items.map((p) => ({ id: p.id, title: p.title })));
    } catch { setProducts([]); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void searchProducts(productSearch); }, 300);
    return () => { clearTimeout(t); };
  }, [productSearch, searchProducts]);

  // Reset operator/value when type changes
  useEffect(() => {
    const ops = OPERATORS_BY_TYPE[type];
    if (ops && !ops.includes(operator)) {
      setOperator(ops[0]!);
    }
    setValue('');
    setProductSearch('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleAdd = async () => {
    let finalValue = value;
    if (type === 'FIRST_PURCHASE') finalValue = 'true';
    if (type === 'CART_MIN_TOTAL') finalValue = String(Math.round(parseFloat(value) * 100));
    if (!finalValue.trim()) return;
    try {
      await onAddRule(promotionId, { type, operator, value: finalValue });
      setValue('');
      setProductSearch('');
      setIsFormOpen(false);
    } catch { /* error shown by parent */ }
  };

  const handleDelete = async (ruleId: string) => {
    if (deletingId === ruleId) {
      try {
        await onDeleteRule(promotionId, ruleId);
      } catch { /* error shown by parent */ }
      setDeletingId(null);
    } else {
      setDeletingId(ruleId);
    }
  };

  const formatRuleValue = (rule: PromotionRule): string => {
    if (rule.type === 'FIRST_PURCHASE') return 'Sí';
    if (rule.type === 'CART_MIN_TOTAL') {
      const cents = parseInt(rule.value, 10);
      return isNaN(cents) ? rule.value : `$${(cents / 100).toFixed(0)}`;
    }
    if (rule.type === 'CART_MIN_QUANTITY') return `${rule.value} items`;
    if (rule.type === 'CATEGORY') {
      const ids = rule.value.split(',');
      const names = ids.map((id) => {
        const cat = categories.find((c) => c.id === id);
        return cat ? cat.name : id;
      });
      return names.join(', ');
    }
    return rule.value;
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
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
          >
            4
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
            Condiciones
          </h2>
        </div>

        {/* Rule operator toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
            {ruleOperator === 'ALL' ? 'Todas deben cumplirse' : 'Al menos una'}
          </span>
          <button
            type="button"
            onClick={() => { void onUpdateRuleOperator(ruleOperator === 'ALL' ? 'ANY' : 'ALL'); }}
            disabled={isSaving}
            className="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer"
            style={{ background: ruleOperator === 'ALL' ? '#00C5D4' : '#FF7A00' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform"
              style={{ transform: ruleOperator === 'ALL' ? 'translateX(0)' : 'translateX(1.25rem)' }}
            />
          </button>
        </div>
      </div>

      {/* Existing rules list */}
      {rules.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-overlay)' }}>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Tipo</th>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Op.</th>
                <th className="text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Valor</th>
                <th className="w-20 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-t transition-colors"
                  style={{ borderColor: 'var(--stroke)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,197,212,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: `${RULE_TYPE_COLORS[rule.type]}18`,
                        color: RULE_TYPE_COLORS[rule.type],
                      }}
                    >
                      {RULE_TYPE_LABELS[rule.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                    {OPERATOR_LABELS[rule.operator]}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--on-surface)' }}>
                    {formatRuleValue(rule)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {deletingId === rule.id ? (
                      <span className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { void handleDelete(rule.id); }}
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
                        onClick={() => { void handleDelete(rule.id); }}
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

      {rules.length === 0 && !isFormOpen && (
        <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>
          Sin condiciones — la promoción aplica a todos los carritos.
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
                onChange={(e) => { setType(e.target.value as RuleType); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={inputStyle}
              >
                {(Object.keys(RULE_TYPE_LABELS) as RuleType[]).map((t) => (
                  <option key={t} value={t}>{RULE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Operator select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Operador
              </label>
              <select
                value={operator}
                onChange={(e) => { setOperator(e.target.value as ComparisonOperator); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={inputStyle}
              >
                {OPERATORS_BY_TYPE[type]?.map((op) => (
                  <option key={op} value={op}>{OPERATOR_LABELS[op]} ({op})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Value input — dynamic by type */}
          {type !== 'FIRST_PURCHASE' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                Valor
              </label>

              {type === 'CATEGORY' && (() => {
                const catOptions = buildCategoryOptions(categoryTree);
                const isMulti = operator === 'IN' || operator === 'NOT_IN';
                const selectedIds = new Set(value ? value.split(',') : []);

                if (isMulti) {
                  // Multi-select: clickable list with checkmarks
                  return (
                    <div className="flex flex-col gap-1.5">
                      {selectedIds.size > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {[...selectedIds].map((id) => {
                            const opt = catOptions.find((o) => o.value === id);
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(240,23,122,0.12)', color: '#F0177A' }}
                              >
                                {opt?.label ?? id}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Set(selectedIds);
                                    next.delete(id);
                                    setValue([...next].join(','));
                                  }}
                                  className="hover:opacity-70 ml-0.5"
                                  aria-label={`Quitar ${opt?.label ?? id}`}
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div
                        className="rounded-xl border max-h-52 overflow-y-auto"
                        style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
                      >
                        {catOptions.map((opt) => {
                          if (opt.isParent) {
                            return (
                              <div
                                key={opt.value}
                                className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider sticky top-0"
                                style={{ color: 'var(--on-surface-muted)', background: 'var(--surface-overlay)' }}
                              >
                                {opt.label}
                              </div>
                            );
                          }
                          const isChecked = selectedIds.has(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                const next = new Set(selectedIds);
                                if (isChecked) next.delete(opt.value);
                                else next.add(opt.value);
                                setValue([...next].join(','));
                              }}
                              className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-turquoise/5 flex items-center gap-2"
                              style={{
                                paddingLeft: `${opt.depth * 0.75 + 0.75}rem`,
                                color: isChecked ? '#F0177A' : 'var(--on-surface)',
                                fontWeight: isChecked ? 700 : 400,
                              }}
                            >
                              <span
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px]"
                                style={{
                                  borderColor: isChecked ? '#F0177A' : 'var(--stroke)',
                                  background: isChecked ? 'rgba(240,23,122,0.12)' : 'transparent',
                                  color: '#F0177A',
                                }}
                              >
                                {isChecked ? '✓' : ''}
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Single select: native select with optgroups
                return (
                  <select
                    value={value}
                    onChange={(e) => { setValue(e.target.value); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={inputStyle}
                  >
                    <option value="">Selecciona subcategoría…</option>
                    {catOptions.map((opt) =>
                      opt.isParent ? (
                        <option key={opt.value} value="" disabled style={{ fontWeight: 700, color: 'var(--on-surface-muted)' }}>
                          ── {opt.label}
                        </option>
                      ) : (
                        <option key={opt.value} value={opt.value}>
                          {'  '.repeat(opt.depth)}{opt.label}
                        </option>
                      ),
                    )}
                  </select>
                );
              })()}

              {type === 'PRODUCT' && (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); }}
                    placeholder="Buscar producto por nombre…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={inputStyle}
                  />
                  {products.length > 0 && (
                    <div
                      className="rounded-xl border max-h-40 overflow-y-auto"
                      style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
                    >
                      {products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setValue(p.id); setProductSearch(p.title); setProducts([]); }}
                          className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-turquoise/5"
                          style={{ color: value === p.id ? '#00C5D4' : 'var(--on-surface)' }}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {value && (
                    <span className="text-xs font-mono" style={{ color: 'var(--on-surface-muted)' }}>
                      ID: {value}
                    </span>
                  )}
                </div>
              )}

              {type === 'TAG' && (
                <div className="flex gap-2 flex-wrap">
                  {KNOWN_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => { setValue(tag); }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                      style={{
                        borderColor: value === tag ? '#FFD600' : 'var(--stroke)',
                        background: value === tag ? 'rgba(255,214,0,0.15)' : 'transparent',
                        color: value === tag ? '#FFD600' : 'var(--on-surface-muted)',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {type === 'CUSTOMER_ROLE' && (
                <select
                  value={value}
                  onChange={(e) => { setValue(e.target.value); }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                >
                  <option value="">Selecciona rol…</option>
                  {CUSTOMER_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}

              {(type === 'CART_MIN_TOTAL') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={value}
                    onChange={(e) => { setValue(e.target.value); }}
                    placeholder="Monto en pesos"
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={inputStyle}
                  />
                </div>
              )}

              {type === 'CART_MIN_QUANTITY' && (
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={value}
                  onChange={(e) => { setValue(e.target.value); }}
                  placeholder="Cantidad mínima"
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                  style={inputStyle}
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { void handleAdd(); }}
              disabled={isSaving || (type !== 'FIRST_PURCHASE' && !value.trim())}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
              {isSaving ? 'Agregando…' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={() => { setIsFormOpen(false); setValue(''); setProductSearch(''); }}
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
          + Agregar condición
        </button>
      )}
    </div>
  );
}
