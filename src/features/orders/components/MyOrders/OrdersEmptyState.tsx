import Link from 'next/link';

export function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-6xl" aria-hidden="true">
        📦
      </span>
      <div>
        <p className="text-lg font-extrabold text-on-surface">Sin pedidos todavia</p>
        <p className="text-sm text-on-surface-muted mt-1">
          Cuando hagas tu primera compra, aparecera aqui.
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 inline-block px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
      >
        Explorar la tienda
      </Link>
    </div>
  );
}
