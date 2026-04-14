import Link from 'next/link';
import type { BackofficeCart } from '../../domain/types';
import { fmtShort, fmtMoney } from './utils';

interface Props {
  carts: BackofficeCart[];
  deleteId: string | null;
  isDeleting: boolean;
  onDeleteStart: (id: string) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: (id: string) => void;
}

export function ActiveCartsTable({ carts, deleteId, isDeleting, onDeleteStart, onDeleteCancel, onDeleteConfirm }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
          {['ID', 'Items', 'Total estimado', 'Cupón', 'Creado', ''].map((h) => (
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
        {carts.map((cart) => {
          const total = cart.items.reduce((s, i) => s + i.product.priceInCents * i.quantity, 0);
          return (
            <tr
              key={cart.id}
              className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <td className="px-4 py-3">
                <span className="font-mono text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                  {cart.id.slice(0, 8)}…
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-bold tabular-nums" style={{ color: 'var(--on-surface)' }}>
                  {cart.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--on-surface-muted)' }}>
                  ({cart.items.length} líneas)
                </span>
              </td>
              <td className="px-4 py-3 font-bold" style={{ color: '#00C5D4' }}>
                {fmtMoney(total)}
              </td>
              <td className="px-4 py-3">
                {cart.couponCode ? (
                  <span
                    className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}
                  >
                    {cart.couponCode}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                {fmtShort(cart.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/backoffice/carts/${cart.id}`}
                    className="text-xs font-bold hover:text-turquoise transition-colors"
                    style={{ color: 'var(--on-surface-muted)' }}
                  >
                    Ver →
                  </Link>
                  {deleteId === cart.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { onDeleteConfirm(cart.id); }}
                        disabled={isDeleting}
                        className="text-xs font-bold transition-colors hover:opacity-70 disabled:opacity-50"
                        style={{ color: '#F0177A' }}
                      >
                        {isDeleting ? '…' : '✓'}
                      </button>
                      <button
                        onClick={onDeleteCancel}
                        className="text-xs font-bold transition-colors hover:opacity-70"
                        style={{ color: 'var(--on-surface-muted)' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { onDeleteStart(cart.id); }}
                      className="text-xs font-bold transition-colors hover:opacity-70"
                      style={{ color: 'rgba(240,23,122,0.5)' }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
