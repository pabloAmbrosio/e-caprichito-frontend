import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken as refreshTokenApi,
  verifyPhone as verifyPhoneApi,
  requestOtp as requestOtpApi,
  getOtpStatus as getOtpStatusApi,
  addPhone as addPhoneApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
} from '../infrastructure/authApi';
import { decodeJWT } from '../infrastructure/jwtService';
import type {
  LoginInput,
  RegisterInput,
  Usuario,
  VerifyPhoneInput,
  ResetPasswordInput,
} from '../domain/types';

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

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await loginUser(input);
      store.setAuth(result.data.user, result.data.accessToken);
      // useSessionInit gestiona el scheduler via suscripción al store
      return result;
    },
    [store],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await registerUser(input);
      store.setAuth(result.data.user, result.data.accessToken);
      return result;
    },
    [store],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      store.clearAuth();
      // useSessionInit detiene el scheduler al ver isAuthenticated=false
      void router.push('/');
    }
  }, [store, router]);

  const refreshSession = useCallback(async () => {
    try {
      const result = await refreshTokenApi(store.accessToken);
      const newToken = result.data.accessToken;
      const user = userFromToken(newToken);
      store.setAuth(user, newToken);
      return newToken;
    } catch {
      store.clearAuth();
      return null;
    }
  }, [store]);

  const initializeFromToken = useCallback(
    (token: string) => {
      const user = userFromToken(token);
      store.setAuth(user, token);
      // useSessionInit arranca el scheduler al detectar el nuevo token en el store
    },
    [store],
  );

  const verifyPhone = useCallback(
    async (input: VerifyPhoneInput) => {
      const result = await verifyPhoneApi(input);
      store.setAuth(result.data.user, result.data.accessToken);
      return result;
    },
    [store],
  );

  const requestOtp = useCallback(async (phone: string) => {
    return requestOtpApi(phone);
  }, []);

  const addPhone = useCallback(
    async (phone: string) => {
      if (!store.accessToken) throw new Error('No autenticado');
      return addPhoneApi(phone, store.accessToken);
    },
    [store.accessToken],
  );

  const getOtpStatus = useCallback(async () => {
    if (!store.accessToken) return null;
    return getOtpStatusApi(store.accessToken);
  }, [store.accessToken]);

  const forgotPassword = useCallback(async (identifier: string) => {
    return forgotPasswordApi(identifier);
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    return resetPasswordApi(input);
  }, []);

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    register,
    logout,
    refreshSession,
    initializeFromToken,
    verifyPhone,
    requestOtp,
    addPhone,
    getOtpStatus,
    forgotPassword,
    resetPassword,
  };
}
