import { ErrorPageShell } from '@/shared/components/ErrorPageShell';
import { ClockIcon } from '@/shared/components/ErrorPageShell/ErrorIcons';

export default function MaintenancePage() {
  return (
    <ErrorPageShell
      icon={<ClockIcon />}
      headline="Volvemos en un momento"
      subtitle="Estamos mejorando la tienda para ti. No tarda mucho, prometido."
    >
      {/* Subtle animated dots to show something is happening */}
      <div className="flex items-center gap-1.5 justify-center" aria-hidden="true">
        <span
          className="w-2 h-2 rounded-full bg-turquoise/50 animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-pink/50 animate-pulse"
          style={{ animationDelay: '300ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-orange/50 animate-pulse"
          style={{ animationDelay: '600ms' }}
        />
      </div>
    </ErrorPageShell>
  );
}
