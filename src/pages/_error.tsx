import type { NextPageContext } from 'next';
import {
  ErrorPageShell,
  PrimaryButton,
} from '@/shared/components/ErrorPageShell';

/* ── Alert circle SVG ── */
function AlertIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      {/* Outer circle */}
      <circle
        cx="40"
        cy="40"
        r="32"
        stroke="#F0177A"
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Inner circle */}
      <circle
        cx="40"
        cy="40"
        r="24"
        stroke="#F0177A"
        strokeWidth="1.5"
        opacity="0.15"
      />
      {/* Exclamation line */}
      <path
        d="M40 26 L40 44"
        stroke="#F0177A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Exclamation dot */}
      <circle cx="40" cy="52" r="2" fill="#F0177A" opacity="0.8" />
      {/* Small decorative crosses */}
      <g opacity="0.3">
        <path d="M14 18 L18 18 M16 16 L16 20" stroke="#00C5D4" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 60 L66 60 M64 58 L64 62" stroke="#00C5D4" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

interface ErrorPageProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorPageProps) {

  console.log("ocurrio un error")
  const headline = statusCode
    ? `Error ${statusCode}`
    : 'Algo salió mal';

  return (
    <ErrorPageShell
      icon={<AlertIcon />}
      headline={headline}
      subtitle="Encontramos un problema inesperado. Si sigue pasando, escríbenos."
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
        Intentar de nuevo
      </PrimaryButton>
    </ErrorPageShell>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
