import { useState } from 'react';
import type { FormEvent } from 'react';
import { checkIdentifier } from '../../infrastructure/authApi';
import { AuthApiError } from '../../infrastructure/authApi';
import { GoogleOAuthButton } from '../GoogleOAuthButton';

interface AuthStepIdentifierProps {
  onUserExists: (identifier: string) => void;
  onUserNew: (identifier: string, identifierType: 'phone' | 'email' | 'username') => void;
}

function detectIdentifierType(value: string): 'phone' | 'email' | 'username' {
  if (value.includes('@')) return 'email';
  if (/^\+?\d[\d\s-]{6,}$/.test(value.trim())) return 'phone';
  return 'username';
}

export function AuthStepIdentifier({ onUserExists, onUserNew }: AuthStepIdentifierProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;

    setError(null);
    setIsChecking(true);

    try {
      const result = await checkIdentifier(identifier.trim());
      const type = detectIdentifierType(identifier.trim());

      if (result.data.exists) {
        onUserExists(identifier.trim());
      } else {
        onUserNew(identifier.trim(), type);
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError('Error de conexion. Intenta de nuevo.');
      }
    } finally {
      setIsChecking(false);
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
          Entra o registrate
        </h2>
        <p className="text-sm text-on-surface-muted mt-1.5 font-semibold">
          Escribe tu telefono, email o usuario
        </p>
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
          <span className="text-sm font-bold text-on-surface">
            Telefono, email o usuario
          </span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
            placeholder="tu_usuario, +52..., o email@..."
          />
        </label>

        <button
          type="submit"
          disabled={isChecking || !identifier.trim()}
          className="w-full rounded-xl py-3.5 font-nunito font-extrabold text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.375rem_1.25rem_rgba(0,197,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          style={{
            background: 'linear-gradient(135deg, #00C5D4, #009BAB)',
            boxShadow: '0 4px 16px rgba(0,197,212,0.3)',
          }}
        >
          {isChecking ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
              Verificando...
            </span>
          ) : (
            'Continuar'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-stroke" />
        <span className="text-xs font-bold text-on-surface-muted/50 uppercase tracking-wider">o</span>
        <div className="flex-1 h-px bg-stroke" />
      </div>

      <GoogleOAuthButton />
    </div>
  );
}
