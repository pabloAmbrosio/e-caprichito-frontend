import Link from 'next/link';
import type { ProductListItem, Category } from '../domain/types';

const STATUS_CONFIG = {
    PUBLISHED: { label: 'Publicado', bg: 'rgba(0,197,212,0.1)', color: '#00C5D4' },
    DRAFT: { label: 'Borrador', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
    ARCHIVED: { label: 'Archivado', bg: 'rgba(255,122,0,0.1)', color: '#FF7A00' },
} as const;

interface Props {
    isLoading: boolean;
    products: ProductListItem[];
    categories: Category[];
    search: string;
    filterCategory: string;
}

export function BackofficeProductsTable({
    isLoading,
    products,
    categories,
    search,
    filterCategory
}: Props) {
    return (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            {isLoading ? (
                <div className="p-8 flex flex-col gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center px-6">
                    <span className="text-5xl">📦</span>
                    <div>
                        <p className="font-extrabold text-lg mb-1" style={{ color: 'var(--on-surface)' }}>
                            {search || filterCategory ? 'Sin resultados' : 'Sin productos'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>
                            {search || filterCategory ? 'Prueba con otros filtros.' : 'Crea el primer producto de la tienda.'}
                        </p>
                    </div>
                    {!search && !filterCategory && (
                        <Link
                            href="/backoffice/products/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-all"
                            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nuevo producto
                        </Link>
                    )}
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                            {['Producto', 'Categoría', 'Estado', 'Variantes', 'Destacado', 'Acciones'].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider"
                                    style={{ color: 'var(--on-surface-muted)' }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const statusKey = product.status as keyof typeof STATUS_CONFIG | undefined;
                            const statusCfg = statusKey && STATUS_CONFIG[statusKey] ? STATUS_CONFIG[statusKey] : STATUS_CONFIG.DRAFT;
                            const category = categories.find((c) => c.id === product.categoryId);

                            return (
                                <tr
                                    key={product.id}
                                    className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                                    style={{ borderColor: 'var(--stroke)' }}
                                >
                                    <td className="px-4 py-3 max-w-[240px]">
                                        <div className="flex items-center gap-3">
                                            {product.variantes[0]?.images?.[0] ? (
                                                <img
                                                    src={product.variantes[0].images[0].thumbnailUrl ?? product.variantes[0].images[0].imageUrl}
                                                    alt={product.title}
                                                    className="w-9 h-9 rounded-lg object-cover shrink-0 border"
                                                    style={{ borderColor: 'var(--stroke)' }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
                                                    style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
                                                >
                                                    {product.title.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold truncate" style={{ color: 'var(--on-surface)' }}>{product.title}</p>
                                                <p className="text-xs font-mono truncate" style={{ color: 'var(--on-surface-muted)' }}>{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--on-surface-muted)' }}>
                                        {category?.name ?? '—'}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
                                            {statusCfg.label}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold"
                                            style={{ background: 'var(--surface-overlay)', color: 'var(--on-surface)' }}
                                        >
                                            {product.variantes.length}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        {product.isFeatured ? (
                                            <span className="text-yellow" title="Destacado">⭐</span>
                                        ) : (
                                            <span style={{ color: 'var(--on-surface-muted)' }}>—</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/backoffice/products/${product.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:bg-turquoise/10 hover:text-turquoise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                                            style={{ color: 'var(--on-surface-muted)' }}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
