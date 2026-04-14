import type { CategoryTreeNode } from '../../domain/types';
import type { FiltersState } from '../../hooks/useProductsPage';
import { CategoryTree } from './CategoryTree';
import { PriceRangeInput } from './PriceRangeInput';

const AVAILABLE_TAGS = [
  { value: 'pieza-unica', label: 'Pieza única', emoji: '💎' },
  { value: 'edicion-limitada', label: 'Ed. limitada', emoji: '✨' },
];

interface ProductFiltersProps {
  filters: FiltersState;
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  onClear: () => void;
  categoryTree: CategoryTreeNode[];
  activeFilterCount: number;
  variant?: 'light' | 'dark';
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

export function ProductFilters({
  filters,
  onFilterChange,
  onClear,
  categoryTree,
  activeFilterCount,
  variant = 'light',
}: ProductFiltersProps) {
  const isDark = variant === 'dark';

  const sectionBorder = isDark ? 'border-white/10' : 'border-stroke';
  const sectionHeader = isDark
    ? 'text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-white/45 mb-3'
    : 'text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-on-surface-muted mb-3';

  const inputClasses = [
    'w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1',
    isDark
      ? 'bg-white/[0.08] border border-white/15 text-white placeholder:text-white/35 focus-visible:ring-offset-[#1A1A2E]'
      : 'bg-surface border border-stroke text-on-surface placeholder:text-on-surface-muted/50 focus-visible:ring-offset-surface',
  ].join(' ');

  const handleCategoryToggle = (id: string) => {
    const current = filters.categoryIds;
    const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    onFilterChange('categoryIds', next);
  };

  const handleTagToggle = (tag: string) => {
    const current = filters.tags;
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onFilterChange('tags', next);
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Search ── */}
      <div className={`px-4 py-4 border-b ${sectionBorder}`}>
        <div className={sectionHeader}>Buscar</div>
        <div className="relative group">
          <span
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
              isDark
                ? 'text-white/35 group-focus-within:text-turquoise'
                : 'text-on-surface-muted/50 group-focus-within:text-turquoise'
            }`}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange('query', e.target.value)}
            placeholder="Buscar producto..."
            className={`${inputClasses} pl-10`}
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onFilterChange('query', '')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors duration-150 ${
                isDark ? 'text-white/40 hover:text-white' : 'text-on-surface-muted hover:text-on-surface'
              }`}
              aria-label="Limpiar búsqueda"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className={`px-4 py-4 border-b ${sectionBorder}`}>
        <div className={sectionHeader}>Categorías</div>
        <CategoryTree
          tree={categoryTree}
          selectedIds={filters.categoryIds}
          onToggle={handleCategoryToggle}
          variant={variant}
        />
      </div>

      {/* ── Price Range ── */}
      <div className={`px-4 py-4 border-b ${sectionBorder}`}>
        <div className={sectionHeader}>Precio (MXN)</div>
        <PriceRangeInput
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinChange={(v) => onFilterChange('minPrice', v)}
          onMaxChange={(v) => onFilterChange('maxPrice', v)}
          variant={variant}
        />
      </div>

      {/* ── Tags ── */}
      <div className={`px-4 py-4 border-b ${sectionBorder}`}>
        <div className={sectionHeader}>Colección</div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => {
            const isActive = filters.tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => handleTagToggle(tag.value)}
                className={[
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-turquoise/15 border-turquoise/40 text-turquoise'
                    : isDark
                      ? 'bg-white/[0.06] border-white/15 text-white/60 hover:border-turquoise/30 hover:text-turquoise'
                      : 'bg-surface-overlay border-stroke text-on-surface-muted hover:border-turquoise/30 hover:text-turquoise',
                ].join(' ')}
              >
                {tag.emoji} {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Clear all ── */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-4">
          <button
            type="button"
            onClick={onClear}
            className={`text-sm font-semibold transition-colors duration-150 cursor-pointer underline underline-offset-2 ${
              isDark ? 'text-white/50 hover:text-pink' : 'text-on-surface-muted hover:text-pink'
            }`}
          >
            Limpiar filtros ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );
}
