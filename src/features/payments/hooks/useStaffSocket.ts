import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { connectStaffSocket, disconnectStaffSocket } from '../infrastructure/staffSocket';

/**
 * Manages the staff WebSocket lifecycle.
 * Connects when user is authenticated with an admin role,
 * disconnects on logout or when leaving backoffice.
 * Call this ONCE from BackofficeLayout.
 */
export function useStaffSocket(): void {
  const accessToken = useAuthStore((s) => s.accessToken);
  const adminRole = useAuthStore((s) => s.user?.adminRole);
  const isStaff = !!adminRole && adminRole !== 'CUSTOMER';

  useEffect(() => {
    if (!accessToken || !isStaff) {
      disconnectStaffSocket();
      return;
    }

    connectStaffSocket(accessToken);

    return () => {
      disconnectStaffSocket();
    };
  }, [accessToken, isStaff]);
}
