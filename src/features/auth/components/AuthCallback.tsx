import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useAuthModalStore } from '../store/authModalStore';
import { readTempAccessTokenCookie, clearTempAccessTokenCookie } from '../infrastructure/jwtService';

export function AuthCallback() {
  const router = useRouter();
  const { initializeFromToken } = useAuth();
  const openAuthModal = useAuthModalStore((s) => s.open);
  const processedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // En Next.js Pages Router, router.query está vacío en el primer render.
    // Esperar a que esté listo para poder leer ?error= si existe.
    if (!router.isReady) return;
    if (processedRef.current) return;
    processedRef.current = true;

    const errorParam = router.query.error;
    if (errorParam) {
      const msg = typeof errorParam === 'string' ? errorParam : errorParam[0];
      setStatus('error');
      setErrorMsg(msg ?? 'Error desconocido');
      return;
    }

    const token = readTempAccessTokenCookie();
    if (!token) {
      setStatus('error');
      setErrorMsg('No se recibió token de autenticación. Intenta de nuevo.');
      return;
    }

    clearTempAccessTokenCookie();
    initializeFromToken(token);
    void router.push('/');
  }, [router, router.isReady, initializeFromToken]);

  // Timeout de seguridad: si lleva mucho tiempo en loading, mostrar opción de volver
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error');
        setErrorMsg('La autenticación tardó demasiado. Intenta de nuevo.');
      }
    }, 10_000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 font-nunito">
        <div className="flex items-center gap-2.5 bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 rounded-xl px-5 py-4 max-w-md">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-pink text-sm font-semibold">{errorMsg}</p>
        </div>
        <button
          type="button"
          onClick={() => { void router.push('/'); openAuthModal(); }}
          className="text-turquoise hover:text-turquoise-dark font-bold text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 rounded outline-none"
        >
          Volver a iniciar sesion
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-nunito">
      {/* Spinner */}
      <div
        className="w-10 h-10 rounded-full border-[3px] border-turquoise/20 border-t-turquoise animate-spin"
        aria-hidden="true"
      />
      <p className="text-base font-semibold text-on-surface-muted">Autenticando...</p>
    </div>
  );
}
