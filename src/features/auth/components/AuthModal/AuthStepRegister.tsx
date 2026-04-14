import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthApiError } from '../../infrastructure/authApi';

interface AuthStepRegisterProps {
  identifier: string;
  identifierType: 'phone' | 'email' | 'username';
  onBack: () => void;
  onSuccess: () => void;
}

export function AuthStepRegister({
  identifier,
  identifierType,
  onBack,
  onSuccess,
}: AuthStepRegisterProps) {
  const { register } = useAuth();

  // Pre-fill the field that was entered in step 1
  const [username, setUsername] = useState(identifierType === 'username' ? identifier : '');
  const [phone, setPhone] = useState(identifierType === 'phone' ? identifier : '');
  const [email, setEmail] = useState(identifierType === 'email' ? identifier : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        username,
        phone,
        password,
        email: email || undefined,
      });
      onSuccess();
    } catch (err) {
      if (err instanceof AuthApiError) {
        switch (err.code) {
          case 'USERNAME_ALREADY_EXISTS':
            setError('Ese nombre de usuario ya esta en uso.');
            break;
          case 'EMAIL_ALREADY_EXISTS':
            setError('Ese email ya esta registrado.');
            break;
          case 'PHONE_ALREADY_EXISTS':
            setError('Ese telefono ya esta registrado.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('Error de conexion. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          id="auth-modal-title"
          className="font-nunito text-2xl font-black text-on-surface tracking-tight"
        >
          Crea tu cuenta
        </h2>
        <p className="text-sm text-on-surface-muted mt-1.5 font-semibold">
          Unete a la familia caribeña
        </p>
      </div>

      {/* Back button + identifier chip */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-muted hover:text-turquoise hover:bg-turquoise/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 outline-none shrink-0"
          aria-label="Volver al paso anterior"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-turquoise/10 border border-turquoise/20 text-sm font-bold text-turquoise truncate max-w-[16rem]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          Nuevo usuario
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 rounded-xl px-4 py-3 mb-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-pink text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-on-surface">Usuario</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus={identifierType !== 'username'}
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
            placeholder="mi_usuario"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-on-surface">Telefono</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoFocus={identifierType === 'username'}
            autoComplete="tel"
            className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
            placeholder="+5491155551234"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-on-surface">Contrasena</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-stroke rounded-xl px-4 py-3 pr-11 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-turquoise transition-colors duration-200 p-0.5 rounded focus-visible:ring-2 focus-visible:ring-turquoise outline-none"
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
                  <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5" aria-hidden="true">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-on-surface">
            Email <span className="font-normal text-on-surface-muted">(opcional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
            placeholder="tu@email.com"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl py-3.5 font-nunito font-extrabold text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.375rem_1.25rem_rgba(240,23,122,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          style={{
            background: 'linear-gradient(135deg, #F0177A, #C0005A)',
            boxShadow: '0 4px 16px rgba(240,23,122,0.3)',
          }}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
              Creando cuenta...
            </span>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>
    </div>
  );
}
