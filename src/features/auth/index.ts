// Domain
export type {
  AdminRole,
  CustomerRole,
  Usuario,
  JWTPayload,
  LoginInput,
  RegisterInput,
  VerifyPhoneInput,
  ResetPasswordInput,
  AuthResponse,
  ApiError,
} from './domain/types';

// Store
export { useAuthStore } from './store/authStore';
export { useAuthModalStore } from './store/authModalStore';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useSessionInit } from './hooks/useSessionInit';

// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { GoogleOAuthButton } from './components/GoogleOAuthButton';
export { AuthCallback } from './components/AuthCallback';
export { AuthModal } from './components/AuthModal';

// Guards
export { ProtectedRoute } from './guards/ProtectedRoute';

// Infrastructure (solo lo necesario para otros módulos)
export { authFetch, configureAuthFetch } from './infrastructure/authFetch';
export { AuthApiError } from './infrastructure/authApi';
