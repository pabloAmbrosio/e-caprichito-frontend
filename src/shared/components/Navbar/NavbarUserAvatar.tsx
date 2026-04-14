import Link from 'next/link';

interface NavbarUserAvatarProps {
  username: string;
  href?: string;
}

export function NavbarUserAvatar({ username, href = '/account' }: NavbarUserAvatarProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <Link
      href={href}
      aria-label={`Mi cuenta — ${username}`}
      className="group flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2 rounded-xl no-underline transition-all duration-200 hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full text-[0.6875rem] font-extrabold text-white shadow-[0_2px_8px_rgba(0,197,212,0.25)] transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-px group-hover:shadow-[0_4px_12px_rgba(0,197,212,0.35)]"
        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        aria-hidden="true"
      >
        {initial}
      </span>
      <span className="text-[0.625rem] font-bold text-on-surface-muted group-hover:text-turquoise transition-colors duration-200 max-w-[4rem] truncate">
        {username}
      </span>
    </Link>
  );
}
