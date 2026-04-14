import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

const CODE_LENGTH = 6;

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0,
  );

  useEffect(() => {
    if (!expiresAt) { setRemaining(0); return; }

    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setRemaining(calc());

    const id = setInterval(() => {
      const next = calc();
      setRemaining(next);
      if (next <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { remaining, display, expired: remaining <= 0 };
}

interface PhoneVerificationAlertProps {
  phone: string;
  otpSent: boolean;
  otpLoading: boolean;
  otpError: string | null;
  verifyLoading: boolean;
  verifyError: string | null;
  verified: boolean;
  expiresAt: string | null;
  onRequestOtp: () => void;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export function PhoneVerificationAlert({
  phone,
  otpSent,
  otpLoading,
  otpError,
  verifyLoading,
  verifyError,
  verified,
  expiresAt,
  onRequestOtp,
  onVerify,
  onResend,
}: PhoneVerificationAlertProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { display, expired } = useCountdown(otpSent ? expiresAt : null);

  // Focus first input when OTP is sent
  useEffect(() => {
    if (otpSent && !verified) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [otpSent, verified]);

  // Clear digits on resend
  useEffect(() => {
    if (otpLoading) {
      setDigits(Array(CODE_LENGTH).fill(''));
    }
  }, [otpLoading]);

  const setDigit = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (next.every((d) => d !== '')) {
      onVerify(next.join(''));
      return;
    }

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, '');
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('') as string[];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i] ?? '';
    }
    setDigits(next);
    if (pasted.length === CODE_LENGTH) {
      onVerify(next.join(''));
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  // ── Success state ──
  if (verified) {
    return (
      <div className="mb-6 flex items-center gap-3 px-4 py-4 bg-emerald-500/5 dark:bg-emerald-500/8 rounded-xl border border-emerald-500/20">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          Teléfono verificado correctamente
        </p>
      </div>
    );
  }

  // ── Request OTP state (or expired OTP) ──
  if (!otpSent || (otpSent && expired)) {
    return (
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 bg-yellow/5 dark:bg-yellow/8 rounded-xl border border-yellow/20">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-bold text-on-surface">
            {otpSent && expired ? 'El código ha expirado' : 'Tu teléfono no está verificado'}
          </p>
          <p className="text-xs text-on-surface-muted mt-0.5">
            {otpSent && expired
              ? 'Solicita un nuevo código para verificar tu número.'
              : 'Verifica tu número para acceder a todas las funciones.'}
          </p>
          {otpError && <p className="text-xs text-pink mt-1 font-semibold">{otpError}</p>}
        </div>
        <button
          onClick={otpSent && expired ? onResend : onRequestOtp}
          disabled={otpLoading}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-yellow text-text-dark text-sm font-bold hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(255,214,0,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
        >
          {otpLoading ? 'Enviando...' : otpSent && expired ? 'Reenviar código' : 'Verificar ahora'}
        </button>
      </div>
    );
  }

  // ── OTP code input state ──
  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  return (
    <div className="mb-6 px-4 py-5 bg-turquoise/5 dark:bg-turquoise/8 rounded-xl border border-turquoise/20">
      <div className="flex items-start gap-3 mb-4">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-bold text-on-surface">Ingresa el código de verificación</p>
          <p className="text-xs text-on-surface-muted mt-0.5">
            Enviamos un código de {CODE_LENGTH} dígitos a <span className="font-bold text-on-surface">{phone}</span>
          </p>
        </div>
        {/* Countdown */}
        <span
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums"
          style={{
            background: 'rgba(0,197,212,0.1)',
            color: '#00C5D4',
          }}
          aria-label={`Tiempo restante: ${display}`}
        >
          {display}
        </span>
      </div>

      {/* Code input */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-4">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={verifyLoading}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 1) setDigit(i, val);
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-xl border-2 transition-all duration-200 outline-none bg-surface text-on-surface focus:border-turquoise focus:ring-2 focus:ring-turquoise/20 disabled:opacity-50"
            style={{ borderColor: digit ? 'var(--color-turquoise)' : 'var(--stroke)' }}
            aria-label={`Dígito ${i + 1}`}
          />
        ))}
      </div>

      {/* Errors */}
      {(verifyError ?? otpError) && (
        <p className="text-xs text-pink font-semibold text-center mb-3">
          {verifyError ?? otpError}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onVerify(code)}
          disabled={!isComplete || verifyLoading}
          className="w-full max-w-[16rem] px-5 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {verifyLoading ? 'Verificando...' : 'Verificar código'}
        </button>
        <button
          onClick={onResend}
          disabled={otpLoading}
          className="text-xs font-semibold text-on-surface-muted hover:text-turquoise transition-colors duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:text-turquoise"
        >
          {otpLoading ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
        </button>
      </div>
    </div>
  );
}
