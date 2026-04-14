import type { OrderStatus } from '@/shared/types/enums';

const ALL_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    SHIPPED: 'En camino',
    DELIVERED: 'Entregada',
    CANCELLED: 'Cancelada',
};

interface Props {
    statusFilter: OrderStatus | '';
    searchInput: string;
    onSearchInput: (val: string) => void;
    onSearch: () => void;
    onStatusChange: (status: OrderStatus | '') => void;
}

export function BackofficeOrdersFilters({
    statusFilter,
    searchInput,
    onSearchInput,
    onSearch,
    onStatusChange
}: Props) {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-2 flex-1 min-w-[220px]">
                <input
                    type="text"
                    placeholder="Buscar por cliente..."
                    value={searchInput}
                    onChange={(e) => onSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                    style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
                <button
                    onClick={onSearch}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)', color: '#fff' }}
                >
                    Buscar
                </button>
            </div>
            <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus | '')}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all cursor-pointer"
                style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            >
                <option value="">Todos los estados</option>
                {ALL_ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
            </select>
        </div>
    );
}
