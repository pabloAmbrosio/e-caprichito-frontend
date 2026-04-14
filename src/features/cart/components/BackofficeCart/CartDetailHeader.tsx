import type { BackofficeCart } from '../../domain/types';
import { fmtMediumTime, fmtMoney } from './utils';

interface Props {
  cart: BackofficeCart;
  total: number;
  totalQty: number;
}

export function CartDetailHeader({ cart, total, totalQty }: Props) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }} aria-hidden="true" />
      <div className="p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-muted)' }}>
            Total estimado
          </p>
          <p className="text-2xl font-extrabold" style={{ color: '#00C5D4' }}>{fmtMoney(total)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>
            {totalQty} {totalQty === 1 ? 'producto' : 'productos'} · Creado {fmtMediumTime(cart.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {cart.couponCode && (
            <span
              className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}
            >
              {cart.couponCode}
            </span>
          )}
          <p className="font-mono text-xs" style={{ color: 'var(--on-surface-muted)' }}>
            ID: {cart.id}
          </p>
        </div>
      </div>
    </div>
  );
}
