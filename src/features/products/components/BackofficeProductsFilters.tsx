import Link from 'next/link';
import type { Category } from '../domain/types';

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

interface Props {
    search: string;
    onSearchChange: (s: string) => void;
    filterCategory: string;
    onFilterCategoryChange: (c: string) => void;
    categories: Category[];
}

export function BackofficeProductsFilters({
    search,
    onSearchChange,
    filterCategory,
    onFilterCategoryChange,
    categories
}: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--on-surface-muted)' }}>
                    <SearchIcon />
                </span>
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all"
                    style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
            </div>

            <select
                value={filterCategory}
                onChange={(e) => onFilterCategoryChange(e.target.value)}
                className="px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all cursor-pointer"
                style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <Link
                href="/backoffice/products/new"
                className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,197,212,0.35)] whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
                <PlusIcon />
                Nuevo producto
            </Link>
        </div>
    );
}
