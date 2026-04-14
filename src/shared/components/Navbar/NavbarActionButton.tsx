import Link from 'next/link';
import type { ReactNode } from 'react';

interface NavbarActionButtonProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export function NavbarActionButton({ href, label, icon }: NavbarActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2 rounded-xl no-underline text-on-surface-muted transition-all duration-200 hover:text-turquoise hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
    >
      <span
        aria-hidden="true"
        className="transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-px"
      >
        {icon}
      </span>
      <span className="text-[0.625rem] font-bold">{label}</span>
    </Link>
  );
}
