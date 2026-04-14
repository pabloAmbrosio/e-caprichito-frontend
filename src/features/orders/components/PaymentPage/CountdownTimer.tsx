import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiresAt: string | null;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  // Expired
  if (diff <= 0) {
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-extrabold text-pink">Tu pedido ha expirado</p>
          <p className="text-xs font-medium text-on-surface-muted mt-0.5">
            El tiempo para completar el pago ha finalizado
          </p>
        </div>
      </div>
    );
  }

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // > 24h: show date instead of countdown
  if (totalHours >= 24) {
    const date = new Date(expiresAt);
    const formatted = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-yellow/5 dark:bg-yellow/10 border border-yellow/20 dark:border-yellow/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-bold text-on-surface">
            Tienes hasta el <span className="font-extrabold">{formatted}</span>
          </p>
          <p className="text-xs font-medium text-on-surface-muted mt-0.5">
            para completar tu pago
          </p>
        </div>
      </div>
    );
  }

  // < 24h: live countdown
  const isUrgent = totalHours < 1;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border ${
        isUrgent
          ? 'bg-pink/5 dark:bg-pink/10 border-pink/20 dark:border-pink/30'
          : 'bg-yellow/5 dark:bg-yellow/10 border-yellow/20 dark:border-yellow/30'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 shrink-0 ${isUrgent ? 'text-pink' : 'text-yellow'}`} aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        <p className="text-xs font-bold text-on-surface-muted mb-1">Tiempo restante para pagar</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black tabular-nums ${isUrgent ? 'text-pink' : 'text-on-surface'}`}>
            {pad(totalHours)}:{pad(minutes)}:{pad(seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
