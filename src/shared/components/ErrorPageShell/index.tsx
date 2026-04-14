import type { ReactNode } from 'react';

interface ErrorPageShellProps {
  icon: ReactNode;
  headline: string;
  subtitle: string;
  children?: ReactNode;
}

/**
 * Self-contained error page layout. Does NOT depend on TiendaLayout
 * (which requires backend data for the navbar). Fully static.
 */
export function ErrorPageShell({
  icon,
  headline,
  subtitle,
  children,
}: ErrorPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-raised font-nunito">
      {/* Brand gradient stripe */}
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)',
        }}
      />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="mb-10">
            <span
              className="font-pacifico text-2xl bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #00C5D4, #F0177A)',
              }}
            >
              La Central
            </span>
            <span className="block font-nunito text-[0.5625rem] font-black uppercase tracking-widest text-orange mt-0.5">
              Caribeña
            </span>
          </div>

          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Tinted glow circle */}
              <div className="absolute inset-0 rounded-full bg-turquoise/8 dark:bg-turquoise/5" />
              {/* Decorative ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-turquoise/15 dark:border-turquoise/10" />
              {/* Icon */}
              <div className="relative w-20 h-20">{icon}</div>
            </div>
          </div>

          {/* Copy */}
          <h1 className="font-nunito text-2xl sm:text-[1.75rem] font-extrabold text-on-surface leading-tight mb-3">
            {headline}
          </h1>
          <p className="text-on-surface-muted text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
            {subtitle}
          </p>

          {/* CTAs */}
          {children && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient stripe (subtle echo) */}
      <div
        className="h-0.5 w-full shrink-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)',
        }}
      />
    </div>
  );
}

/* ── Shared CTA button styles ── */

export function PrimaryButton({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const classes =
    'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised outline-none';
  const style = {
    backgroundImage: 'linear-gradient(135deg, #00C5D4, #009BAB)',
  };

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={classes} style={style}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const classes =
    'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-on-surface border border-stroke bg-surface transition-all duration-200 hover:bg-surface-overlay hover:border-turquoise/30 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised outline-none';

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
