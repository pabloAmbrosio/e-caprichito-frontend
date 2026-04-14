import { useState } from 'react';
import Link from 'next/link';
import type { Category } from '../domain/types';

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}
function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

interface Props {
    isLoading: boolean;
    categories: Category[];
    onDelete: (categoryId: string) => Promise<void>;
}

export function BackofficeCategoriesTable({ isLoading, categories, onDelete }: Props) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const handleDelete = async (cat: Category) => {
        if (confirmId !== cat.id) {
            setConfirmId(cat.id);
            return;
        }
        setDeletingId(cat.id);
        try {
            await onDelete(cat.id);
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            {isLoading ? (
                <div className="p-8 flex flex-col gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center px-6">
                    <span className="text-5xl">📁</span>
                    <div>
                        <p className="font-extrabold text-lg mb-1" style={{ color: 'var(--on-surface)' }}>Sin categorías</p>
                        <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>Crea la primera categoría para empezar.</p>
                    </div>
                    <Link
                        href="/backoffice/categories/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                    >
                        <PlusIcon />
                        Nueva categoría
                    </Link>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                            {['Categoría', 'Slug', 'Tipo', 'Orden', 'Estado', 'Acciones'].map((h) => (
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
                        {categories.map((cat, i) => (
                            <tr
                                key={cat.id}
                                className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.03)]"
                                style={{ borderColor: 'var(--stroke)' }}
                            >
                                {/* Nombre */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        {cat.emoticon ? (
                                            <span className="text-lg leading-none">{cat.emoticon}</span>
                                        ) : (
                                            <span
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
                                                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                                            >
                                                {cat.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                                            {cat.name}
                                        </span>
                                    </div>
                                </td>
                                {/* Slug */}
                                <td className="px-4 py-3">
                                    <code
                                        className="text-xs px-2 py-0.5 rounded-lg font-mono"
                                        style={{ background: 'var(--surface-overlay)', color: 'var(--on-surface-muted)' }}
                                    >
                                        {cat.slug}
                                    </code>
                                </td>
                                {/* Tipo */}
                                <td className="px-4 py-3">
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                                        style={cat.parentId
                                            ? { background: 'rgba(255,122,0,0.1)', color: '#FF7A00' }
                                            : { background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }
                                        }
                                    >
                                        {cat.parentId ? 'Subcategoría' : 'Raíz'}
                                    </span>
                                </td>
                                {/* Orden */}
                                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                                    {cat.sortOrder}
                                </td>
                                {/* Estado */}
                                <td className="px-4 py-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                        style={cat.isActive
                                            ? { background: 'rgba(0,197,212,0.08)', color: '#00C5D4' }
                                            : { background: 'var(--surface-overlay)', color: 'var(--on-surface-muted)' }
                                        }
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: cat.isActive ? '#00C5D4' : 'var(--on-surface-muted)', opacity: cat.isActive ? 1 : 0.4 }}
                                        />
                                        {cat.isActive ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                {/* Acciones */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/backoffice/categories/${cat.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:bg-turquoise/10 hover:text-turquoise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                                            style={{ color: 'var(--on-surface-muted)' }}
                                        >
                                            <EditIcon />
                                            Editar
                                        </Link>
                                        {confirmId === cat.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => void handleDelete(cat)}
                                                    disabled={deletingId === cat.id}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink/10 text-pink hover:bg-pink/20 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === cat.id ? 'Eliminando...' : 'Confirmar'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(null)}
                                                    className="px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-surface-overlay transition-colors"
                                                    style={{ color: 'var(--on-surface-muted)' }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => void handleDelete(cat)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:bg-pink/10 hover:text-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50"
                                                style={{ color: 'var(--on-surface-muted)' }}
                                            >
                                                <TrashIcon />
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
