import Link from 'next/link';

interface BackofficeDashboardProps {
  counts: {
    paymentsToReview: number;
    shipmentsToAdvance: number;
    pendingOrders: number;
  };
  isLoading: boolean;
}

/* ── Stat Card Config ─────────────────────────────────── */

interface StatCardConfig {
  label: string;
  href: string;
  accentColor: string;
  glowColor: string;
  bgTint: string;
  iconBg: string;
  icon: React.ReactNode;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    label: 'Pagos por revisar',
    href: '/backoffice/payments?status=AWAITING_REVIEW',
    accentColor: '#F0177A',
    glowColor: 'rgba(240,23,122,0.25)',
    bgTint: 'rgba(240,23,122,0.06)',
    iconBg: 'linear-gradient(135deg, #F0177A, #C0005A)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Envíos por avanzar',
    href: '/backoffice/shipments',
    accentColor: '#FFD600',
    glowColor: 'rgba(255,214,0,0.2)',
    bgTint: 'rgba(255,214,0,0.06)',
    iconBg: 'linear-gradient(135deg, #FFD600, #FF7A00)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Órdenes pendientes',
    href: '/backoffice/orders?status=PENDING',
    accentColor: '#00C5D4',
    glowColor: 'rgba(0,197,212,0.2)',
    bgTint: 'rgba(0,197,212,0.06)',
    iconBg: 'linear-gradient(135deg, #00C5D4, #009BAB)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

function getCountForIndex(counts: BackofficeDashboardProps['counts'], index: number): number {
  if (index === 0) return counts.paymentsToReview;
  if (index === 1) return counts.shipmentsToAdvance;
  return counts.pendingOrders;
}

/* ── Step Flow Config ─────────────────────────────────── */

interface StepConfig {
  number: number;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
  accentColor: string;
}

const STEPS: StepConfig[] = [
  {
    number: 1,
    title: 'Revisa los pagos',
    description: 'Cuando un cliente sube su comprobante, revísalo y apruébalo. La orden se confirma automáticamente.',
    ctaLabel: 'Ir a Pagos',
    ctaHref: '/backoffice/payments',
    gradient: 'linear-gradient(135deg, #F0177A, #C0005A)',
    accentColor: '#F0177A',
  },
  {
    number: 2,
    title: 'Gestiona el envío',
    description: 'Prepara el pedido, asigna paquetería y avanza el estado. La orden se actualiza automáticamente.',
    ctaLabel: 'Ir a Envíos',
    ctaHref: '/backoffice/shipments',
    gradient: 'linear-gradient(135deg, #FFD600, #FF7A00)',
    accentColor: '#FFD600',
  },
];

/* ── Arrow between steps ──────────────────────────────── */

function StepArrow({ direction }: { direction: 'horizontal' | 'vertical' }) {
  if (direction === 'horizontal') {
    return (
      <div className="hidden sm:flex items-center justify-center" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M8 16H24M24 16L18 10M24 16L18 22"
            stroke="var(--on-surface-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex sm:hidden items-center justify-center py-1" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 8V24M16 24L10 18M16 24L22 18"
          stroke="var(--on-surface-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

/* ── Skeleton Card ────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border p-6 animate-pulse"
      style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--surface-overlay)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-8 w-16 rounded-lg" style={{ background: 'var(--surface-overlay)' }} />
          <div className="h-4 w-28 rounded" style={{ background: 'var(--surface-overlay)' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */

export function BackofficeDashboard({ counts, isLoading }: BackofficeDashboardProps) {
  return (
    <div className="space-y-10">
      {/* Section 1 — Pending counters */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: 'linear-gradient(180deg, #F0177A, #FF7A00)' }}
            aria-hidden="true"
          />
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--on-surface)' }}>
            Pendientes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : STAT_CARDS.map((card, idx) => {
                const count = getCountForIndex(counts, idx);
                const hasItems = count > 0;
                return (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="group relative rounded-2xl border p-6 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      borderColor: hasItems ? `${card.accentColor}33` : 'var(--stroke)',
                      background: hasItems ? card.bgTint : 'var(--surface)',
                      boxShadow: hasItems ? `0 0 0 1px ${card.accentColor}15` : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 1.5rem ${card.glowColor}`;
                      e.currentTarget.style.borderColor = `${card.accentColor}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = hasItems ? `0 0 0 1px ${card.accentColor}15` : 'none';
                      e.currentTarget.style.borderColor = hasItems ? `${card.accentColor}33` : 'var(--stroke)';
                    }}
                  >
                    {/* Pulsing dot */}
                    {hasItems && (
                      <span
                        className="absolute top-3 right-3 flex h-2.5 w-2.5"
                        aria-hidden="true"
                      >
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: card.accentColor }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-2.5 w-2.5"
                          style={{ backgroundColor: card.accentColor }}
                        />
                      </span>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl text-white shrink-0"
                        style={{ background: card.iconBg }}
                      >
                        {card.icon}
                      </div>
                      {/* Count + label */}
                      <div>
                        <p
                          className="text-3xl font-extrabold leading-none tabular-nums"
                          style={{ color: hasItems ? card.accentColor : 'var(--on-surface)' }}
                        >
                          {count}
                        </p>
                        <p
                          className="text-sm font-semibold mt-1"
                          style={{ color: 'var(--on-surface-muted)' }}
                        >
                          {card.label}
                        </p>
                      </div>
                    </div>

                    {/* Hover hint */}
                    <div
                      className="flex items-center gap-1 mt-4 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: card.accentColor }}
                    >
                      Ver detalles
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
        </div>
      </section>

      {/* Section 2 — How it works */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
            aria-hidden="true"
          />
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--on-surface)' }}>
            ¿Cómo funciona?
          </h2>
        </div>

        {/* Steps flow */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-0 sm:gap-0 items-stretch">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="contents">
              {/* Vertical arrow (mobile only, between steps) */}
              {idx > 0 && <StepArrow direction="vertical" />}

              {/* Step card */}
              <div
                className="rounded-2xl border p-6 flex flex-col"
                style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
              >
                {/* Number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-extrabold text-white shrink-0"
                    style={{ background: step.gradient }}
                  >
                    {step.number}
                  </span>
                  <h3
                    className="text-base font-extrabold"
                    style={{ color: 'var(--on-surface)' }}
                  >
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-5"
                  style={{ color: 'var(--on-surface-muted)' }}
                >
                  {step.description}
                </p>

                {/* CTA button */}
                <Link
                  href={step.ctaHref}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg self-start"
                  style={{ background: step.gradient }}
                >
                  {step.ctaLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>

              {/* Horizontal arrow (desktop only, between steps) */}
              {idx < STEPS.length - 1 && <StepArrow direction="horizontal" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
