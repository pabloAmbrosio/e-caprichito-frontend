import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { AuthApiError } from '../infrastructure/authApi';

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
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
      void router.push('/');
    } catch (err) {
      if (err instanceof AuthApiError) {
        switch (err.code) {
          case 'USERNAME_ALREADY_EXISTS':
            setError('Ese nombre de usuario ya está en uso.');
            break;
          case 'EMAIL_ALREADY_EXISTS':
            setError('Ese email ya está registrado.');
            break;
          case 'PHONE_ALREADY_EXISTS':
            setError('Ese teléfono ya está registrado.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center mb-1">
        <h2 className="font-nunito text-2xl font-black text-on-surface tracking-tight">
          Crear cuenta
        </h2>
        <p className="text-sm text-on-surface-muted mt-1">
          Únete a la familia caribeña
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 rounded-xl px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-pink text-sm font-semibold">{error}</p>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-on-surface">Usuario</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9_]+"
          className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
          placeholder="mi_usuario"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-on-surface">Teléfono</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
          placeholder="+5491155551234"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-on-surface">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="border border-stroke rounded-xl px-4 py-3 text-sm font-semibold text-on-surface bg-surface placeholder:text-on-surface-muted/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-1 focus:border-turquoise"
          placeholder="••••••••"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-on-surface">
          Email <span className="font-normal text-on-surface-muted">(opcional)</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
