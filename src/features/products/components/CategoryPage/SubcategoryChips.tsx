import type { SubcategoryChip } from '../../application/getCategoryPageData';

interface SubcategoryChipsProps {
  subcategories: SubcategoryChip[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function SubcategoryChips({ subcategories, activeId, onSelect }: SubcategoryChipsProps) {
  if (subcategories.length === 0) return null;

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1" role="group" aria-label="Filtrar por subcategoria">
      <button
        onClick={() => onSelect(null)}
        className={[
          'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2',
          'min-h-[2.75rem]',
          activeId === null
            ? 'bg-turquoise text-white shadow-[0_0.125rem_0.5rem_rgba(0,197,212,0.35)]'
            : 'bg-surface border border-stroke text-on-surface-muted hover:border-turquoise/30 hover:text-turquoise',
        ].join(' ')}
      >
        Todas
      </button>
      {subcategories.map((sub) => {
        const isActive = activeId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={[
              'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2',
              'min-h-[2.75rem]',
              isActive
                ? 'bg-turquoise text-white shadow-[0_0.125rem_0.5rem_rgba(0,197,212,0.35)]'
                : 'bg-surface border border-stroke text-on-surface-muted hover:border-turquoise/30 hover:text-turquoise',
            ].join(' ')}
          >
            {sub.emoticon ?? '📦'} {sub.name}
          </button>
        );
      })}
    </div>
  );
}
