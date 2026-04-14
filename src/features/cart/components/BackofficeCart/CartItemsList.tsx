import type { BackofficeCartItem } from '../../domain/types';
import { fmtMoney } from './utils';

interface Props {
  items: BackofficeCartItem[];
  total: number;
}

export function CartItemsList({ items, total }: Props) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--on-surface-muted)' }}>
        Productos en el carrito
      </h2>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>Carrito vacío</p>
      ) : (
        <div className="flex flex-col gap-0">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={['flex items-center justify-between py-3 text-sm', idx > 0 ? 'border-t' : ''].join(' ')}
              style={{ borderColor: 'var(--stroke)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate" style={{ color: 'var(--on-surface)' }}>
                  {item.product.title}
                  {item.product.deletedAt && (
                    <span
                      className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(240,23,122,0.1)', color: '#F0177A' }}
                    >
                      Eliminado
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-muted)' }}>
                  {fmtMoney(item.product.priceInCents)} × {item.quantity}
                </p>
                {item.product.abstractProduct.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.product.abstractProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,214,0,0.1)', color: '#FFD600' }}
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-bold shrink-0 ml-4" style={{ color: 'var(--on-surface)' }}>
                {fmtMoney(item.product.priceInCents * item.quantity)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 mt-1 border-t" style={{ borderColor: 'var(--stroke)' }}>
            <span className="text-sm font-extrabold" style={{ color: 'var(--on-surface)' }}>Total estimado</span>
            <span className="text-lg font-extrabold" style={{ color: '#00C5D4' }}>{fmtMoney(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
