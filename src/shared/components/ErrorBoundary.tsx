import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
  ErrorPageShell,
  PrimaryButton,
} from '@/shared/components/ErrorPageShell';

/* ── Alert icon (same style as _error.tsx) ── */
function CrashIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <circle
        cx="40"
        cy="40"
        r="32"
        stroke="#F0177A"
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Lightning bolt — crash/unexpected */}
      <path
        d="M44 20 L34 42 H42 L36 60 L52 36 H44 Z"
        stroke="#F0177A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="#F0177A"
        fillOpacity="0.15"
      />
      {/* Sparkle fragments */}
      <circle cx="22" cy="24" r="1.5" fill="#00C5D4" opacity="0.4" />
      <circle cx="60" cy="58" r="1.5" fill="#00C5D4" opacity="0.4" />
      <circle cx="18" cy="56" r="1" fill="#FF7A00" opacity="0.3" />
      <circle cx="62" cy="22" r="1" fill="#FF7A00" opacity="0.3" />
    </svg>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPageShell
          icon={<CrashIcon />}
          headline="Ups, algo falló"
          subtitle="Algo se rompió en la página. Prueba recargar."
        >
          <PrimaryButton onClick={() => window.location.reload()}>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.033l.364.363a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.397h-.065zm-1.7-5.97a.75.75 0 0 0-.364-.363A7 7 0 0 0 1.536 8.228a.75.75 0 1 0 1.449.396 5.5 5.5 0 0 1 9.2-2.466l.313.311H10.05a.75.75 0 0 0 0 1.5H13.8a.75.75 0 0 0 .75-.75V3.47a.75.75 0 0 0-1.5 0v2.033l-.438.049z"
                clipRule="evenodd"
              />
            </svg>
            Recargar página
          </PrimaryButton>
        </ErrorPageShell>
      );
    }

    return this.props.children;
  }
}
