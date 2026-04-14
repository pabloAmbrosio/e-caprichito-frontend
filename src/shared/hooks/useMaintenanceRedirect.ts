import { useEffect } from 'react';
import type { NextRouter } from 'next/router';

const IS_MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE === 'true';

export function useMaintenanceRedirect(router: NextRouter) {
  useEffect(() => {
    if (IS_MAINTENANCE && router.pathname !== '/maintenance') {
      void router.replace('/maintenance');
    }
  }, [router]);
}
