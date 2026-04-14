import Link from 'next/link';

interface StatCardProps {
  icon: string;
  label: string;
  gradient: string;
  children: React.ReactNode;
  hoverBorder: string;
  hoverShadow: string;
}

function StatCard({ icon, label, gradient, children, hoverBorder, hoverShadow }: StatCardProps) {
  return (
    <div className={`group bg-surface rounded-2xl border border-stroke p-5 flex flex-col gap-3 ${hoverBorder} ${hoverShadow} transition-all duration-200 relative overflow-hidden`}>
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0"
          style={{ background: gradient }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="text-xs text-on-surface-muted font-bold uppercase tracking-wide">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

interface AccountStatsProps {
  phoneVerified?: boolean;
  favoritesTotal: number;
  favsLoading: boolean;
  customerRole?: string;
}

export function AccountStats({ phoneVerified, favoritesTotal, favsLoading, customerRole }: AccountStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Teléfono */}
      <StatCard
        icon="📱"
        label="Teléfono"
        gradient="linear-gradient(135deg, rgba(0,197,212,0.12), rgba(0,197,212,0.04))"
        hoverBorder="hover:border-turquoise/30"
        hoverShadow="hover:shadow-[0_0_0_3px_rgba(0,197,212,0.06)]"
      >
        {phoneVerified ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
            Verificado
          </span>
        ) : (
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-1 text-sm font-bold text-yellow hover:text-yellow/80 transition-colors duration-150"
          >
            Verificar ahora
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </StatCard>

      {/* Favoritos */}
      <StatCard
        icon="❤️"
        label="Favoritos"
        gradient="linear-gradient(135deg, rgba(240,23,122,0.12), rgba(240,23,122,0.04))"
        hoverBorder="hover:border-pink/30"
        hoverShadow="hover:shadow-[0_0_0_3px_rgba(240,23,122,0.06)]"
      >
        {favsLoading ? (
          <div className="w-10 h-7 rounded-lg bg-surface-overlay animate-pulse" />
        ) : (
          <span className="text-3xl font-extrabold text-pink tabular-nums">{favoritesTotal}</span>
        )}
        <Link
          href="/account/favorites"
          className="inline-flex items-center gap-1 text-xs text-turquoise font-bold hover:text-turquoise-dark transition-colors duration-150 mt-auto"
        >
          Ver favoritos
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
            <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
          </svg>
        </Link>
      </StatCard>

      {/* Rol */}
      <StatCard
        icon="✨"
        label="Mi Nivel"
        gradient="linear-gradient(135deg, rgba(255,214,0,0.15), rgba(255,214,0,0.05))"
        hoverBorder="hover:border-turquoise/30"
        hoverShadow="hover:shadow-[0_0_0_3px_rgba(0,197,212,0.06)]"
      >
        <span className="text-on-surface font-extrabold text-lg">
          {customerRole ?? 'MEMBER'}
        </span>
      </StatCard>
    </div>
  );
}
