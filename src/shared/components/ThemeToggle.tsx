import { useState, useEffect } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? (isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro') : 'Cambiar tema'}
      className="group flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] px-2 rounded-xl text-on-surface-muted transition-all duration-200 hover:text-turquoise hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
      </span>
    </button>
  );
}
