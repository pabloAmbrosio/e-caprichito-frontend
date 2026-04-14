import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { refreshToken as refreshTokenApi } from '../infrastructure/authApi';
import { decodeJWT } from '../infrastructure/jwtService';
import { configureAuthFetch } from '../infrastructure/authFetch';
import { TokenRefreshScheduler } from '../infrastructure/tokenRefreshScheduler';
import type { Usuario } from '../domain/types';

function userFromToken(token: string): Usuario {
  const payload = decodeJWT(token);
  return {
    id: payload.userId,
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    adminRole: payload.adminRole,
    customerRole: payload.customerRole,
    phoneVerified: payload.phoneVerified,
  };
}

/**
 * Hook global de inicialización de sesión. Llamar SOLO desde _app.tsx.
 *
 * Responsabilidades:
 * - Configura authFetch (singleton global) con callbacks del store
 * - Intenta restaurar la sesión desde la httpOnly cookie via POST /api/auth/refresh
 * - Gestiona el ciclo de vida del TokenRefreshScheduler de forma global
 *   (arranca cuando cambia el accessToken, para cuando se limpia la sesión)
 */
export function useSessionInit() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const schedulerRef = useRef<TokenRefreshScheduler | null>(null);

  const handleSessionExpired = useCallback(() => {
    useAuthStore.getState().clearAuth();
    schedulerRef.current?.stop();
  }, []);

  const handleTokenRefreshed = useCallback((newToken: string) => {
    const user = userFromToken(newToken);
    useAuthStore.getState().setAuth(user, newToken);
  }, []);

  // Configurar authFetch y restaurar sesión al montar
  useEffect(() => {
    configureAuthFetch({
      getAccessToken: () => useAuthStore.getState().accessToken,
      setAccessToken: (token: string) => {
        const user = userFromToken(token);
        useAuthStore.getState().setAuth(user, token);
      },
      onSessionExpired: handleSessionExpired,
    });

    // Intentar restaurar sesión desde la httpOnly cookie
    refreshTokenApi(null)
      .then((result) => {
        const token = result.data.accessToken;
        const user = userFromToken(token);
        useAuthStore.getState().setAuth(user, token);
      })
      .catch(() => {
        // No hay sesión activa — desbloquear isLoading
        useAuthStore.getState().clearAuth();
      });

    return () => {
      schedulerRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrancar o reiniciar el scheduler cuando cambia el accessToken
  useEffect(() => {
    if (!accessToken) return;

    if (!schedulerRef.current) {
      schedulerRef.current = new TokenRefreshScheduler({
        onTokenRefreshed: handleTokenRefreshed,
        onSessionExpired: handleSessionExpired,
        getAccessToken: () => useAuthStore.getState().accessToken,
        doRefresh: async () => {
          const result = await refreshTokenApi(useAuthStore.getState().accessToken);
          return result.data.accessToken;
        },
      });
    }

    schedulerRef.current.start(accessToken);
  }, [accessToken, handleTokenRefreshed, handleSessionExpired]);

  // Detener el scheduler cuando se cierra sesión
  useEffect(() => {
    if (!isAuthenticated) {
      schedulerRef.current?.stop();
    }
  }, [isAuthenticated]);
}
