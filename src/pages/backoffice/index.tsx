import { useEffect, useCallback } from 'react';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { BackofficeDashboard } from '@/features/dashboard/components/BackofficeDashboard';
import { useBackofficeDashboard } from '@/features/dashboard/hooks/useBackofficeDashboard';
import { useOnPaymentProof } from '@/features/payments/hooks/useOnPaymentProof';
import { useOnOrderCreated } from '@/features/payments/hooks/useOnOrderCreated';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function BackofficePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { counts, isLoading, error, fetchCounts } = useBackofficeDashboard();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) void fetchCounts(); }, [isAuthenticated]);

  // Auto-refresh counters on socket events
  const refetch = useCallback(() => { void fetchCounts(); }, [fetchCounts]);
  useOnPaymentProof(refetch);
  useOnOrderCreated(refetch);

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Inicio" breadcrumbs={[{ label: 'Inicio' }]}>
        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold mb-6 max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
          >
            {error}
          </div>
        )}
        <BackofficeDashboard counts={counts} isLoading={isLoading} />
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
