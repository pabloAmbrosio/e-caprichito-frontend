import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthModalStore } from '../../store/authModalStore';
import { AuthStepIdentifier } from './AuthStepIdentifier';
import { AuthStepPassword } from './AuthStepPassword';
import { AuthStepRegister } from './AuthStepRegister';

type Step =
  | { type: 'identifier' }
  | { type: 'password'; identifier: string }
  | { type: 'register'; identifier: string; identifierType: 'phone' | 'email' | 'username' };

export function AuthModal() {
  const isOpen = useAuthModalStore((s) => s.isOpen);
  const close = useAuthModalStore((s) => s.close);

  const [step, setStep] = useState<Step>({ type: 'identifier' });
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isAnimating, setIsAnimating] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep({ type: 'identifier' });
      setSlideDirection('left');
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      // Focus the first input inside the panel
      const firstInput = panelRef.current?.querySelector<HTMLElement>('input, button[type="submit"]');
      firstInput?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const goToStep = useCallback((newStep: Step, direction: 'left' | 'right') => {
    setSlideDirection(direction);
    setIsAnimating(true);
    // Brief delay for exit animation
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 150);
  }, []);

  const handleUserExists = useCallback((identifier: string) => {
    goToStep({ type: 'password', identifier }, 'left');
  }, [goToStep]);

  const handleUserNew = useCallback((identifier: string, identifierType: 'phone' | 'email' | 'username') => {
    goToStep({ type: 'register', identifier, identifierType }, 'left');
  }, [goToStep]);

  const handleBack = useCallback(() => {
    goToStep({ type: 'identifier' }, 'right');
  }, [goToStep]);

  const handleSuccess = useCallback(() => {
    close();
  }, [close]);

  // Slide animation class
  const slideClass = isAnimating
    ? slideDirection === 'left'
      ? 'translate-x-[-1rem] opacity-0'
      : 'translate-x-[1rem] opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[80] bg-[#1A1A2E]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Desktop: Drawer (>= lg) ── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-hidden={!isOpen}
        className={`
          fixed z-[90] bg-surface overflow-hidden flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]

          /* Mobile: centered modal */
          inset-0 m-auto
          w-[min(24rem,92vw)] max-h-[min(40rem,90vh)]
          rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}

          /* Desktop: right drawer */
          lg:inset-auto lg:top-0 lg:right-0 lg:bottom-0 lg:m-0
          lg:w-[min(28rem,90vw)] lg:max-h-none
          lg:rounded-none lg:rounded-l-2xl
          lg:shadow-[-8px_0_30px_rgba(0,0,0,0.15)]
          ${isOpen ? 'lg:translate-x-0 lg:scale-100' : 'lg:translate-x-full lg:scale-100'}
        `}
      >
        {/* Brand gradient stripe */}
        <div
          aria-hidden="true"
          className="h-[0.1875rem] shrink-0"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <Link
            href="/"
            onClick={close}
            aria-label="La Central Caribeña — Ir al inicio"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
          >
            <span
              className="font-pacifico text-xl block leading-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
            >
              La Central
            </span>
            <span className="font-nunito text-[0.5625rem] font-black uppercase tracking-widest text-orange">
              Caribeña
            </span>
          </Link>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-xl text-on-surface-muted hover:text-turquoise hover:bg-turquoise/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div aria-hidden="true" className="mx-6 h-px bg-stroke shrink-0" />

        {/* Step content with slide transitions */}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-7 lg:py-8">
          <div className={`transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${slideClass}`}>
            {step.type === 'identifier' && (
              <AuthStepIdentifier
                onUserExists={handleUserExists}
                onUserNew={handleUserNew}
              />
            )}
            {step.type === 'password' && (
              <AuthStepPassword
                identifier={step.identifier}
                onBack={handleBack}
                onSuccess={handleSuccess}
              />
            )}
            {step.type === 'register' && (
              <AuthStepRegister
                identifier={step.identifier}
                identifierType={step.identifierType}
                onBack={handleBack}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 border-t border-stroke">
          <p className="text-center text-xs text-on-surface-muted font-semibold">
            Tu tienda caribeña favorita ✦
          </p>
        </div>
      </div>
    </>
  );
}
