import {
  ErrorPageShell,
  PrimaryButton,
} from '@/shared/components/ErrorPageShell';
import { CompassIcon } from '@/shared/components/ErrorPageShell/ErrorIcons';

export default function NotFoundPage() {
  return (
    <ErrorPageShell
      icon={<CompassIcon />}
      headline="Página no encontrada"
      subtitle="Lo sentimos, la página que buscas no existe o fue movida. Verifica la URL o vuelve al inicio."
    >
      <PrimaryButton href="/">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7z" />
        </svg>
        Volver al inicio
      </PrimaryButton>
    </ErrorPageShell>
  );
}
