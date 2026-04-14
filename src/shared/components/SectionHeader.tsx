import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewAllHref: string;
}

export function SectionHeader({ title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
        <span
          className="block w-1 h-5 rounded-sm"
          style={{ background: 'linear-gradient(180deg,#00C5D4,#F0177A)' }}
          aria-hidden="true"
        />
        {title}
      </h2>
      <Link
        href={viewAllHref}
        className="text-pink font-extrabold text-xs no-underline hover:text-pink-light transition-colors duration-150"
      >
        Ver todas →
      </Link>
    </div>
  );
}
