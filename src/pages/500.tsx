import {
  ErrorPageShell,
  PrimaryButton,
  SecondaryButton,
} from '@/shared/components/ErrorPageShell';
import { WrenchIcon } from '@/shared/components/ErrorPageShell/ErrorIcons';

export default function ServerErrorPage() {
  return (
    <ErrorPageShell
      icon={<WrenchIcon />}
      headline="Estamos arreglando unas cositas"
      subtitle="Algo no salió como esperábamos. Estamos trabajándolo para que todo funcione perfecto."
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
      <SecondaryButton href="/">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7z" />
        </svg>
        Ir al inicio
      </SecondaryButton>
    </ErrorPageShell>
  );
}
