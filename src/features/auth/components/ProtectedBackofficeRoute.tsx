import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/features/auth/store/authStore';

interface ProtectedBackofficeRouteProps {
  children: ReactNode;
}

export function ProtectedBackofficeRoute({ children }: ProtectedBackofficeRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  const hasAccess = isAuthenticated && user?.adminRole !== 'CUSTOMER';

  useEffect(() => {
    if (isLoading) return;
    if (!hasAccess) {
      void router.replace('/');
    }
  }, [isLoading, hasAccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-raised)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: '#00C5D4', borderRightColor: '#F0177A' }}
          />
          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}
