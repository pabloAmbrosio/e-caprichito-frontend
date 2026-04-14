import { useState } from 'react';

interface AddPhoneFormProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function AddPhoneForm({ onSubmit, isLoading, error }: AddPhoneFormProps) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="mb-6 px-4 py-5 bg-yellow/5 dark:bg-yellow/8 rounded-xl border border-yellow/20">
      <div className="flex items-start gap-3 mb-4">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow shrink-0 mt-0.5" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-bold text-on-surface">
            Agrega tu numero de telefono
          </p>
          <p className="text-xs text-on-surface-muted mt-0.5">
            Necesitas un numero de telefono para verificar tu cuenta y acceder a todas las funciones.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+52 1234567890"
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-stroke bg-surface text-on-surface text-sm font-semibold placeholder:text-on-surface-muted/50 outline-none transition-all duration-200 focus:border-turquoise focus:ring-2 focus:ring-turquoise/20"
          disabled={isLoading}
          autoComplete="tel"
        />
        <button
          type="submit"
          disabled={!phone.trim() || isLoading}
          className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {isLoading ? 'Enviando...' : 'Agregar telefono'}
        </button>
      </form>

      {error && (
        <p className="text-xs text-pink font-semibold mt-2">{error}</p>
      )}
    </div>
  );
}
